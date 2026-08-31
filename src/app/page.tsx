import Image from "next/image";
import { DownloadWaitlist } from "@/components/download-waitlist";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col bg-background lg:grid lg:h-dvh lg:max-h-dvh lg:grid-cols-2 lg:overflow-hidden">
      <div className="relative h-56 shrink-0 p-6 pt-20 sm:h-80 sm:p-10 sm:pt-20 lg:h-auto lg:min-h-0 lg:p-14">
        <div className="relative h-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10">
          <Image
            src="/landing-llama.jpg"
            alt="Llama in sunglasses at the helm"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="rounded-3xl object-cover object-[center_20%]"
          />
        </div>
      </div>
      <section className="flex min-h-0 flex-1 flex-col justify-center gap-5 px-5 py-6 pb-16 sm:gap-6 sm:px-8 sm:py-10 sm:pb-16 lg:px-14">
        <h1 className="max-w-md text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
          Instant Screen Recording and App Demo
        </h1>
        <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg">
          Productivity app that lets you record your screen with camera overlay and instantly share video link with anyone.
        </p>
        <DownloadWaitlist />
      </section>
      <p className="pointer-events-none absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-xs text-muted">
        © 2026 Olama
      </p>
    </main>
  );
}
