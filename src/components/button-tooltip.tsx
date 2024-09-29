"use client";

import usePopperInstance from "@/hooks/usePopperInstance";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

type Props = {
  content: string;
};

const ButtonTooltip = ({ content, children }: PropsWithChildren<Props>) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const referenceRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  usePopperInstance(referenceRef, tooltipRef, tooltipVisible);

  const handleTooltipVisibility = (show: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTooltipVisible(show));
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="inline-block">
      <div
        ref={referenceRef}
        onMouseEnter={() => handleTooltipVisibility(true)}
        onMouseLeave={() => handleTooltipVisibility(false)}
      >
        {children}
      </div>
      <div
        ref={tooltipRef}
        onMouseEnter={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        }}
        onMouseLeave={() => handleTooltipVisibility(false)}
        className={`z-50 transition-opacity w-fit absolute cursor-default text-[11px] leading-3 text-white p-1 rounded-sm bg-hover-tooltip
           ${tooltipVisible ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        {content}
      </div>
    </div>
  );
};

export default ButtonTooltip;
