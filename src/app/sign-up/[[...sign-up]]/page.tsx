import { SignUp } from "@clerk/nextjs";
import Logo from "@/components/Logo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo variant="dark" showRatingBadge={false} />
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-2xl rounded-3xl border border-slate-100",
          },
        }}
      />
    </div>
  );
}
