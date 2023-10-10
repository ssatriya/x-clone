"use client";

import { Avatar, Button, CircularProgress, Divider } from "@nextui-org/react";

import React from "react";
import { Icons } from "@/components/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { PostPayload, PostValidator } from "@/lib/validator/post";
import axios from "axios";
import { toast } from "sonner";
import { User } from "@prisma/client";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { uploadFiles } from "@/lib/uploadthing";
import dynamic from "next/dynamic";
import { DeltaStatic } from "quill";
import { AttachmentType } from "@/types/types";

const QuillEditor = dynamic(() => import("./editor"), { ssr: false });

type PostFormProps = {
  focusHandler: () => void;
  isFocus: boolean;
  user: User;
};

export default function PostFormEditor({
  focusHandler,
  isFocus,
  user,
}: PostFormProps) {
  const router = useRouter();
  const [content, setContent] = React.useState("");
  const { mutate: mutateInfiniteScroll } = useInfiniteScroll();

  const [editorValue, setEditorValue] = React.useState<
    DeltaStatic | undefined
  >();
  const [charLength, setCharLength] = React.useState(0);

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostPayload>({
    defaultValues: {
      content: "",
      imageUrl: "",
    },
    resolver: zodResolver(PostValidator),
  });

  const { mutate: createPost } = useMutation({
    mutationFn: async ({
      content,
      imageUrl,
    }: {
      content: any;
      imageUrl: string;
    }) => {
      const payload = {
        content,
        imageUrl,
      };

      const { data } = await axios.post("/api/post", payload);
      return data;
    },
    onError: () => {
      toast.error("Something went wrong", {
        description: "Failed to submit post, try again later.",
      });
    },
    onSuccess: () => {
      mutateInfiniteScroll();
      toast.success("Post has been created.");
      setContent("");
      router.refresh();
    },
  });

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
    if (!isFocus) {
      focusHandler();
      return;
    }
    if (mediaRef && mediaRef.current) {
      mediaRef.current.click();
    }
  };

  const className = cn(
    files.length > 0 ? "h-[300px] mb-4" : "",
    "grid gap-2 w-full",
    {
      "grid-rows-1": files.length <= 2,
      "grid-rows-2": files.length > 2,
      "grid-cols-1": files.length === 1,
      "grid-cols-2": files.length > 1,
    }
  );

  const handleRemoveImage = (url: string) => {
    setFiles((prevFiles) =>
      prevFiles.filter((attachment) => attachment.url !== url)
    );
  };

  const handlePostSubmit = async (data: PostPayload) => {
    const payload: PostPayload = {
      content: data.content,
      imageUrl: data.imageUrl,
    };

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
        setValue("imageUrl", [...urls].toString());

        // let newData = {
        //   ...data,
        //   imageUrl: [...urls].toString(),
        // };

        createPost({ content: editorValue, imageUrl: [...urls].toString() });
        setFiles([]);
        setEditorValue(undefined);
        reset();
        return;
      }
    }

    createPost({ content: editorValue, imageUrl: "" });
    setEditorValue(undefined);
  };

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
    <div className="flex justify-between py-2 px-4 gap-4 border-b">
      <div className="h-fit">
        <Avatar showFallback src={user.avatar} />
      </div>
      <div className="w-full flex flex-col">
        {isFocus && (
          <Button
            variant="bordered"
            size="sm"
            className="border border-gray hover:bg-blue/10 flex h-6 w-fit rounded-full px-3 text-sm leading-4 text-blue font-bold mb-2"
          >
            Everyone
            <Icons.arrowDown className="fill-blue h-[15px] w-[15px]" />
          </Button>
        )}
        <>
          <div className="w-full">
            <QuillEditor
              focusHandler={focusHandler}
              editorValue={editorValue}
              setCharLength={setCharLength}
              setEditorValue={setEditorValue}
            />
          </div>
          <div className={cn(className)}>
            {files.map((attachment, i) => (
              <Attachment
                url={attachment.url}
                fill={files.length === 3 && i === 0}
                onRemoveAttachment={handleRemoveImage}
                key={i}
              />
            ))}
          </div>
        </>
        {isFocus && (
          <div className="flex flex-col relative mt-2">
            <Button
              variant="flat"
              size="sm"
              className="mb-[1px] 4absolute -left-3 flex items-center gap-2 w-fit rounded-full h-6 bg-transparent hover:bg-blue/10"
            >
              <Icons.globe className="fill-blue w-5 h-5" />
              <p className="text-sm font-semibold text-blue">
                Everyone can reply
              </p>
            </Button>
            <div className="border-b border-[#2f3336] mt-4" />
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
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
              <>
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
                  aria-label="Post length"
                />
                <div className="px-[2px] h-full py-[2px]">
                  <Divider orientation="vertical" className="w-[1px]" />
                </div>
                {/* <Button
                  size="sm"
                  isIconOnly
                  className="rounded-full data-[hover=true]:bg-blue/10 h-[30px] w-[30px] border bg-black"
                >
                  <Icons.plusIcon className="h-4 w-4 fill-blue p-0" />
                </Button> */}
              </>
            )}
            <Button
              size="sm"
              isDisabled={isSubmitting || disabledByContent}
              onClick={() => handleSubmit(handlePostSubmit)()}
              className="bg-blue hover:bg-blue/90 font-bold rounded-full"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type AttachmentProps = {
  url: string;
  fill: boolean;
  onRemoveAttachment?: (url: string) => void;
};

export const Attachment = ({
  url,
  fill,
  onRemoveAttachment,
}: AttachmentProps) => {
  const className = cn("overflow-hidden relative rounded-2xl shadow", {
    "row-span-2": fill,
  });

  return (
    <div className={className}>
      {onRemoveAttachment && (
        <div className="absolute right-1 top-1">
          <Button
            onClick={() => onRemoveAttachment(url)}
            isIconOnly
            size="sm"
            className="absolute bg-black/70 rounded-full z-50 right-1 top-1"
          >
            <Icons.close className="h-[18px] w-[18px] fill-text" />
          </Button>
        </div>
      )}
      <img className="h-full w-full object-cover" alt="Attachment" src={url} />
    </div>
  );
};
