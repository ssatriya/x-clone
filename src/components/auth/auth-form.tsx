"use client";

import Link from "next/link";

import Icons from "@/components/icons";
import { Button } from "../ui/button";

const AuthForm = () => {
  return (
    <div className="flex h-full justify-start flex-col gap-4">
      <div className="w-[300px] flex flex-col gap-3">
        <a href="/api/login/google">
          <Button
            variant="secondary"
            className="w-full bg-secondary-lighter hover:bg-secondary-lighter/90 h-10 font-normal text-[15px]"
          >
            <Icons.google className="h-4 w-4 mr-2" />
            Sign up with Google
          </Button>
        </a>
        <Button
          variant="secondary"
          disabled
          className="w-full bg-secondary-lighter hover:bg-secondary-lighter/90 h-10 font-bold text-[15px]"
        >
          <Icons.apple className="h-5 w-5 mr-2" />
          Sign up with Apple
        </Button>
        <div className="flex justify-center items-center w-full">
          <div className="h-[1px] w-full rounded-full bg-border" />
          <span className="px-2">or</span>
          <div className="h-[1px] w-full rounded-full bg-border" />
        </div>
        <Link href="/api/login/google">
          <Button
            disabled
            variant="default"
            className="w-full h-10 hover:bg-primary/90 font-bold"
          >
            Create account
          </Button>
        </Link>
        <p className="text-[11px] text-muted-foreground">
          By signing up, you agree to the{" "}
          <span className="text-primary">Terms of Service</span> and{" "}
          <span className="text-primary">Privacy Policy</span>, including{" "}
          <span className="text-primary">Cookie Use.</span>
        </p>

        <div className="mt-12">
          <p className="font-bold">Already have an account?</p>
          <Button
            variant="ghost"
            className="w-full border h-10 mt-4 border-border-circle hover:bg-primary/10"
          >
            <p className="font-bold text-primary">Sign in</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default AuthForm;
