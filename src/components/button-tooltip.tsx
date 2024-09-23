"use client";

import { Tooltip } from "@nextui-org/react";
import { PropsWithChildren } from "react";

type Props = {
  content: string;
};

const ButtonTooltip = ({ content, children }: PropsWithChildren<Props>) => {
  return (
    <Tooltip
      content={content}
      placement="bottom"
      offset={0}
      classNames={{
        content:
          "text-[11px] leading-3 text-white p-1 rounded-sm bg-hover-tooltip",
      }}
      delay={500}
    >
      {children}
    </Tooltip>
  );
};

export default ButtonTooltip;
