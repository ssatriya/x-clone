"use client";

import { PropsWithChildren } from "react";

type Props = {
  content: string;
};

const ButtonTooltip = ({ content, children }: PropsWithChildren<Props>) => {
  return (
    <div className="inline-block group relative w-fit">
      {children}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-full
          z-50 w-max transition-opacity duration-300 
          cursor-default text-[11px] leading-3 text-white p-1 
          rounded-sm bg-hover-tooltip 
          group-hover:opacity-100 group-hover:visible 
          opacity-0 invisible"
      >
        <span>{content}</span>
      </div>
    </div>
  );
};

export default ButtonTooltip;
