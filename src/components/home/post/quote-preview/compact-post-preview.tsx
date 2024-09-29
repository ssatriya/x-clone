import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Media } from "@/types";
import CompactQuoteMedia from "./compact-post-media";
import PostInfo from "@/components/home/post/post-info";

type Props = {
  post: {
    postId: string;
    content: string | null;
    media: Media[];
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
          {post.media.length > 0 && <CompactQuoteMedia mediaURL={post.media} />}
        </div>
        {post.content && (
          <p
            className={cn(
              "text-[15px] text-secondary leading-5 text-pretty whitespace-pre-wrap w-full line-clamp-5",
              post.media.length > 0 && "ml-3"
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
