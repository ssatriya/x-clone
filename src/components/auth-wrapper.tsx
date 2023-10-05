"use client";

import { footerLinks } from "../../constants";
import AuthForm from "./auth-form";
import { Icons } from "./icons";

export default function AuthWrapper() {
  return (
    <>
      <div className="flex w-full flex-1 justify-evenly items-center">
        <div className="w-[55%] flex items-center justify-center">
          <div className="w-[400px]">
            <Icons.x className="fill-text" />
          </div>
        </div>
        <div className="w-[45%]">
          <div className="mb-8 flex flex-col gap-12">
            <h1 className="font-bold text-6xl">Happening now</h1>
            <h2 className="font-bold text-4xl">Join today.</h2>
          </div>
          <AuthForm />
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        {footerLinks.map((link: string) => (
          <div key={link} className="text-sm text-zinc-500">
            {link}
          </div>
        ))}
      </div>
    </>
  );
}
