"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseSiteUrl } from "@/lib/supabase/config";

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

const recoveryEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

const newPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
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

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    redirect(authError("Please enter a valid email and password."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect(authError("Unable to sign in with those credentials."));
  }

  revalidatePath("/", "layout");
  redirect(safeNextPath(parsed.data.next));
}

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const issue =
      parsed.error.issues[0]?.message ??
      "Please check your registration details.";
    redirect(registerError(issue));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const errorText = error.message.toLowerCase();
    const errorCode = error.code?.toLowerCase() ?? "";

    const message =
      errorCode === "over_email_send_rate_limit"
        ? "Hostivo's email service has reached its temporary sending limit. Disable Confirm Email for direct signup, or configure custom SMTP for email-based verification."
        : errorCode === "over_request_rate_limit" || error.status === 429
          ? "Hostivo is temporarily rate limiting account creation. Please wait a few minutes, then submit the form once."
          : errorText.includes("already registered") ||
              errorText.includes("already been registered") ||
              errorText.includes("user already")
            ? "That email is already registered. Try signing in instead."
            : "Unable to create the account right now. Please check the details and try again.";

    redirect(registerError(message));
  }

  if (!data.user || !data.session) {
    redirect(
      registerError(
        "Account creation is waiting for email confirmation. Hostivo uses direct email-and-password sign-in, so Confirm Email must be disabled in Supabase Auth.",
      ),
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

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
    redirect(
      resetPasswordError(
        "This reset link is invalid or has expired. Request a new one.",
      ),
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    redirect(
      resetPasswordError(
        "We could not update your password. Please request a new reset link.",
      ),
    );
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=Password%20updated.%20You%20can%20now%20sign%20in.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=Signed%20out.");
}
