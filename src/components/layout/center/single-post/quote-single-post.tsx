"use client";

import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import Link from "next/link";
import UserTooltip from "../user-tooltip";
import { Avatar } from "@nextui-org/react";
import { formatTimeToNow, removeAtSymbol, truncateString } from "@/lib/utils";
import AttachmentPost from "../post/post-attachment";
import PostActionButton from "../action-button/post-action-button";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

import { useMediaQuery } from "@mantine/hooks";
import QuoteAttachment from "../quote/quote-attachment";
import PostUsername from "../username/post-username";

type QuoteSinglePostProps = {
  post: ExtendedPost;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
  postUserOwner: UserWithFollowersFollowing;
};

export default function QuoteSinglePost({
  post,
  userPosted,
  currentUser,
  postUserOwner,
}: QuoteSinglePostProps) {
  const isMobile = useMediaQuery("(max-width: 420px)");

  const usernameOriginalPost = removeAtSymbol(postUserOwner.username);
  const originalPostURL = `/${usernameOriginalPost}/status/${post.original_repost_post_id}`;

  const usernameWithoutAt = removeAtSymbol(post.user_one.username);

  const cfg = {};
  let originalPostContent = "";
  // @ts-ignore
  if (post.original_repost.content && post.original_repost.content.ops) {
    const converter = new QuillDeltaToHtmlConverter(
      // @ts-ignore
      post.original_repost.content.ops,
      cfg
    );
    const converted = converter.convert();
    if (converted !== "<p><br/></p>") {
      originalPostContent = converted;
    }
  }

  let postContent = "";
  // @ts-ignore
  if (post.content && post.content.ops) {
    const converter = new QuillDeltaToHtmlConverter(
      // @ts-ignore
      post.content.ops,
      cfg
    );
    const converted = converter.convert();
    if (converted !== "<p><br/></p>") {
      postContent = converted;
    }
  }

  return (
    <div className="transition-colors flex justify-between py-2 px-4 gap-4 border-b relative">
      <div className="h-fit">
        <UserTooltip user={post.user_one} currentUser={currentUser}>
          <Link href={`/${usernameWithoutAt}`}>
            <Avatar showFallback src={userPosted} />
          </Link>
        </UserTooltip>
      </div>

      <div className="w-full flex flex-col">
        <div className="flex items-center gap-2">
          <PostUsername
            username={post.user_one.username}
            name={post.user_one.name}
            avatar={post.user_one.avatar}
            bio={post.user_one.bio}
            userFollowers={post.user_one.followers}
            userFollowing={post.user_one.following}
            userId={post.user_one.id}
            currentUser={currentUser}
            align="row"
          />
          <span className="text-gray">·</span>
          <p className="text-gray">
            {formatTimeToNow(new Date(post.createdAt))}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {postContent.length > 0 && (
            <div dangerouslySetInnerHTML={{ __html: postContent }} />
          )}
          {post?.image_url && (
            <div className="flex justify-center">
              {post.image_url && (
                <AttachmentPost
                  currentUser={currentUser}
                  imageUrl={post.image_url}
                  post={post}
                />
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-3">
          <div className="hover:bg-hover/30 transition-colors cursor-pointer flex h-fit overflow-hidden flex-col justify-between pt-4 px-4 mt-2 border rounded-xl border-[#2f3336] z-10 relative">
            <Link href={originalPostURL} className="absolute inset-0" />
            <div className="flex gap-2 items-center mb-1">
              <UserTooltip user={postUserOwner} currentUser={currentUser}>
                <Avatar
                  className="w-5 h-5"
                  showFallback
                  src={postUserOwner.avatar}
                  size="sm"
                />
              </UserTooltip>
              <div className="flex items-center gap-2">
                <UserTooltip user={postUserOwner} currentUser={currentUser}>
                  <p className="font-bold">
                    {isMobile
                      ? truncateString(postUserOwner.name, 10)
                      : postUserOwner.name}
                  </p>
                </UserTooltip>
                {/* <UserTooltip user={postUserOwner} currentUser={currentUser}>
                  <p className="text-[#555b61]">
                    {isMobile
                      ? truncateString(post.original_repost.user_one.name, 10)
                      : post.original_repost.user_one.name}
                  </p>
                </UserTooltip> */}
                <span className="text-gray">·</span>
                <p className="text-[#555b61]">
                  {post.original_repost?.createdAt &&
                    formatTimeToNow(new Date(post.original_repost?.createdAt))}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <div>
                {originalPostContent.length > 0 && (
                  <div
                    className="pb-4"
                    dangerouslySetInnerHTML={{ __html: originalPostContent }}
                  />
                )}
              </div>
              {post.original_repost && post.original_repost.image_url && (
                <div className="mb-2">
                  <QuoteAttachment
                    currentUser={currentUser}
                    imageUrl={post.original_repost.image_url}
                    post={post}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <PostActionButton
          post={post}
          currentUser={currentUser}
          reposts={post.reposts}
        />
      </div>
    </div>
  );
}
