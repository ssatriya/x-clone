"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";

import { Icons } from "./icons";

export default function AuthForm() {
  return (
    <div className="flex h-full justify-start flex-col gap-4">
      <div className="w-[300px] flex flex-col gap-3">
        <Link href="/api/login/google">
          <Button className="w-full rounded-full bg-white hover:bg-zinc-200">
            <Icons.google className="h-4 w-4 mr-2" />
            <p className="font-bold text-black">Sign up with Google</p>
          </Button>
        </Link>

        <Link href="/api/login/google">
          <Button className="w-full  rounded-full bg-white hover:bg-zinc-200">
            <Icons.apple className="h-6 w-6 mr-2" />
            <p className="font-bold text-black">Sign up with Apple</p>
          </Button>
        </Link>
        <div className="flex justify-center items-center w-full">
          <div className="h-[1px] w-full rounded-full bg-slate-700" />
          <span className="px-2">or</span>
          <div className="h-[1px] w-full rounded-full bg-slate-700" />
        </div>
        <Link href="/api/login/google">
          <Button className="w-full  rounded-full bg-twitter hover:bg-twitter/90">
            <p className="font-bold text-white">Create account</p>
          </Button>
        </Link>
        <p className="text-[11px] text-zinc-500">
          By signing up, you agree to the{" "}
          <span className="text-twitter">Terms of Service</span> and{" "}
          <span className="text-twitter">Privacy Policy</span>, including{" "}
          <span className="text-twitter">Cookie Use.</span>
        </p>

        <div className="mt-12">
          <p className="font-bold">Already have an account?</p>
          <Button className="w-full bg-transparent rounded-full mt-4 border-zinc-600 hover:bg-twitter/10">
            <p className="font-bold text-twitter">Sign in</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
