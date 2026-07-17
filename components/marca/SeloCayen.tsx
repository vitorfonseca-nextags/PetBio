import Image from "next/image";

export function SeloCayen({
  imgClassName = "h-6",
  byClassName = "text-ink-soft",
  chip = false,
  className = "",
}: {
  imgClassName?: string;
  byClassName?: string;
  chip?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${chip ? "rounded-full bg-white/95 px-2.5 py-1 shadow-sm" : ""} ${className}`}
    >
      <span className={`text-[11px] font-semibold ${byClassName}`}>by</span>
      <Image
        src="/brand/cayen-logo.png"
        alt="Cayen Semijoias"
        width={900}
        height={429}
        className={`w-auto ${imgClassName}`}
      />
    </span>
  );
}
