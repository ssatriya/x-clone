import { Icons } from "@/components/icons";
import QuoteFormEditor from "@/components/layout/center/quote/quote-form-editor";
import ReplyFormEditor from "@/components/layout/center/reply/reply-form-editor";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import {
  Avatar,
  Button,
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { RepostType, User } from "@prisma/client";
import * as React from "react";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import UserTooltip from "@/components/layout/center/user-tooltip";
import Link from "next/link";
import { formatTimeToNow } from "@/lib/utils";
import AttachmentPost from "@/components/layout/center/post/attachment-post";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { AttachmentType } from "@/types/types";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/uploadthing";
import { DeltaStatic, Sources } from "quill";
import { QuotePayload } from "@/lib/validator/quote";
import { useMediaQuery } from "@mantine/hooks";

type ReplyModal = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  isOpen: boolean;
  onOpenChange: () => void;
  currentUser: UserWithFollowersFollowing;
};

export default function QuoteModal({
  isOpen,
  onOpenChange,
  post,
  currentUser,
}: ReplyModal) {
  const { mutate: mutateInfiniteScroll } = useInfiniteScroll();
  const isMobile = useMediaQuery("(max-width: 420px)");
  const [editorValue, setEditorValue] = React.useState<
    DeltaStatic | undefined
  >();
  const [charLength, setCharLength] = React.useState(0);

  const [files, setFiles] = React.useState<AttachmentType[]>([]);

  const mediaRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments: AttachmentType[] = Array.from(e.target.files).map(
        (file) => ({
          type: "IMAGE",
          url: URL.createObjectURL(file),
          mime: file.type,
          name: file.name,
          extension: file.name.split(".").pop() as string,
          size: file.size.toString(),
          file: file,
        })
      );

      setFiles((prevFiles) => [...prevFiles, ...newAttachments]);
    }
  };

  const handleMedia = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (mediaRef && mediaRef.current) {
      mediaRef.current.click();
    }
  };

  const handleRemoveImage = (url: string) => {
    setFiles((prevFiles) =>
      prevFiles.filter((attachment) => attachment.url !== url)
    );
  };

  const { mutate: createReply } = useMutation({
    mutationKey: ["replyMutation"],
    mutationFn: async ({
      originalPostOwnerId,
      postId,
      repostType,
      content,
      imageUrl,
    }: {
      originalPostOwnerId: string;
      postId: string;
      repostType: RepostType;
      content: any;
      imageUrl: string;
    }) => {
      const payload: QuotePayload = {
        originalPostOwnerId,
        postId,
        repostType,
        content,
        imageUrl,
      };

      const { data } = await axios.post("/api/post/quote", payload);
      return data as string;
    },
    onSuccess: () => {
      mutateInfiniteScroll();
      setEditorValue(undefined);
      setFiles([]);
      toast.success("Reply has been created.");
    },
  });

  const [progress, setProgress] = React.useState(0);

  const handleReplySubmit = async () => {
    if (files) {
      const allFiles: File[] = [];
      files.map((file: AttachmentType) => {
        allFiles.push(file.file);
      });

      const res = await uploadFiles({
        files: allFiles,
        endpoint: "imageUploader",
        onUploadProgress: ({ file, progress }) => {
          // console.log(file === files);
          // calculateImageProgress(allFiles.length, file)
        },
      });

      if (res) {
        const urls: string[] = [];
        res.map((r) => {
          urls.push(r.url);
        });

        createReply({
          originalPostOwnerId: post.user_one.id,
          postId: post.id,
          repostType: RepostType.QUOTE,
          content: editorValue,
          imageUrl: [...urls].toString(),
        });

        return;
      }
    }

    createReply({
      originalPostOwnerId: post.user_one.id,
      postId: post.id,
      repostType: RepostType.QUOTE,
      content: editorValue,
      imageUrl: "",
    });
  };

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

  const imgUrls = post.image_url?.split(",").join(", ");

  let disabledByContent: boolean = true;

  if (charLength === 0 && files.length > 0) {
    disabledByContent = false;
  } else if (charLength > 0 && files.length === 0) {
    disabledByContent = false;
  } else if (charLength > 0 && files.length > 0) {
    disabledByContent = false;
  } else {
    disabledByContent = true;
  }

  return (
    <Modal
      placement="top"
      hideCloseButton
      disableAnimation
      size={isMobile ? "full" : "2xl"}
      classNames={{
        base: "bg-black w-full max-sm:h-full w-[600px] lg:h-fit rounded-xl px-0",
        backdrop: "bg-backdrop",
      }}
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader
              className="flex flex-col gap-1 px-4 h-[54px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex w-full justify-between">
                <Button
                  onClick={onClose}
                  isIconOnly
                  size="sm"
                  className="hover:bg-blue/10 w-fit rounded-full bg-transparent"
                >
                  <Icons.close className="fill-text h-5 w-5" />
                </Button>
                <Button
                  size="sm"
                  className="hover:bg-blue/10 w-fit px-4 rounded-full bg-transparent text-sm leading-4 text-blue font-bold"
                >
                  Draft
                </Button>
              </div>
            </ModalHeader>
            <ModalBody onClick={(e) => e.stopPropagation()}>
              <div>
                <QuoteFormEditor
                  currentUser={currentUser}
                  post={post}
                  files={files}
                  editorValue={editorValue}
                  charLength={charLength}
                  setCharLength={setCharLength}
                  setEditorValue={setEditorValue}
                  handleRemoveImage={handleRemoveImage}
                />
              </div>
              {/* ==================== */}

              <div className="flex flex-col space-y-3">
                <div className="flex h-fit overflow-hidden flex-col justify-between pt-3 px-3 mt-2 border rounded-xl border-[#2f3336]z-10">
                  <div className="flex gap-2 items-center mb-1">
                    <Avatar
                      className="w-5 h-5"
                      showFallback
                      src={post.user_one.avatar}
                      size="sm"
                    />

                    <div className="flex items-center gap-2">
                      <p className="font-bold">{post.user_one.name}</p>

                      <p className="text-[#555b61]">{post.user_one.username}</p>

                      <span className="text-gray">·</span>
                      <p className="text-[#555b61]">
                        {post.createdAt &&
                          formatTimeToNow(new Date(post.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <div>
                      {html.length > 0 && (
                        <div
                          className="pb-4"
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                      )}
                    </div>
                    {post?.image_url && (
                      <div className="flex justify-center">
                        {post.image_url && (
                          <AttachmentPost
                            imageUrl={post.image_url}
                            post={post}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="w-full flex justify-between items-center">
                <input
                  multiple
                  type="file"
                  className="hidden"
                  ref={mediaRef}
                  onChange={handleFileChange}
                />
                <div className="flex">
                  <Button
                    onClick={handleMedia}
                    size="sm"
                    isIconOnly
                    className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
                  >
                    <Icons.media className="fill-blue w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
                  >
                    <Icons.gif className="fill-blue w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
                  >
                    <Icons.poll className="fill-blue w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
                  >
                    <Icons.emoji className="fill-blue w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
                  >
                    <Icons.schedule className="fill-blue w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
                  >
                    <Icons.tagLocation className="fill-blue w-5 h-5" />
                  </Button>
                </div>
                <div className="flex gap-2 items-center h-full">
                  {charLength > 0 && (
                    <CircularProgress
                      size="sm"
                      value={charLength}
                      maxValue={280}
                      color="primary"
                      classNames={{
                        svgWrapper:
                          "w-[30px] h-[30px] flex justify-center items-center",
                        svg: "w-[20px] h-[20px]",
                      }}
                      aria-label="Reply length"
                    />
                  )}
                  <Button
                    onClick={handleReplySubmit}
                    size="sm"
                    isDisabled={disabledByContent}
                    className="hover:bg-blue/90 w-fit px-4 rounded-full bg-blue text-sm leading-4 text-white font-bold"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
