"use client";

import AttachmentPost from "@/components/layout/center/post/attachment-post";
import UserTooltip from "@/components/layout/center/user-tooltip";
import { formatTimeToNow } from "@/lib/utils";
import { UserWithFollowersFollowing } from "@/types/db";
import { Avatar } from "@nextui-org/react";
import { Post } from "@prisma/client";
import Link from "next/link";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

type PostQuoteProps = {
  post: Post;
  currentUser: UserWithFollowersFollowing;
};

export default function PostQuote({ post, currentUser }: PostQuoteProps) {
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

  return <p>Post quote</p>;
}
