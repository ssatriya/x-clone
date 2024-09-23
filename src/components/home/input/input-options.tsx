"use client";

import { Button } from "@/components/ui/button";
import ButtonTooltip from "@/components/button-tooltip";
import { OptionButtonConfig } from "@/types";

type Props = {
  buttons: OptionButtonConfig[];
};

const InputOptions = ({ buttons }: Props) => {
  return (
    <div className="flex items-center -ml-2 py-[3px] mt-2">
      {buttons.map(({ ariaLabel, icon: Icon, onClick, disabled }, index) => (
        <div key={index} className="relative flex items-center group">
          <ButtonTooltip content={ariaLabel}>
            <Button
              disabled={disabled}
              onClick={onClick}
              aria-label={ariaLabel}
              size="icon"
              variant="ghost"
              className="w-[34px] h-[34px] hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Icon className="fill-primary w-5 h-5 disabled:opacity-35" />
            </Button>
          </ButtonTooltip>
        </div>
      ))}
    </div>
  );
};

export default InputOptions;
