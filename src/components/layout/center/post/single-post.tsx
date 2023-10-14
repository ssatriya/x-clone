"use client";

import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import UserPostAvatar from "./user-post-avatar";
import {
  formatSinglePostDate,
  formatTimeToNow,
  removeAtSymbol,
} from "@/lib/utils";
import UserPostName from "./user-post-name";
import UserTooltip from "../user-tooltip";
import Link from "next/link";
import SinglePostUsername from "./single-post-username";
import { Avatar, Button, Divider } from "@nextui-org/react";
import { Icons } from "@/components/icons";
import AttachmentPost from "./attachment-post";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import PostActionButton from "./action-button/post-action-button";
import dynamic from "next/dynamic";
import InlineReplyFormEditor from "../reply/inline-reply/inline-reply-form-editor";

type SinglePostProps = {
  currentUser: UserWithFollowersFollowing;
  post: ExtendedPostWithoutUserTwo;
};

export default function SinglePost({ post, currentUser }: SinglePostProps) {
  const usernameWithoutAt = removeAtSymbol(post.user_one.username);

  const cfg = {};

  let html = "";
  // @ts-ignore
  if (post.content && post.content.ops) {
    // @ts-ignore
    const converter = new QuillDeltaToHtmlConverter(post.content.ops, cfg);
    const converted = converter.convert();
    if (converted !== "<p><br/></p>") {
      html = converted;
    }
  }
  return (
    <div className="pt-3 px-4 border-b">
      <div className="flex justify-between gap-4">
        <div className="h-fit">
          <UserPostAvatar
            currentUser={currentUser}
            user={post.user_one}
            userPosted={post.user_one.avatar}
            usernameWithoutAt={usernameWithoutAt}
          />
        </div>

        <div className="relative w-full flex justify-between items-center">
          <SinglePostUsername
            currentUser={currentUser}
            post={post}
            usernameWithoutAt={usernameWithoutAt}
          />
          <Button
            isIconOnly
            size="sm"
            className="rounded-full bg-transparent hover:bg-blue/10 absolute top-0 right-0 group"
          >
            <Icons.more className="h-4 w-4 fill-gray group-hover:fill-blue" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col space-y-3 my-4">
        <div>
          {html.length > 0 && (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
        {post.image_url && (
          <AttachmentPost imageUrl={post.image_url} post={post} />
        )}
        <div className="flex gap-2 items-center">
          <p className="text-[15px] leading-5 text-gray hover:underline cursor-pointer">
            {formatSinglePostDate(post.createdAt)}
          </p>
          <span className="text-gray">·</span>
          <p className="text-white font-semibold">
            120.3K <span className="text-gray font-normal">Views</span>
          </p>
        </div>
      </div>
      <Divider orientation="horizontal" className="bg-border" />
      <PostActionButton
        post={post}
        currentUser={currentUser}
        reposts={post.reposts}
      />
      <Divider orientation="horizontal" className="bg-border" />
      <div className="pt-2 pb-3 ">
        <InlineReplyFormEditor currentUser={currentUser} post={post} />
      </div>
    </div>
  );
}
