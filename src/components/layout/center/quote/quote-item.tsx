import { ExtendedPost, UserWithFollowersFollowing } from "@/types/db";
import Link from "next/link";
import UserTooltip from "../user-tooltip";
import { Avatar } from "@nextui-org/react";
import { formatTimeToNow, removeAtSymbol } from "@/lib/utils";
import AttachmentPost from "../post/attachment-post";
import PostActionButton from "../post/action-button/post-action-button";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

type QuoteItemProps = {
  post: ExtendedPost;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
  postUserOwner: UserWithFollowersFollowing;
};

export default function QuoteItem({
  post,
  userPosted,
  currentUser,
  postUserOwner,
}: QuoteItemProps) {
  const usernameOriginalPost = removeAtSymbol(postUserOwner.username);
  const originalPostURL = `/${usernameOriginalPost}/status/${post.originalPostId}`;

  const username = removeAtSymbol(post.user_one.username);
  const postUrl = `/${username}/status/${post.id}`;

  const cfg = {};
  let originalPostContent = "";
  // @ts-ignore
  if (post.originalPost.content && post.originalPost.content.ops) {
    const converter = new QuillDeltaToHtmlConverter(
      // @ts-ignore
      post.originalPost.content.ops,
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
    <div className="hover:bg-hover/30 transition-colors cursor-pointer flex justify-between py-2 px-4 gap-4 border-b relative">
      <Link href={postUrl} className="absolute inset-0" />
      <div className="h-fit">
        <UserTooltip user={post.user_one} currentUser={currentUser}>
          <Link href={`/${username}`}>
            <Avatar showFallback src={userPosted} />
          </Link>
        </UserTooltip>
      </div>

      <div className="w-full flex flex-col">
        <div className="flex items-center gap-2">
          <UserTooltip user={post.user_one} currentUser={currentUser}>
            <Link
              href={`/${username}`}
              className="font-bold hover:underline focus-visible:ring-0"
            >
              {post.user_one.name}
            </Link>
          </UserTooltip>
          <UserTooltip user={post.user_one} currentUser={currentUser}>
            <Link
              href={`/${username}`}
              className="text-gray focus-visible:ring-0"
            >
              {post.user_one.username}
            </Link>
          </UserTooltip>
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
                <AttachmentPost imageUrl={post.image_url} post={post} />
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-3">
          <div className="hover:bg-[#0e0e0e] transition-colors cursor-pointer flex h-fit overflow-hidden flex-col justify-between pt-4 px-4 mt-2 border rounded-xl border-[#2f3336]z-10 relative">
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
                  <p className="font-bold">{postUserOwner.name}</p>
                </UserTooltip>
                <UserTooltip user={postUserOwner} currentUser={currentUser}>
                  <p className="text-[#555b61]">{postUserOwner.username}</p>
                </UserTooltip>
                <span className="text-gray">·</span>
                <p className="text-[#555b61]">
                  {post.createdAt && formatTimeToNow(new Date(post.createdAt))}
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
