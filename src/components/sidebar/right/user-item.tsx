import Image from "next/image";

import Button from "@/components/ui/button";

const UserItem = () => {
  return (
    <div className="px-4 py-3 hover:bg-secondary/5">
      <div className="flex gap-2">
        <div className="w-10 h-10 flex-shrink-0">
          <Image
            src="/avatar.jpeg"
            height={40}
            width={40}
            alt="user profile picture"
            className="rounded-full"
            priority
          />
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <span className="text-[15px] text-text leading-5 font-bold">
              Ubisoft
            </span>
            <span className="text-[15] text-gray leading-5">@Ubisoft</span>
          </div>
          <Button
            variant="secondary"
            size="default"
            className="text-black font-bold text-sm leading-4"
          >
            Follow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserItem;
