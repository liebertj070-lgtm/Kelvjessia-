import {
  DESTINATIONS,
  getDestination,
  formatNaira,
  type Direction,
  isDirection,
} from "@/lib/routes-data";
import { PACKAGE_SIZES, FRAGILE_HANDLING_FEE } from "@/lib/package-data";

// Confirmed from the Fare Summary / Payment screenshots:
// Seat fare x2 (5,200) + Booking fee (200) - Student discount (400) = 5,000
export const BOOKING_FEE_NAIRA = 200;

// The Figma screens call this "Student discount / AUI verified". Renamed
// here to stay consistent with the Phase 2 decision to drop student-only
// framing (this product isn't students-only even though it launches on a
// campus) — same ₦400 amount and the same "verified AUI affiliate" idea,
// just not gated to enrolled students specifically. Flagged for the client
// to confirm; trivial to rename back if they'd rather keep "Student".
export const COMMUNITY_DISCOUNT_NAIRA = 400;
export const COMMUNITY_DISCOUNT_LABEL = "AUI community discount";
export const COMMUNITY_DISCOUNT_SUBLABEL = "Verified AUI affiliate";

// Mock promo codes — no backend table yet, just enough to exercise the UI.
const PROMO_CODES: Record<string, number> = {
  WELCOME500: 500,
  CAMPUS20: 600, // referenced in the "20% off Sangotedo runs" notification
};

export function applyPromoCode(code: string): number | null {
  const amount = PROMO_CODES[code.trim().toUpperCase()];
  return amount ?? null;
}

export type SeatBooking = {
  kind: "seat";
  to: string;
  direction: Direction;
  seats: string[];
  passengers: number;
  day: string;
  date: string;
  time: string;
};

export type PackageBooking = {
  kind: "package";
  to: string;
  direction: Direction;
  description: string;
  category: string;
  size: string;
  fragile: boolean;
  recipientName: string;
  recipientPhone: string;
  pickup: string;
  dropoff: string;
};

export type Booking = SeatBooking | PackageBooking;

export function encodeBooking(b: Booking): URLSearchParams {
  const p = new URLSearchParams();
  p.set("kind", b.kind);
  p.set("to", b.to);
  p.set("dir", b.direction);
  if (b.kind === "seat") {
    p.set("seats", b.seats.join(","));
    p.set("passengers", String(b.passengers));
    p.set("day", b.day);
    p.set("date", b.date);
    p.set("time", b.time);
  } else {
    p.set("description", b.description);
    p.set("category", b.category);
    p.set("size", b.size);
    p.set("fragile", b.fragile ? "1" : "0");
    p.set("recipientName", b.recipientName);
    p.set("recipientPhone", b.recipientPhone);
    p.set("pickup", b.pickup);
    p.set("dropoff", b.dropoff);
  }
  return p;
}

export function decodeBooking(
  params: Record<string, string | undefined>
): Booking | null {
  const to = params.to;
  if (!to || !getDestination(to)) return null;
  // Default to "outbound" so older links without a dir param (e.g. the
  // saved notification hrefs) keep working exactly as before.
  const direction: Direction = isDirection(params.dir) ? params.dir : "outbound";

  if (params.kind === "package") {
    return {
      kind: "package",
      to,
      direction,
      description: params.description ?? "",
      category: params.category ?? "",
      size: params.size ?? "medium",
      fragile: params.fragile === "1",
      recipientName: params.recipientName ?? "",
      recipientPhone: params.recipientPhone ?? "",
      pickup: params.pickup ?? "",
      dropoff: params.dropoff ?? "",
    };
  }

  const seats = (params.seats ?? "").split(",").filter(Boolean);
  if (seats.length === 0) return null;

  return {
    kind: "seat",
    to,
    direction,
    seats,
    passengers: Number(params.passengers ?? seats.length),
    day: params.day ?? "",
    date: params.date ?? "",
    time: params.time ?? "",
  };
}

export type PriceBreakdown = {
  lines: { label: string; sublabel?: string; amountNaira: number; isDiscount?: boolean }[];
  subtotal: number;
  bookingFee: number;
  communityDiscount: number;
  promoDiscount: number;
  total: number;
};

export function computePrice(b: Booking, promoCode?: string | null): PriceBreakdown {
  const destination = getDestination(b.to)!;
  const promoDiscount = promoCode ? applyPromoCode(promoCode) ?? 0 : 0;

  if (b.kind === "seat") {
    const seatFare = destination.fareNaira * b.seats.length;
    const total =
      seatFare + BOOKING_FEE_NAIRA - COMMUNITY_DISCOUNT_NAIRA - promoDiscount;
    return {
      lines: [
        {
          label: `Seat fare · ${destination.city}`,
          sublabel: `× ${b.seats.length} passenger${b.seats.length > 1 ? "s" : ""}`,
          amountNaira: seatFare,
        },
      ],
      subtotal: seatFare,
      bookingFee: BOOKING_FEE_NAIRA,
      communityDiscount: COMMUNITY_DISCOUNT_NAIRA,
      promoDiscount,
      total: Math.max(0, total),
    };
  }

  const size = PACKAGE_SIZES.find((s) => s.id === b.size) ?? PACKAGE_SIZES[1];
  const packageFare = destination.packageFareNaira;
  const handling = b.fragile ? FRAGILE_HANDLING_FEE : 0;
  const subtotal = packageFare + size.feeNaira + handling;
  const total =
    subtotal + BOOKING_FEE_NAIRA - COMMUNITY_DISCOUNT_NAIRA - promoDiscount;

  return {
    lines: [
      { label: `Package fare · ${destination.city}`, amountNaira: packageFare },
      { label: `${size.label} package (${size.range})`, amountNaira: size.feeNaira },
      ...(b.fragile
        ? [{ label: "Fragile handling", amountNaira: handling }]
        : []),
    ],
    subtotal,
    bookingFee: BOOKING_FEE_NAIRA,
    communityDiscount: COMMUNITY_DISCOUNT_NAIRA,
    promoDiscount,
    total: Math.max(0, total),
  };
}

export { formatNaira, DESTINATIONS };
