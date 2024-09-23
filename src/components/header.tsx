"use client";

import { useRouter } from "next/navigation";
import Icons from "./icons";
import { Button } from "./ui/button";

type Props = {
  title: string;
  subtitle?: String;
  backButton?: boolean;
};

const Header = ({ title, subtitle, backButton }: Props) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="h-[53px] max-w-[598px] w-auto items-center px-4 flex sticky top-0 z-50 bg-black/60 backdrop-blur-md cursor-pointer">
      {backButton && (
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="hover:bg-white/10 mr-9 h-[34px] w-[34px] -ml-2"
        >
          <Icons.arrowLeft className="w-5 h-5 fill-secondary " />
        </Button>
      )}
      <div className="flex flex-col">
        <div className="text-xl font-bold leading-6">{title}</div>
        <div className="text-[13px] text-gray leading-4">{subtitle}</div>
      </div>
    </header>
  );
};

export default Header;
