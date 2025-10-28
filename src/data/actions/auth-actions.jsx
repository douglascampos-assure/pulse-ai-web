"use server";
import { z } from "zod";
import { redirect } from "next/navigation";

const schemaLogin = z.object({
  identifier: z
    .string()
    .min(3, {
      message: "Identifier must have at least 3 or more characters",
    })
    .max(20, {
      message: "Please enter a valid username or email address",
    }),
  password: z
    .string()
    .min(6, {
      message: "Password must have at least 6 or more characters",
    })
    .max(100, {
      message: "Password must be between 6 and 100 characters",
    }),
});

const schemaSignup = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must have at least 3 or more characters",
    })
    .max(20, {
      message: "Please enter a valid username",
    }),
  email: z
    .string()
    .min(3, {
      message: "Email must have at least 3 or more characters",
    })
    .max(20, {
      message: "Please enter a valid email address",
    }),
  password: z
    .string()
    .min(6, {
      message: "Password must have at least 6 or more characters",
    })
    .max(100, {
      message: "Password must be between 6 and 100 characters",
    }),
});

export async function loginUserAction(prevState, formData) {
  const validatedFields = schemaLogin.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  redirect("/dashboard");
}

export async function signupUserAction(prevState, formData) {
  const validatedFields = schemaSignup.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  redirect("/");
}