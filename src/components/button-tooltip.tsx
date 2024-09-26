"use client";

import { PropsWithChildren } from "react";

type Props = {
  content: string;
};

const ButtonTooltip = ({ content, children }: PropsWithChildren<Props>) => {
  return (
    <div>button tooltip wip</div>
    // <Tooltip
    //   content={content}
    //   placement="bottom"
    //   offset={0}
    //   classNames={{
    //     content:
    //       "text-[11px] leading-3 text-white p-1 rounded-sm bg-hover-tooltip",
    //   }}
    //   delay={500}
    // >
    //   {children}
    // </Tooltip>
  );
};

export default ButtonTooltip;
