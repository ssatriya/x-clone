import React from "react";
import useMediaURL from "@/hooks/useMediaURL";
import PostInfo from "../post-info";
import Image from "next/image";
import CompactQuoteMedia from "./compact-post-media";
import { cn } from "@/lib/utils";

type Props = {
  post: {
    postId: string;
    content: string;
    media: string | null;
    createdAt: Date;
  };
  user: {
    userId: string;
    name: string;
    username: string;
    photo: string | null;
  };
};

const CompactQuotePreview = ({ post, user }: Props) => {
  const { newMedia } = useMediaURL(post.media);

  return (
    <div className="mt-3 transition-colors border cursor-pointer w-full rounded-2xl hover:bg-hover/30 min-h-16">
      <div className="flex items-start mx-3 mt-3">
        <div className="mr-1">
          <div className="w-6 h-6">
            <Image
              src={user.photo!}
              alt={`${user.username} avatar`}
              height={24}
              width={24}
              className="rounded-full"
              priority
            />
          </div>
        </div>
        <div className="pb-1">
          <PostInfo
            post={{
              postId: post.postId,
              createdAt: post.createdAt,
            }}
            user={{
              name: user.name,
              userId: user.userId,
              username: user.username,
            }}
            moreButton={false}
          />
        </div>
      </div>
      <div className="mx-3 mb-3 flex">
        <div className="flex-shrink-0">
          {newMedia && newMedia.length > 0 && (
            <CompactQuoteMedia mediaURL={newMedia} />
          )}
        </div>
        {post.content && (
          <p
            className={cn(
              "text-[15px] text-secondary leading-5 text-pretty whitespace-pre-wrap w-full line-clamp-5",
              newMedia && newMedia.length > 0 && "ml-3"
            )}
          >
            {post.content}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompactQuotePreview;
