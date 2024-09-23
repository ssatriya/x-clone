"use client";

import { footerLinks } from "@/constants";
import Icons from "../icons";
import AuthForm from "./auth-form";

const Auth = () => {
  return (
    <>
      <div className="flex w-full flex-1 md:justify-evenly items-center max-md:p-5">
        <div className="hidden lg:w-[55%] lg:flex items-center justify-center">
          <div className="hidden md:block w-[400px]">
            <Icons.x className="fill-secondary" />
          </div>
        </div>
        <div className="w-full md:w-[45%]">
          <div className="mb-8 flex flex-col gap-12">
            <Icons.x className="fill-secondary hidden max-lg:block h-11 w-11" />
            <h1 className="font-bold text-[40px] leading-[52px] md:text-6xl">
              Happening now
            </h1>
            <h2 className="font-bold md:text-4xl text-[23px] leading-7">
              Join today.
            </h2>
          </div>
          <AuthForm />
        </div>
      </div>
      <div className="flex flex-wrap md:flex gap-3 justify-center">
        {footerLinks.map((link: string) => (
          <span key={link} className="text-sm text-muted-foreground">
            {link}
          </span>
        ))}
      </div>
    </>
  );
};
export default Auth;
