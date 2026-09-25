import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Server-side only — never expose PAYSTACK_SECRET_KEY to the client.
// Card/bank-transfer details are collected on Paystack's own hosted page
// (authorization_url below), not by this app, so this route never touches
// raw card data — only an amount and a channel preference.
export async function POST(req: NextRequest) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments aren't configured yet." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { amountNaira, channels, bookingParams } = body as {
    amountNaira: number;
    channels: string[];
    bookingParams: Record<string, string>;
  };

  if (!amountNaira || amountNaira <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? "guest@kelvjessia.com";

  const origin = req.nextUrl.origin;

  const paystackRes = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amountNaira * 100), // kobo
        currency: "NGN",
        channels,
        callback_url: `${origin}/payment/callback`,
        metadata: bookingParams,
      }),
    }
  );

  const data = await paystackRes.json();

  if (!paystackRes.ok || !data.status) {
    return NextResponse.json(
      { error: data.message ?? "Could not start payment." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  });
}
