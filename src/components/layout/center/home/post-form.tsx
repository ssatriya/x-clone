"use client";

import { Avatar, Textarea, Button, Image } from "@nextui-org/react";

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

type TweetFormProps = {
  focusHandler: () => void;
  isFocus: boolean;
  user: User;
};

export default function PostForm({
  focusHandler,
  isFocus,
  user,
}: TweetFormProps) {
  const router = useRouter();
  const [content, setContent] = React.useState("");
  const { mutate: mutateInfiniteScroll } = useInfiniteScroll();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostPayload>({
    defaultValues: {
      content: "",
      imageUrl: "",
    },
    resolver: zodResolver(PostValidator),
  });

  const { mutate: createPost } = useMutation({
    mutationFn: async ({ content, imageUrl }: PostPayload) => {
      const payload: PostPayload = {
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
      // router.push("/home");
      router.refresh();
    },
  });

  const handlePostSubmit = async (data: PostPayload) => {
    const payload: PostPayload = {
      content: data.content,
      imageUrl: data.imageUrl,
    };

    createPost(payload);
  };

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
            className="border border-gray hover:bg-blue/10 flex h-6 w-fit rounded-full px-3 text-sm leading-4 text-blue font-bold"
          >
            Everyone
            <Icons.arrowDown className="fill-blue h-[15px] w-[15px]" />
          </Button>
        )}
        <Textarea
          {...register("content")}
          onFocus={focusHandler}
          onChange={handleChange}
          type="text"
          variant="flat"
          value={content}
          minRows={1}
          classNames={{
            base: "py-2",
            input: "text-lg bg-transparent placeholder:text-gray",
            inputWrapper:
              "rounded-none bg-transparent data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
          }}
          placeholder="What is happening?!"
        />
        {isFocus && (
          <div className="flex flex-col relative">
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
          <div className="flex">
            <Button
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
          <Button
            isDisabled={isSubmitting || content.length === 0}
            onClick={() => {
              handleSubmit(handlePostSubmit)();
            }}
            className="bg-blue hover:bg-blue/90 font-bold rounded-full"
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
