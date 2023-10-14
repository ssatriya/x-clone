"use client";

import { Icons } from "@/components/icons";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

type HeaderProps = {
  title: string;
  subtitle?: String;
  backButton?: boolean;
};

export default function Header({ title, subtitle, backButton }: HeaderProps) {
  const router = useRouter();

  return (
    <div className="h-[53px] w-full items-center px-4 flex">
      {backButton && (
        <Button
          onClick={() => router.back()}
          isIconOnly
          size="sm"
          className="bg-black rounded-full hover:bg-hover mr-9"
        >
          <Icons.arrowLeft className="fill-text h-5 w-5 " />
        </Button>
      )}
      <div className="flex flex-col">
        <div className="font-bold text-xl leading-6">{title}</div>
        <div className="text-[13px] text-gray leading-4">{subtitle}</div>
      </div>
    </div>
  );
}
