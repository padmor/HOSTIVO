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
    const issue = parsed.error.issues[0]?.message ?? "Please check your registration details.";
    redirect(registerError(issue));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const errorText = error.message.toLowerCase();

    const message =
      error.status === 429
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
        "Account creation is waiting for email confirmation. Hostivo uses direct email-and-password sign-in, so Confirm Email must be disabled in Supabase Auth."
      )
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=Signed%20out.");
}
