import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase's email confirmation link redirects the browser here with
// ?code=... (PKCE flow, the modern default for new projects). Landing on
// a page with that code in the URL does NOT sign anyone in by itself —
// this exchange step is what actually establishes the session, setting
// real auth cookies via the server client, before we send them on to
// the login page's "you're verified" pop-up.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/login?verified=1`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
