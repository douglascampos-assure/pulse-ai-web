"use client";

import Link from "next/link";
import { useActionState } from "react";

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
  data: null,
  message: null,
};

export function SignupForm() {
  const [formState, formAction] = useActionState(
    INITIAL_STATE
  );

  console.log(formState, "client");

  return (
    <div className="w-full max-w-md">
      <form action={formAction}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
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
              text="Sign Up"
              loadingText="Loading"
            />
            <StrapiErrors error={formState?.strapiErrors} />
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Have an account?
          <Link className="underline ml-2" href="signin">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}