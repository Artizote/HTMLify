import { SigninForm } from "@/components/auth/auth-form";

export default function Login() {
  return (
    <div className="flex  w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SigninForm mode="signin" />
      </div>
    </div>
  );
}
