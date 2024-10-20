"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { generateIdFromEntropySize, User } from "lucia";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  compress,
  updateProgress,
  formatTimestamp,
  getImageDimension,
  getVideoDimension,
} from "@/lib/utils";
import kyInstance from "@/lib/ky";
import Icons from "@/components/icons";
import Linkify from "@/components/linkify";
import PostMedia from "./media/post-media";
import Divider from "@/components/ui/divider";
import InputReply from "../input/input-reply";
import AncestorPost from "../reply/ancestor-post";
import UserTooltip from "@/components/user-tooltip";
import DescendantPost from "../reply/descendant-post";
import { CreateReplyPayload } from "@/lib/zod-schema";
import { useUploadMedia } from "@/hooks/useUploadMedia";
import QuotePreview from "./quote-preview/quote-preview";
import LoadingSpinner from "@/components/loading-spinner";
import MoreButton from "./engagement-button/more/more-button";
import useCurrentFocusPost from "@/hooks/useCurrentFocusPost";
import LikeButton from "./engagement-button/like/like-button";
import ReplyButton from "./engagement-button/reply/reply-button";
import ShareButton from "./engagement-button/share/share-button";
import RepostButton from "./engagement-button/repost/repost-button";
import { ForYouFeedPost, FileWithPreview, MediaFormat } from "@/types";
import BookmarkButton from "./engagement-button/bookmark/bookmark-button";

type Props = {
  loggedInUser: User;
  username: string;
  postId: string;
};

const PostDetail = ({ loggedInUser, username, postId }: Props) => {
  const queryClient = useQueryClient();
  const { setFocusPost } = useCurrentFocusPost();
  const { startUpload, uploadingFiles } = useUploadMedia();

  const divRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const [inputCount, setInputCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const queryKey = ["post-detail", postId, username];
  const { data, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      kyInstance
        .get("/api/post", { searchParams: { username, postId } })
        .json<ForYouFeedPost>(),
    staleTime: 1,
  });

  const queryKeyReplyCount = ["get-reply-count", data?.post.postId];
  const queryKeyDescendantsReply = ["get-descendants-reply", data?.post.postId];

  const { mutate: createReply } = useMutation({
    mutationKey: ["create-reply"],
    mutationFn: (payload: CreateReplyPayload) =>
      kyInstance.post("/api/post/reply", {
        json: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyReplyCount });
      queryClient.invalidateQueries({
        queryKey: queryKeyDescendantsReply,
      });
      setInputValue("");
      setInputCount(0);
      setFiles([]);
      setIsInputFocus(false);
      setIsPending(false);
    },
  });

  const handleMedia = () => {
    if (mediaRef.current) {
      if (!isInputFocus) {
        setIsInputFocus(true);
        return;
      }
      mediaRef.current.click();
    }
  };

  const handleRemove = (mediaId: string) => {
    setFiles((prev) => prev.filter((img) => img.meta.id !== mediaId));
  };

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
      acceptedFiles.forEach(async (file) => {
        const fileType = file.type.split("/")[1] as MediaFormat;
        if (fileType == "png" || fileType == "jpeg" || fileType == "jpg") {
          try {
            const compressResult = (await compress(
              file,
              0.7,
              2000,
              2000
            )) as Blob;
            const compressedFile = new File([compressResult], file.name, {
              type: compressResult.type,
              lastModified: file.lastModified,
            });
            const previewUrl = URL.createObjectURL(compressResult);
            const { height, width } = await getImageDimension(previewUrl);
            const fileWithPreview: FileWithPreview = {
              meta: {
                id: generateIdFromEntropySize(10),
                preview: previewUrl,
                dimension: { height, width },
                format: fileType,
              },
              file: Object.assign(compressedFile, {
                path: file.path,
              }) as File,
            };

            setFiles((prev) => [...(prev ?? []), fileWithPreview]);
            startUpload(fileWithPreview);
          } catch (error) {
            console.log({ error });
          }
        }
        if (fileType === "gif") {
          try {
            const previewUrl = URL.createObjectURL(file);
            const dimension = await getImageDimension(previewUrl);

            const fileWithPreview: FileWithPreview = {
              meta: {
                id: generateIdFromEntropySize(10),
                preview: previewUrl,
                dimension: dimension,
                format: fileType,
              },
              file: file,
            };
            setFiles((prev) => [...(prev ?? []), fileWithPreview]);
            await startUpload(fileWithPreview);
          } catch (error) {
            console.error(error);
          }
        }
        if (fileType == "mp4") {
          try {
            const previewUrl = URL.createObjectURL(file);
            const dimension = await getVideoDimension(previewUrl);
            const fileWithPreview: FileWithPreview = {
              meta: {
                id: generateIdFromEntropySize(10),
                preview: previewUrl,
                dimension: dimension,
                format: fileType,
              },
              file: file,
            };

            setFiles((prev) => [...(prev ?? []), fileWithPreview]);
            startUpload(fileWithPreview);
          } catch (error) {
            console.log(error);
          }
        }
      });
    },
    [setFiles, startUpload]
  );

  const { getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    multiple: true,
  });

  useEffect(() => {
    updateProgress(inputCount);
  }, [inputCount]);

  useEffect(() => {
    if (data) {
      setFocusPost(data.post.postId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    setTimeout(() => divRef.current?.scrollIntoView(), 0);
  }, []);

  if (!data && isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-auto scroll-mt-[53px] py-[123px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data && !isLoading) {
    return (
      <div>
        <span>OOpss, post not found...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <span>OOpss, post not found...</span>
      </div>
    );
  }

  const submitHandler = async () => {
    setIsPending(true);

    const payload: CreateReplyPayload = {
      content: inputValue.trim(),
      postType: "reply",
      parentPostId: data.post.postId,
      rootPostId: data.post.postRootPostId,
      mediaId: files.map((file) => file.meta.id),
    };
    createReply(payload);
  };

  const isButtonDisabled = inputValue.length > 0 || files.length > 0;
  const isPosting = isPending;

  return (
    <>
      <AncestorPost loggedInUser={loggedInUser} postId={data.post.postId} />
      <div className="relative">
        <div ref={divRef} className="scroll-mt-[53px]" data-test="ref" />
        <div className="w-full scroll-mt-[53px] px-4 pt-3">
          <article className="flex flex-col mt-1">
            <div className="flex items-start justify-between">
              <div className="flex gap-2 items-center justify-center">
                <div className="w-10 h-10">
                  <Image
                    src={data.post.photo}
                    alt={`${data.post.username} avatar`}
                    height={40}
                    width={40}
                    priority
                    className="rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center leading-5">
                    <UserTooltip
                      userId={data.post.userId}
                      username={data.post.username}
                    >
                      <Link
                        href={`/${data.post.username.slice(1)}`}
                        className="hover:underline text-[15px] font-bold"
                      >
                        {data.post.name}
                      </Link>
                    </UserTooltip>
                    <span className="w-[18px] h-[18px] ml-[2px]">
                      <Icons.verified className="fill-primary" />
                    </span>
                  </div>
                  <div className="flex items-center gap-1 leading-5">
                    <UserTooltip
                      userId={data.post.userId}
                      username={data.post.username}
                    >
                      <Link
                        href={`/${data.post.username.slice(1)}`}
                        className="text-[15px] text-gray"
                      >
                        {data.post.username}
                      </Link>
                    </UserTooltip>
                  </div>
                </div>
              </div>
              <MoreButton />
            </div>
            <div className="flex flex-col">
              <div className="w-full space-y-3">
                {data.post.postContent && (
                  <div className="mt-3">
                    <Linkify>
                      <span className="text-[17px] text-white leading-6 text-pretty whitespace-pre-wrap">
                        {data.post.postContent}
                      </span>
                    </Linkify>
                  </div>
                )}
                {data.media.length > 0 && (
                  <PostMedia
                    mediaURLs={data.media}
                    fullWidthImage={true}
                    usernameWithoutAt={username}
                    postId={postId}
                  />
                )}
                {data.post.postType === "quote" && (
                  <QuotePreview
                    post={{
                      id: data.quoted.originalPostId,
                      content: data.quoted.originalPostContent,
                      media: data.ogMedia,
                      createdAt: data.quoted.originalPostCreatedAt,
                      nestedPostId: null,
                    }}
                    user={{
                      id: data.quoted.originalUserId,
                      name: data.quoted.originalName,
                      username: data.quoted.originalUsername,
                      photo: data.quoted.originalPhoto,
                      nestedUsername: null,
                    }}
                    fullWidthImage={true}
                  />
                )}
              </div>
              <div className="flex items-center gap-1 my-4">
                <span className="text-[15px] text-gray hover:underline cursor-pointer">
                  {formatTimestamp(data.post.postCreatedAt)}
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
              <div className="flex justify-between w-full gap-1 px-1 my-1">
                <ReplyButton
                  size="md"
                  loggedInUser={loggedInUser}
                  initialReplyCount={data.replyCount}
                  post={{
                    id: data.post.postId,
                    content: data.post.postContent,
                    createdAt: data.post.postCreatedAt,
                    rootPostId: data.post.postRootPostId,
                    replyCount: data.replyCount,
                  }}
                  user={{
                    name: data.post.name,
                    username: data.post.username,
                    photo: data.post.photo,
                  }}
                />
                <RepostButton
                  size="md"
                  postId={data.post.postId}
                  loggedInUser={loggedInUser}
                  originalPost={{
                    userId: data.post.userId,
                    content: data.post.postContent,
                    media: data.media,
                    createdAt: data.post.postCreatedAt,
                    name: data.post.name,
                    username: data.post.username,
                    photo: data.post.photo,
                  }}
                  initialQuote={{
                    quoteCount: data.quote ? data.quote.length : 0,
                    isQuotedByUser: data.quote
                      ? data.quote.some(
                          (q) => q.userOriginId === loggedInUser.id
                        )
                      : false,
                  }}
                  initialRepost={{
                    repostCount: data.repost ? data.repost.length : 0,
                    isRepostedByUser: data.repost
                      ? data.repost.some(
                          (r) => r.userOriginId === loggedInUser.id
                        )
                      : false,
                  }}
                />
                <LikeButton
                  size="md"
                  userId={data.post.userId}
                  postId={data.post.postId}
                  initialLike={{
                    likeCount: data.like ? data.like.length : 0,
                    isLikedByUser: data.like
                      ? data.like.some(
                          (l) => l.userOriginId === loggedInUser.id
                        )
                      : false,
                  }}
                />
                <BookmarkButton size="md" withCounter={true} />
                <ShareButton size="md" />
              </div>
            </div>
          </article>
          <Divider className="bg-border h-[1px]" />
        </div>
        {/* editor start */}
        <InputReply
          files={files}
          classNames="px-4"
          inputRef={inputRef}
          mediaRef={mediaRef}
          isPosting={isPosting}
          inputValue={inputValue}
          handleMedia={handleMedia}
          photo={loggedInUser.photo}
          handleRemove={handleRemove}
          isInputFocus={isInputFocus}
          username={data.post.username}
          setInputValue={setInputValue}
          setInputCount={setInputCount}
          submitHandler={submitHandler}
          getInputProps={getInputProps}
          uploadingFiles={uploadingFiles}
          setIsInputFocus={setIsInputFocus}
          isButtonDisabled={isButtonDisabled}
        />
        {/* editor end */}
        <Divider className="bg-border h-[1px]" />
        <div style={{ minHeight: "200vh" }}>
          <DescendantPost
            loggedInUser={loggedInUser}
            postId={data.post.postId}
          />
        </div>
      </div>
    </>
  );
};

export default PostDetail;
