import Image from "next/image";
import { formatTimeToNow } from "@/lib/utils";
import Divider from "@/components/ui/divider";

type Props = {
  name: string;
  username: string;
  content: string | null;
  photo: string | null;
  createdAt: Date;
};

const ReplyTarget = ({ content, name, username, photo, createdAt }: Props) => {
  return (
    <div className="flex gap-2">
      <div className="relative overflow-clip">
        <div className="w-10 h-10">
          <Image
            src={photo!}
            alt={`${username} avatar`}
            width={40}
            height={40}
            priority
            className="rounded-full"
          />
        </div>
        <Divider
          orientation="vertical"
          className="w-[2px] bg-border absolute left-[50%] translate-x-[-50%] mt-1"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex gap-1">
          <p className="font-bold text-[15px]">{name}</p>
          <p className="text-[15px] text-gray">{username}</p>
          <span className="text-gray">·</span>
          <p className="text-gray text-[15px]">
            {formatTimeToNow(new Date(createdAt))}
          </p>
        </div>
        <div>
          {content && (
            <p className="text-[15px] leading-5 pb-3 whitespace-pre-wrap">
              {content}
            </p>
          )}
        </div>
        <div className="pt-2 pb-4 text-[15px] leading-5">
          <span className="text-gray cursor-default">
            Replying to <span className="text-primary">{username}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReplyTarget;
