/** A small dot with a soft expanding ping ring — for anything that's
 * genuinely live/real-time (an in-progress trip's status badge, Track's
 * "Live" pill, an unread notification). Not for static badges like
 * "Verified" — pulsing something that isn't actually live is misleading. */
export function LiveDot({
  size = "h-1.5 w-1.5",
  color = "bg-success",
  className = "",
}: {
  size?: string;
  color?: string;
  className?: string;
}) {
  return (
    <span className={`relative inline-flex ${size} ${className}`}>
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`}
      />
      <span className={`relative inline-flex ${size} rounded-full ${color}`} />
    </span>
  );
}
