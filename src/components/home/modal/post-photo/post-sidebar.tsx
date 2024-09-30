"use client";

import { User } from "lucia";
import Image from "next/image";
import { RefObject, SetStateAction } from "react";
import { DropzoneInputProps } from "react-dropzone";

import Icons from "@/components/icons";
import Button from "@/components/ui/button";
import Linkify from "@/components/linkify";
import Divider from "@/components/ui/divider";
import { formatTimestamp } from "@/lib/utils";
import { FileWithPreview, ForYouFeedPost } from "@/types";
import InputReply from "@/components/home/input/input-reply";
import DescendantPost from "@/components/home/reply/descendant-post";
import ViewButton from "@/components/home/post/engagement-button/view/view-button";
import LikeButton from "@/components/home/post/engagement-button/like/like-button";
import ReplyButton from "@/components/home/post/engagement-button/reply/reply-button";
import ShareButton from "@/components/home/post/engagement-button/share/share-button";
import RepostButton from "@/components/home/post/engagement-button/repost/repost-button";

type Props = {
  photo: string;
  isPosting: boolean;
  inputValue: string;
  loggedInUser: User;
  classNames?: string;
  post: ForYouFeedPost;
  isInputFocus: boolean;
  handleMedia: () => void;
  files: FileWithPreview[];
  isButtonDisabled: boolean;
  submitHandler: () => Promise<void>;
  mediaRef: RefObject<HTMLInputElement>;
  uploadingFiles: { [id: string]: boolean };
  inputRef: RefObject<HTMLTextAreaElement>;
  handleRemove: (mediaId: string) => void;
  setInputValue: (value: SetStateAction<string>) => void;
  setInputCount: (value: SetStateAction<number>) => void;
  setIsInputFocus: (value: SetStateAction<boolean>) => void;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
};

const PostSidebar = ({
  post,
  files,
  inputRef,
  mediaRef,
  isPosting,
  inputValue,
  handleMedia,
  loggedInUser,
  isInputFocus,
  handleRemove,
  setInputValue,
  setInputCount,
  submitHandler,
  getInputProps,
  uploadingFiles,
  setIsInputFocus,
  isButtonDisabled,
}: Props) => {
  return (
    <div
      style={{ width: "355px" }}
      className="h-full bg-black border-l overflow-y-scroll overflow-x-hidden flex-shrink-0"
    >
      <div className="pt-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={post.post.photo}
              height={40}
              width={40}
              priority
              alt="avatar"
              className="rounded-full"
            />
            <div className="flex flex-col ">
              <span className="font-bold leading-5 text-[15px]">
                {post.post.name}
              </span>
              <span className="text-gray leading-5 text-[15px]">
                {post.post.username}
              </span>
            </div>
          </div>
          <div className="relative -right-2 bottom-1/2">
            <Button
              aria-label="More"
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 group focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring h-[34px] w-[34px]"
            >
              <Icons.more className="h-[18px] w-[18px] fill-gray group-hover:fill-primary group-focus-visible:fill-primary" />
            </Button>
          </div>
        </div>
        <div className="pt-3">
          {post.post.postContent && (
            <div className="leading-5">
              <Linkify>
                <span className="text-[15px] text-text text-pretty whitespace-pre-wrap break-words">
                  {post.post.postContent}
                </span>
              </Linkify>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 my-4">
          <span className="text-[15px] text-gray hover:underline leading-4 cursor-pointer">
            {formatTimestamp(post.post.postCreatedAt)}
          </span>
          <span className="text-gray">·</span>
          <span className="text-[15px] text-gray">
            <span className="text-sm font-bold leading-4 text-white">
              288.4k
            </span>{" "}
            Views
          </span>
        </div>
        <Divider className="bg-border h-[1px]" />
        <div className="flex items-center justify-between px-1 w-full h-12">
          <ReplyButton
            loggedInUser={loggedInUser}
            post={{
              id: post.post.postId,
              replyCount: post.replyCount,
              content: post.post.postContent,
              createdAt: post.post.postCreatedAt,
              rootPostId: post.post.postRootPostId,
            }}
            user={{
              name: post.post.name,
              photo: post.post.photo,
              username: post.post.username,
            }}
            initialReplyCount={post.replyCount}
            size="md"
          />
          <RepostButton
            postId={post.post.postId}
            loggedInUser={loggedInUser}
            size="md"
            originalPost={{
              name: post.post.name,
              photo: post.post.photo,
              userId: post.post.postId,
              media: post.media,
              username: post.post.username,
              content: post.post.postContent,
              createdAt: post.post.postCreatedAt,
            }}
            initialRepost={{
              repostCount: post.repost ? post.repost.length : 0,
              isRepostedByUser: post.repost
                ? post.repost.some((r) => r.userOriginId === loggedInUser.id)
                : false,
            }}
            initialQuote={{
              quoteCount: post.quote ? post.quote.length : 0,
              isQuotedByUser: post.quote
                ? post.quote.some((q) => q.userOriginId === loggedInUser.id)
                : false,
            }}
          />
          <LikeButton
            userId={post.post.userId}
            postId={post.post.postId}
            initialLike={{
              likeCount: post.like ? post.like.length : 0,
              isLikedByUser: post.like
                ? post.like.some((l) => l.userOriginId === loggedInUser.id)
                : false,
            }}
            size="md"
          />
          <ViewButton size="md" />
          <ShareButton size="md" />
        </div>
        <Divider className="bg-border h-[1px]" />
        <InputReply
          files={files}
          inputRef={inputRef}
          mediaRef={mediaRef}
          isPosting={isPosting}
          inputValue={inputValue}
          handleMedia={handleMedia}
          photo={loggedInUser.photo}
          isInputFocus={isInputFocus}
          handleRemove={handleRemove}
          username={post.post.username}
          setInputValue={setInputValue}
          setInputCount={setInputCount}
          submitHandler={submitHandler}
          getInputProps={getInputProps}
          uploadingFiles={uploadingFiles}
          setIsInputFocus={setIsInputFocus}
          isButtonDisabled={isButtonDisabled}
        />
      </div>
      <Divider className="bg-border h-[1px]" />
      <div style={{ minHeight: "200vh" }}>
        <DescendantPost loggedInUser={loggedInUser} postId={post.post.postId} />
      </div>
    </div>
  );
};

export default PostSidebar;
