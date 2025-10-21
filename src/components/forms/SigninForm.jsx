"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { loginUserAction } from "@/src/data/actions/auth-actions";

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/src/components/ui/card";

import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { StrapiErrors } from "@/src/components/custom/StrapiErrors";
import { SubmitButton } from "@/src/components/custom/SubmitButton";

const INITIAL_STATE = {
  strapiErrors: null,
  data: null,
  message: null,
};

export function SigninForm() {
  const [formState, formAction] = useActionState(
    loginUserAction,
    INITIAL_STATE
  );

  // Nota: Este useEffect solo lo dejo para probar la conexión a Databricks por defecto en google calendar bronze.
  // En producción, la lógica de datos debe separarse y apuntar al endpoint adecuado.
  useEffect(() => {
    fetch("/api/calendar-bronze")
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos de Databricks:", data);
      })
      .catch((err) => console.error("Error fetch Databricks:", err));
  }, []);

  return (
    <div className="w-full max-w-md">
      <form action={formAction}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your details to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="username or email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <SubmitButton
              className="w-full"
              text="Sign In"
              loadingText="Loading"
            />
            <StrapiErrors error={formState?.strapiErrors} />
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Don't have an account?
          <Link className="underline ml-2" href="signup">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
