import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import Link from "next/link";
import UserPostAvatar from "../post/user-post-avatar";
import { formatTimeToNow, removeAtSymbol } from "@/lib/utils";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import AttachmentPost from "../post/post-attachment";
import PostActionButton from "../action-button/post-action-button";
import { Button } from "@nextui-org/react";
import { Icons } from "@/components/icons";
import PostUsername from "../username/post-username";

type ReplyItemProps = {
  post: ExtendedPost;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
  postUserOwner: UserWithFollowersFollowing;
  disabledNote: boolean;
};

export default function ReplyItem({
  post,
  userPosted,
  currentUser,
  postUserOwner,
  disabledNote,
}: ReplyItemProps) {
  const usernameWithoutAt = removeAtSymbol(post.user_one.username);

  const postURL = `/${usernameWithoutAt}/status/${post.id}`;

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
    <>
      <div className="relative hover:bg-hover/30 transition-colors cursor-pointer flex justify-between pt-3 px-4 gap-2 border-b">
        <Link href={postURL} className="absolute inset-0" />
        <div className="h-fit">
          <UserPostAvatar
            currentUser={currentUser}
            user={post.user_one}
            userPosted={userPosted}
            usernameWithoutAt={usernameWithoutAt}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="w-full flex flex-col">
            <div className="flex items-center gap-2">
              <PostUsername
                name={post.user_one.username}
                username={post.user_one.username}
                userId={post.user_one.id}
                avatar={post.user_one.avatar}
                bio={post.user_one.bio}
                userFollowers={post.user_one.followers}
                userFollowing={post.user_one.following}
                currentUser={currentUser}
                align="row"
              />
              <span className="text-gray">·</span>
              <p className="text-gray">
                {formatTimeToNow(new Date(post.createdAt))}
              </p>
            </div>
            <div className="text-[15px] leading-5">
              {!disabledNote ? (
                <p className="text-gray">
                  Replying to{" "}
                  <span className="text-blue">{postUserOwner.username}</span>
                </p>
              ) : null}
            </div>
            <div className="flex flex-col space-y-3">
              <div>
                {html.length > 0 && (
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                )}
              </div>
              {post.image_url && (
                <AttachmentPost
                  currentUser={currentUser}
                  imageUrl={post.image_url}
                  post={post}
                />
              )}
            </div>
          </div>
          <PostActionButton
            post={post}
            currentUser={currentUser}
            reposts={post.reposts}
          />
        </div>
      </div>
    </>
  );
}
