import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isAdmin()) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-20 sm:px-6 sm:py-24">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">Sign in to upload</h1>
        <p className="mb-8 text-muted">
          Anyone with a share link can watch. Only you can add videos.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
