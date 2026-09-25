// The mid-flow auth gate (Phase 2 checklist item 3). Originally let guests
// start a booking before requiring an account; the client dropped the
// guest path entirely, so every one of these now requires a real session.

export const AUTH_REQUIRED_PATHS = [
  "/home",
  "/track",
  "/history",
  "/profile",
  "/notifications",
  "/select-route",
  "/book-seat",
  "/send-package",
  "/fare-summary",
  "/payment",
  "/confirmation",
  "/admin",
];

export function pathRequiresAuth(pathname: string): boolean {
  return AUTH_REQUIRED_PATHS.some((p) => pathname.startsWith(p));
}
