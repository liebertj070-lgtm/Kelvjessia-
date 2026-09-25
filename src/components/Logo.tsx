import Image from "next/image";

export function Logo({
  className = "",
  variant = "dark",
  markClassName = "h-8 w-9",
}: {
  className?: string;
  variant?: "dark" | "light";
  markClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`relative shrink-0 ${markClassName}`}>
        <Image
          src="/logo.png"
          alt="Kelvjessia"
          fill
          sizes="40px"
          className="object-contain"
          priority
        />
      </span>
      <span
        className={`text-lg font-semibold tracking-tight ${
          variant === "light" ? "text-white" : "text-neutral-900"
        }`}
      >
        Kelvjessia
      </span>
    </span>
  );
}
