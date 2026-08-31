import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEnv } from "@/lib/env";
import { isValidVideoId } from "@/lib/ids";
import { getVideo } from "@/lib/videos";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isValidVideoId(id)) {
    return { title: "Not found" };
  }
  const video = getVideo(id);
  if (!video) {
    return { title: "Not found" };
  }
  const env = getEnv();
  const url = `${env.appUrl}/v/${id}`;
  const poster = `${env.appUrl}/v/${id}/poster`;
  const file = `${env.appUrl}/v/${id}/file`;
  const description = "Watch this video on Olama.";

  return {
    title: video.title,
    description,
    openGraph: {
      title: video.title,
      description,
      type: "video.other",
      url,
      images: [{ url: poster, width: 1280, height: 720 }],
      videos: [{ url: file, type: video.mimeType }],
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description,
      images: [poster],
    },
  };
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  if (!isValidVideoId(id)) {
    notFound();
  }
  const video = getVideo(id);
  if (!video) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-24">
      <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-border sm:rounded-3xl">
        <video
          className="block h-auto w-full bg-transparent"
          controls
          playsInline
          preload="metadata"
          poster={`/v/${id}/poster`}
        >
          <source src={`/v/${id}/file`} type={video.mimeType} />
          Your browser does not support video playback.
        </video>
      </div>
      <h1 className="mt-5 text-xl font-semibold tracking-tight break-words sm:mt-6 sm:text-2xl">
        {video.title}
      </h1>
    </main>
  );
}
