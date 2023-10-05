import Image from "next/image";
import { Avatar } from "@nextui-org/react";

type QuoteProps = {
  name: string;
  username: string;
  postedAt: string;
  content?: string;
  imageUrl?: any;
};

export default function Quote({
  name,
  username,
  postedAt,
  content,
  imageUrl,
}: QuoteProps) {
  return (
    <div className="hover:bg-[#0e0e0e] transition-colors cursor-pointer flex h-[595px] overflow-hidden flex-col justify-between py-4 px-4 mt-2 border rounded-2xl border-[#2f3336]">
      <div className="flex gap-2">
        <Avatar
          showFallback
          src="https://i.pravatar.cc/150?u=a04258114e29026702d"
        />
        <div className="flex items-center gap-2">
          <p className="font-bold">{name}</p>
          <p className="text-[#555b61]">{username}</p>
          <span>·</span>
          <p className="text-[#555b61]">{postedAt}</p>
        </div>
      </div>
      <div className="flex flex-col">
        <p>{content}</p>
        {imageUrl && (
          <div className="flex justify-center">
            <Image
              src={imageUrl}
              height={550}
              alt="img"
              className="object-contain rounded-2xl mt-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}
