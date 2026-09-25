import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { insertBooking } from "@/lib/supabase/queries";
import { decodeBooking } from "@/lib/booking";
import type { BookingRow } from "@/lib/supabase/database.types";

// Wallet and pay-on-pickup never touch Paystack, so there's no external
// verification step to hang the DB write off of — this route is that
// write, run server-side under the signed-in user's own session so RLS
// (`bookings: insert own`) can enforce user_id = auth.uid() itself.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const bookingParams = body.bookingParams as Record<string, string>;
  const reference = body.reference as string;
  const amountNaira = Number(body.amountNaira);
  const paidStatus = body.paidStatus as BookingRow["paid_status"];
  const paymentMethod = body.paymentMethod as string;

  const booking = decodeBooking(bookingParams);
  if (!booking || !reference || !amountNaira) {
    return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
  }

  const { row, error, seatConflict } = await insertBooking(supabase, {
    userId: user.id,
    booking,
    reference,
    amountNaira,
    paidStatus,
    paymentMethod,
  });

  if (error || !row) {
    return NextResponse.json(
      { error: error ?? "Could not save booking.", seatConflict: Boolean(seatConflict) },
      { status: seatConflict ? 409 : 500 }
    );
  }

  return NextResponse.json({ reference: row.reference });
}
