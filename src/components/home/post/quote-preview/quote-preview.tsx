"use client";

import Link from "next/link";
import Image from "next/image";

import PostInfo from "../post-info";
import { useRouter } from "next/navigation";
import PostMedia from "../media/post-media";
import useMediaURL from "@/hooks/useMediaURL";

type Props = {
  post: {
    id: string;
    content: string;
    media: string | null;
    createdAt: Date;
    nestedPostId: string | null;
  };
  user: {
    id: string;
    name: string;
    username: string;
    photo: string | null;
    nestedUsername: string | null;
  };
  fullWidthImage?: boolean;
};

const QuotePreview = ({ post, user, fullWidthImage }: Props) => {
  const router = useRouter();

  const { newMedia } = useMediaURL(post.media);

  const handleClick = () => {
    const cleanUsername = user.username.slice(1);
    router.push(`/${cleanUsername}/status/${post.id}`);
  };

  return (
    <div
      onClick={() => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          return;
        }
        handleClick();
      }}
      className="mt-3 transition-colors border overflow-clip cursor-pointer w-full rounded-2xl hover:bg-hover/30 min-h-16"
      aria-labelledby="container-quote"
      tabIndex={0}
      role="link"
    >
      <div
        className="flex items-start mx-3 mt-3"
        id="container-quote"
        aria-label="Quoted"
      >
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
              postId: post.id,
              createdAt: post.createdAt,
            }}
            user={{
              name: user.name,
              userId: user.id,
              username: user.username,
            }}
            moreButton={false}
          />
        </div>
      </div>
      <div className="mx-3 mb-3 w-fit">
        {post.content && (
          <p className="text-[15px] text-secondary leading-5 text-pretty whitespace-pre-wrap w-full line-clamp-5">
            {post.content}
          </p>
        )}
        {post.nestedPostId && user.nestedUsername && (
          <div className="w-64 truncate">
            <Link
              href={`/${user.nestedUsername}/status/${post.nestedPostId}`}
              className="text-[15px] leading-5 text-wrap"
            >
              x.com/{user.nestedUsername}/status/
              {post.nestedPostId}
            </Link>
          </div>
        )}
      </div>
      {newMedia && newMedia.length > 0 && (
        <PostMedia
          mediaURLs={newMedia}
          fullWidthImage={fullWidthImage}
          postType="quote"
          usernameWithoutAt={user.username.slice(1)}
          postId={post.id}
        />
      )}
    </div>
  );
};

export default QuotePreview;
