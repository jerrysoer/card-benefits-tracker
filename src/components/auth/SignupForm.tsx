"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/demo/data";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isDemoMode()) {
      router.push("/dashboard");
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
          shouldCreateUser: true,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-border bg-bg-card p-8 text-center">
        <div className="mb-3 text-2xl">&#9993;</div>
        <h2 className="mb-2 text-lg font-semibold text-text-primary">
          Check your email
        </h2>
        <p className="text-sm text-text-secondary">
          Check your email to confirm your account. It may take a minute to
          arrive.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-bg-card p-8"
    >
      <div className="mb-6">
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-text-secondary"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent"
        />
      </div>

      {error && (
        <p className="mb-4 text-sm text-red">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
