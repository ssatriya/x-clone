"use client";

import Icons from "../icons";
import Button from "./button";

interface Props {
  onVolumeChange: (volume: number) => void;
  volume: number;
}

const VolumeControl = ({ onVolumeChange, volume }: Props) => {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 p-0 hover:bg-white/10 peer"
      >
        {volume > 0 && (
          <Icons.speakerOn className="w-5 h-5 fill-secondary-lighter" />
        )}
        {volume === 0 && (
          <Icons.speakerOff className="w-5 h-5 fill-secondary-lighter" />
        )}
      </Button>
      <div className="absolute bottom-[34px] right-1/2 translate-x-1/2 flex items-center justify-center h-auto py-4 px-3 bg-black/30 rounded-full opacity-0 peer-hover:opacity-100 invisible peer-hover:visible hover:visible hover:opacity-100">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="h-24 w-1 bg-white/50 rounded-full appearance-none"
          style={{
            WebkitAppearance: "none",
            writingMode: "vertical-lr",
            transform: "rotate(-180deg)",
          }}
        />
      </div>
    </div>
  );
};

export default VolumeControl;
