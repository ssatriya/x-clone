"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";

import { Icons } from "./icons";

export default function AuthForm() {
  return (
    <div className="flex h-full justify-start flex-col gap-4">
      <div className="w-[300px] flex flex-col gap-3">
        <div className="flex justify-center items-center w-full">
          <div className="h-[1px] w-full rounded-full bg-slate-700" />
          <span className="px-2">or</span>
          <div className="h-[1px] w-full rounded-full bg-slate-700" />
        </div>
        <Link href="/api/login/google">
          <Button className="w-full rounded-full bg-blue hover:bg-blue/90">
            <p className="font-bold text-white">Create account</p>
          </Button>
        </Link>
        <p className="text-[11px] text-zinc-500">
          By signing up, you agree to the{" "}
          <span className="text-blue">Terms of Service</span> and{" "}
          <span className="text-blue">Privacy Policy</span>, including{" "}
          <span className="text-blue">Cookie Use.</span>
        </p>

        <div className="mt-12">
          <p className="font-bold">Already have an account?</p>
          <Button className="w-full bg-transparent border rounded-full mt-4 border-zinc-600 hover:bg-blue/10">
            <p className="font-bold text-blue">Sign in</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
