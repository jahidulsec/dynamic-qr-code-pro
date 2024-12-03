"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { adminLogin } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, action] = useFormState(adminLogin, null);

  const router = useRouter();

  useEffect(() => {
    if (data?.db != null) {
      toast.error(data.db);
    } else if (data?.success) {
      router.replace("/admin");
    }
  });

  return (
    <main className="flex justify-center items-center min-h-[40rem]">
      <div className="max-w-xl min-w-[25rem] p-5 border rounded-md bg-white shadow-sm">
        <header>
          <h2 className="text-primary text-3xl text-center">Sign in</h2>
          <h4 className="text-sm text-center text-gray-400 my-3">
            Welcome back! Please enter your details
          </h4>
        </header>

        {/* form */}
        <form action={action} className="flex flex-col gap-5 my-8">
          <p>
            <Label className="text-primary" htmlFor="username">
              Username
            </Label>
            <Input type="text" name="username" id="username" />
            {data?.error?.username && (
              <p className="error-msg">{data.error.username}</p>
            )}
          </p>

          <p className="relative">
            <Label className="text-primary" htmlFor="password">
              Password
            </Label>
            <Input
              type={!showPassword ? "password" : "text"}
              name="password"
              id="password"
            />
            <i
              className="eye absolute top-9 right-3 cursor-pointer"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
            </i>
            {data?.error?.password && (
              <p className="error-msg">{data.error.password}</p>
            )}
          </p>

          <SubmitButton />
        </form>
      </div>
    </main>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? `Login...` : `Login`}
    </Button>
  );
};

export default LoginForm;
