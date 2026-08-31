import Image from "next/image";
import Link from "next/link";

export function BrandMark({
  href = "/",
  size = "md",
  className = "",
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const px = size === "lg" ? 56 : size === "sm" ? 28 : 36;
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";

  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/olama-mark.png"
        alt="Olama"
        width={px}
        height={px}
        unoptimized
        className="rounded-2xl"
        priority
      />
      <span className={`${text} hidden font-semibold tracking-tight text-foreground min-[380px]:inline`}>
        Olama
      </span>
    </Link>
  );
}
