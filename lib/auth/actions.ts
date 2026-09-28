"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: passwordSchema,
  next: z.string().optional(),
});

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: passwordSchema,
});

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function authError(message = "Authentication failed. Please check your details and try again.") {
  return "/login?error=" + encodeURIComponent(message);
}

function registerError(message: string) {
  return "/register?error=" + encodeURIComponent(message);
}

function forgotPasswordPath(message: string, type: "error" | "message") {
  return "/forgot-password?" + type + "=" + encodeURIComponent(message);
}

function resetPasswordError(message: string) {
  return "/reset-password?error=" + encodeURIComponent(message);
}




const recoveryEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

const newPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
});

export async function requestPasswordReset(formData: FormData) {
  const parsed = recoveryEmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect(forgotPasswordPath("Enter a valid email address.", "error"));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: supabaseSiteUrl + "/auth/confirm?next=/reset-password",
  });

  if (error) {
    const errorCode = error.code?.toLowerCase() ?? "";
    const message =
      errorCode === "over_email_send_rate_limit" || error.status === 429
        ? "Password reset emails are temporarily rate limited. Please wait before requesting another reset email."
        : "We could not start the password reset. Please try again later.";

    redirect(forgotPasswordPath(message, "error"));
  }

  redirect(
    forgotPasswordPath(
      "If an account exists for that email, a password reset link has been sent.",
      "message",
    ),
  );
}

export async function updatePassword(formData: FormData) {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message ?? "Enter a valid password.";
    redirect(resetPasswordError(issue));
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    redirect(resetPasswordError("Passwords do not match."));
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims?.claims?.sub) {
    redirect(resetPasswordError("This reset link is invalid or has expired. Request a new one."));
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    redirect(resetPasswordError("We could not update your password. Please request a new reset link."));
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=Password%20updated.%20You%20can%20now%20sign%20in.");
}
