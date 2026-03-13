import SignupForm from "@/components/auth/SignupForm";
import OAuthButtons from "@/components/auth/OAuthButtons";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary">CardClock</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Your benefits are ticking
          </p>
        </div>

        <div className="space-y-4">
          <SignupForm />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <OAuthButtons />
        </div>
      </div>
    </div>
  );
}
