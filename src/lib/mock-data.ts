import { formatNaira } from "@/lib/routes-data";

// Placeholder data standing in for a real session + bookings table.
// Every field here is called out in the build spec §3.5 as something that
// must come from live state, not be hardcoded — replace this whole file
// once Supabase Auth (Phase 2) and the bookings schema (Phase 3/4) exist.

export const MOCK_WALLET_BALANCE_NAIRA = 1250;

export const MOCK_USER = {
  firstName: "David",
  lastName: "Ogbologu",
  fullName: "Ogbologu David",
  initials: "JD",
  email: "david@example.com",
  phone: "0707 734 8537",
  defaultPickup: "AUI Main Gate, Ilara-Epe",
  affiliateId: "AUI/2023/0451",
  tripsCount: 12,
  parcelsCount: 4,
};

export type PaymentMethod = {
  id: string;
  label: string;
  sublabel: string;
  isDefault: boolean;
};

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "card-4417", label: "Mastercard ending 4417", sublabel: "Expires 09/29", isDefault: true },
  { id: "wallet", label: "Kelvjesse wallet", sublabel: `Balance ${formatNaira(MOCK_WALLET_BALANCE_NAIRA)}`, isDefault: false },
];

export const MOCK_SAVED_ROUTES = [
  { fromCity: "Ilara-Epe", toCity: "Lekki" },
  { fromCity: "Ilara-Epe", toCity: "Surulere" },
];

export type NotificationCategory = "trip" | "delivery" | "offer";

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  time: string;
  group: "Today" | "Earlier this week";
  read: boolean;
  href?: string;
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    category: "trip",
    title: "Your bus has departed",
    body: "Bus KJ-04 left Ilara-Epe at 9:52 AM. Track it live.",
    time: "2 min ago",
    group: "Today",
    read: false,
    href: "/track?kind=seat&to=lekki&dir=outbound&seats=B3,B4&passengers=2&reference=KJ-2609-B34&amount=5000",
  },
  {
    id: "n2",
    category: "trip",
    title: "Payment successful",
    body: "₦5,000 received for booking KJ-2609-B34.",
    time: "38 min ago",
    group: "Today",
    read: false,
    href: "/confirmation?to=lekki&seats=B3,B4&reference=KJ-2609-B34&amount=5000&paid=card",
  },
  {
    id: "n3",
    category: "trip",
    title: "Seats confirmed",
    body: "B3 and B4 are reserved for Friday, 18 September.",
    time: "1 hr ago",
    group: "Today",
    read: true,
    href: "/confirmation?to=lekki&seats=B3,B4&reference=KJ-2609-B34&amount=5000&paid=card",
  },
  {
    id: "n4",
    category: "delivery",
    title: "Parcel delivered",
    body: "Your package to Surulere was signed for by Chinaza O.",
    time: "Thu, 10 Sep",
    group: "Earlier this week",
    read: true,
    href: "/history",
  },
  {
    id: "n5",
    category: "offer",
    title: "20% off Sangotedo runs",
    body: "Use code CAMPUS20 before the end of the month.",
    time: "Mon, 7 Sep",
    group: "Earlier this week",
    read: true,
    href: "/select-route?to=sangotedo",
  },
];

export type Faq = { question: string; answer: string };

// Only the first (expanded) answer on each screenshot is real copy from
// the design. Q2–Q5 were collapsed in both screenshots, so their answers
// below are written to fit the product, not lifted from Figma — flag for
// the client to review/replace with real policy text.
export const FAQS_DESKTOP: Faq[] = [
  {
    question: "How early should I arrive before departure?",
    answer:
      "Arrive at the AUI main gate at least 15 minutes before your departure time. Buses leave on schedule and seats are released after a 5-minute grace period.",
  },
  {
    question: "Can I cancel or reschedule a booking?",
    answer:
      "Yes — from Trip History, open the booking and choose Cancel or Reschedule. Cancellations made more than 2 hours before departure are refunded to your wallet.",
  },
  {
    question: "What items are not allowed in a parcel?",
    answer:
      "No cash, jewellery, weapons, perishable food, or other restricted items. See the full list on the Send a Package screen.",
  },
  {
    question: "How do I claim a refund for a cancelled trip?",
    answer:
      "Refunds for cancelled trips are issued automatically to your original payment method within 3–5 business days.",
  },
  {
    question: "Do you run trips on public holidays?",
    answer:
      "Yes, on a reduced schedule. Check the departure times on Select Route — holiday schedules are shown automatically on those dates.",
  },
];

export const FAQS_MOBILE: Faq[] = [
  {
    question: "How early should I arrive?",
    answer:
      "Arrive at the AUI main gate at least 15 minutes before departure. Seats are released after a 5-minute grace period.",
  },
  {
    question: "Can I cancel or reschedule?",
    answer:
      "Yes — open the booking from Trip History and choose Cancel or Reschedule.",
  },
  {
    question: "What items are not allowed?",
    answer: "No cash, jewellery, weapons, or perishable food.",
  },
  {
    question: "How do I claim a refund?",
    answer: "Refunds are issued to your original payment method within 3–5 business days.",
  },
];

// Same reference (KJ-2609-B34) as the Booking Confirmation mock from
// Phase 4 and the Track Trip screenshot — was "Ajah" here before, which
// didn't match either of those; fixed to Lekki so it's one consistent
// storyline across Home, Confirmation and Track.
export const MOCK_ACTIVE_TRIP = {
  reference: "KJ-2609-B34",
  fromCity: "Ilara-Epe",
  toCity: "Lekki",
  destinationSlug: "lekki",
  status: "In transit" as const,
  departedAt: "9:52 AM",
  eta: "11:03 AM",
  arrivingInMinutes: 18,
  seats: ["B3", "B4"],
  passengers: 2,
  pickup: "AUI Main Gate",
  amountPaidNaira: 5000,
  bus: "KJ-04",
  progressPercent: 45,
  driver: {
    name: "Emeka Obi",
    initials: "EO",
    vehicle: "Toyota Hiace",
    plate: "LND-284-KJ",
    phone: "+2348012345678",
  },
  timeline: [
    { label: "Booking confirmed", time: "7:32 AM", detail: "Payment received", done: true },
    { label: "Dispatched from Ilara-Epe", time: "9:52 AM", detail: "Bus KJ-04, driver Emeka", done: true },
    { label: "In transit", time: "Now", detail: "Passing Epe–Lekki expressway", done: false, active: true },
    { label: "Arriving at Lekki", time: "Est. 11:03 AM", detail: "Phase 1 Roundabout", done: false },
  ],
};

export const MOCK_NEXT_DEPARTURES = [
  { city: "Lekki", seatsLeft: 6, time: "10:00 AM" },
  { city: "Surulere", seatsLeft: 11, time: "2:00 PM" },
  { city: "Festac", seatsLeft: 3, time: "5:00 PM" },
];

export type TripStatus = "In transit" | "Completed" | "Delivered" | "Cancelled";
export type TripKind = "trip" | "delivery";

export type HistoryEntry = {
  reference: string;
  kind: TripKind;
  fromCity: string;
  toCity: string;
  date: string;
  detail: string; // "Seats B3, B4" or "Parcel · 4.2kg"
  amountNaira: number;
  status: TripStatus;
};

export const MOCK_HISTORY: HistoryEntry[] = [
  {
    reference: "KJ-2609-B34",
    kind: "trip",
    fromCity: "Ilara-Epe",
    toCity: "Lekki",
    date: "Fri, 18 Sep",
    detail: "10:00 AM · Seats B3, B4",
    amountNaira: 5000,
    status: "In transit",
  },
  {
    reference: "KJ-1309-A02",
    kind: "trip",
    fromCity: "Ajah",
    toCity: "Ilara-Epe",
    date: "Sun, 13 Sep",
    detail: "6:00 PM · Seat A2",
    amountNaira: 2200,
    status: "Completed",
  },
  {
    reference: "KJ-1009-P01",
    kind: "delivery",
    fromCity: "Ilara-Epe",
    toCity: "Surulere",
    date: "Thu, 10 Sep",
    detail: "Parcel · 4.2kg",
    amountNaira: 4500,
    status: "Delivered",
  },
  {
    reference: "KJ-0509-C01",
    kind: "trip",
    fromCity: "Ilara-Epe",
    toCity: "Maryland",
    date: "Sat, 5 Sep",
    detail: "7:00 AM · Seat C1",
    amountNaira: 3200,
    status: "Completed",
  },
  {
    reference: "KJ-3108-D04",
    kind: "trip",
    fromCity: "Festac",
    toCity: "Ilara-Epe",
    date: "Mon, 31 Aug",
    detail: "5:00 PM · Seat D4",
    amountNaira: 3500,
    status: "Cancelled",
  },
];
