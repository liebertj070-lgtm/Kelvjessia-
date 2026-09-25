export function AddIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M450-450H200v-60h250v-250h60v250h250v60H510v250h-60v-250Z"/>
    </svg>
  );
}
