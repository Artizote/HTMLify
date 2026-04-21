"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  LoginSchema,
  loginSchema,
  SignUpSchema,
  signUpSchema,
} from "@/lib/modules/auth/auth.schema";
import { signIn, signUp } from "@/lib/modules/auth/client.actons";
import { cn } from "@/lib/utils";

const modeConfig = {
  signin: {
    title: "Sign in to your account",
    description: "Enter your credentials below to sign in",
    buttonLabel: "Sign in",
    footer: (
      <>
        Don&apos;t have an account? <Link href="/signup">Sign up</Link>
      </>
    ),
  },
  signup: {
    title: "Create an account",
    description: "Enter your details below to create your account",
    buttonLabel: "Sign up",
    footer: (
      <>
        Already have an account? <Link href="/signin">Sign in</Link>
      </>
    ),
  },
};

interface SigninFormProps extends React.ComponentProps<"div"> {
  mode: "signin" | "signup";
}

export function SigninForm({ mode, className, ...props }: SigninFormProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const config = modeConfig[mode];

  const form = useForm<LoginSchema | SignUpSchema>({
    resolver: zodResolver(mode === "signin" ? loginSchema : signUpSchema),
    defaultValues: { username: "", password: "", email: "" },
  });

  const handleSubmit = async (data: LoginSchema | SignUpSchema) => {
    setIsPending(true);
    try {
      if (mode === "signin") {
        await signIn(data as LoginSchema);
      } else {
        await signUp(data as SignUpSchema);
      }

      toast.success(
        mode === "signup"
          ? "Account created! Welcome"
          : "Signed in successfully",
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Username</FieldLabel>
                    <Input {...field} placeholder="Enter your username" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel>Password</FieldLabel>
                      {mode === "signin" && (
                        <Link
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      )}
                    </div>
                    <Input {...field} type="password" placeholder="Password" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {mode === "signup" && (
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input {...field} placeholder="Email" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
              <Field>
                <Button type="submit" disabled={isPending}>
                  {config.buttonLabel}
                </Button>
                <FieldDescription className="text-center">
                  {config.footer}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
