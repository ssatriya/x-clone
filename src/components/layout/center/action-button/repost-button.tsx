import { Icons } from "@/components/icons";
import QuoteModal from "@/components/modal/quote/quote-modal";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { cn } from "@/lib/utils";
import { RepostPayload } from "@/lib/validator/repost";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { useMediaQuery } from "@mantine/hooks";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from "@nextui-org/react";
import { RepostType, Repost } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { toast } from "sonner";

type RepostButtonProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUser: UserWithFollowersFollowing;
  reposts: Repost[];
};

type RepostT = Omit<Repost, "createdAt">;

export default function RepostButton({
  currentUser,
  post,
  reposts,
}: RepostButtonProps) {
  const isMobile = useMediaQuery("(max-width: 480px)");
  const {
    isOpen: isOpenOption,
    onOpen: onOpenOption,
    onOpenChange: onOpenChangeOption,
  } = useDisclosure();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [repostsAmount, setRepostsAmount] = React.useState<RepostT[]>(reposts);

  const { mutate: mutateInfiniteScroll } = useInfiniteScroll();

  const queryClient = useQueryClient();

  const { data: repostData } = useQuery({
    queryKey: ["repostData", post],
    queryFn: async () => {
      const { data } = await axios.get("/api/post/repost", {
        params: {
          postId: post.id,
        },
      });
      return data;
    },
  });

  React.useEffect(() => {
    if (repostData) {
      setRepostsAmount(repostData);
    }
  }, [repostData]);

  const { mutate: repost } = useMutation({
    mutationKey: ["repostButton"],
    mutationFn: async () => {
      const payload: RepostPayload = {
        postId: post.id,
        originalPostOwnerId: post.user_one.id,
        repostType: RepostType.REPOST,
      };

      const { data } = await axios.patch("/api/post/repost", payload);
      return data;
    },
    onError: (error) => {},
    onMutate: async () => {
      const repostIndex = repostsAmount.findIndex(
        (repost) =>
          repost.post_id === post.id && repost.user_id === currentUser.id
      );

      if (repostIndex !== -1) {
        setRepostsAmount((prevRepost) => {
          const newRepost = [...prevRepost];
          newRepost.splice(repostIndex, 1);
          return newRepost;
        });
      } else {
        setRepostsAmount((prevRepost) => [
          ...prevRepost,
          {
            user_id: currentUser.id,
            post_id: post.id,
            repost_type: "REPOST",
          },
        ]);
        toast.success("Reposted");
      }
    },
    onSettled: () => {
      mutateInfiniteScroll();
      // disabled this query invalidation temporarely
      // queryClient.invalidateQueries({ queryKey: ["repostData"] });
    },
  });

  let isRepostedByCurrentUser: boolean = false;
  if (currentUser) {
    isRepostedByCurrentUser = repostsAmount.some(
      (repost) =>
        repost.user_id === currentUser.id && repost.post_id === post.id
    );
  }

  // Modal
  if (isMobile) {
    return (
      <RepostButtonMobile
        currentUser={currentUser}
        isOpen={isOpen}
        isOpenOption={isOpenOption}
        isRepostedByCurrentUser={isRepostedByCurrentUser}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
        onOpenChangeOption={onOpenChangeOption}
        onOpenOption={onOpenOption}
        post={post}
        repost={repost}
        repostsAmount={repostsAmount}
      />
    );
  }

  return (
    <>
      <div className="flex items-center group">
        <Dropdown
          className="p-0 rounded-xl"
          classNames={{
            base: "bg-black min-w-[110px] shadow-normal",
          }}
        >
          <DropdownTrigger>
            <Button
              size="sm"
              isIconOnly
              className="rounded-full bg-transparent flex items-center justify-center gap-2 group-hover:bg-green-600/10"
            >
              <Icons.repost
                className={cn(
                  isRepostedByCurrentUser
                    ? "fill-green-600"
                    : "fill-gray group-hover:fill-green-600",
                  "w-[18px] h-[18px]"
                )}
              />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="repost options" className="p-0">
            {isRepostedByCurrentUser ? (
              <DropdownItem
                onClick={() => repost()}
                startContent={
                  <Icons.repost className="w-[18px] h-[18px] fill-white" />
                }
                key="repost"
                className="data-[hover=true]:bg-white/5 rounded-t-lg rounded-b-none px-4 py-3"
                textValue="Repost"
              >
                <p className="font-bold">Undo repost</p>
              </DropdownItem>
            ) : (
              <DropdownItem
                onClick={() => repost()}
                startContent={
                  <Icons.repost className="w-[18px] h-[18px] fill-white" />
                }
                key="repost"
                className="data-[hover=true]:bg-white/5 rounded-t-lg rounded-b-none px-4 py-3"
                textValue="Repost"
              >
                <p className="font-bold">Repost</p>
              </DropdownItem>
            )}
            <DropdownItem
              onPress={() => {
                onOpenOption();
                onOpen();
              }}
              startContent={
                <Icons.quote className="w-[18px] h-[18px] fill-white" />
              }
              key="quote"
              textValue="Quote"
              className="data-[hover=true]:bg-white/5 rounded-b-lg rounded-t-none px-4 py-3"
            >
              <p className="font-bold">Quote</p>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <p
          className={cn(
            isRepostedByCurrentUser ? "text-green-600" : " text-gray ",
            "text-sm group-hover:text-green-600 tabular-nums"
          )}
        >
          {repostsAmount.length}
        </p>
      </div>

      <QuoteModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        post={post}
        currentUser={currentUser}
      />
    </>
  );
}

type RepostButtonMobile = {
  onOpenOption: () => void;
  isRepostedByCurrentUser: boolean;
  repostsAmount: RepostT[];
  onOpenChangeOption: () => void;
  isOpenOption: boolean;
  repost: () => void;
  onOpen: () => void;
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  isOpen: boolean;
  onOpenChange: () => void;
  currentUser: UserWithFollowersFollowing;
};
export function RepostButtonMobile({
  onOpenOption,
  isRepostedByCurrentUser,
  repostsAmount,
  onOpenChangeOption,
  isOpenOption,
  repost,
  onOpen,
  post,
  isOpen,
  onOpenChange,
  currentUser,
}: RepostButtonMobile) {
  return (
    <>
      <div className="flex items-center group">
        <Button
          onPress={onOpenOption}
          size="sm"
          isIconOnly
          className="rounded-full bg-transparent flex items-center justify-center gap-2 group-hover:bg-green-600/10"
        >
          <Icons.repost
            className={cn(
              isRepostedByCurrentUser
                ? "fill-green-600"
                : "fill-gray group-hover:fill-green-600",
              "w-[18px] h-[18px]"
            )}
          />
        </Button>
        <p
          className={cn(
            isRepostedByCurrentUser ? "text-green-600" : " text-gray ",
            "text-sm group-hover:text-green-600 tabular-nums"
          )}
        >
          {repostsAmount.length}
        </p>
      </div>

      <Modal
        hideCloseButton
        size="4xl"
        isOpen={isOpenOption}
        placement="bottom"
        onOpenChange={onOpenChangeOption}
        classNames={{
          base: "bg-black h-fit",
          body: "px-0 pt-0 gap-0",
          backdrop: "bg-backdrop",
        }}
        className="rounded-t-2xl m-0"
        radius="none"
      >
        <ModalContent>
          {(onCloseOption) => (
            <ModalBody className="flex flex-col justify-between items-center">
              <div className="w-full">
                {isRepostedByCurrentUser ? (
                  <Button
                    onPress={() => {
                      repost();
                      onCloseOption();
                    }}
                    disableAnimation
                    className="bg-black w-full rounded-t-2xl rounded-b-none h-11 font-bold leading-5 text-base flex justify-start data-[pressed=true]:bg-hover"
                  >
                    <Icons.repost className="h-5 w-5 fill-text" />
                    Undo repost
                  </Button>
                ) : (
                  <Button
                    onPress={() => {
                      repost();
                      onCloseOption();
                    }}
                    disableAnimation
                    className="bg-black w-full rounded-t-2xl rounded-b-none h-11 font-bold leading-5 text-base flex justify-start data-[pressed=true]:bg-hover"
                  >
                    <Icons.repost className="h-5 w-5 fill-text" />
                    Repost
                  </Button>
                )}
                <Button
                  onPress={() => {
                    // onOpenOption();
                    onOpen();
                    onCloseOption();
                  }}
                  disableAnimation
                  className="bg-black w-full h-11 rounded-none font-bold leading-5 text-base flex justify-start data-[pressed=true]:bg-hover"
                >
                  <Icons.quote className="h-5 w-5 fill-text" />
                  Quote
                </Button>
              </div>
              <div className="px-4 py-3 w-full">
                <Button
                  onPress={onCloseOption}
                  disableAnimation
                  className="w-full h-11 border-text/70 border-1 rounded-full font-bold leading-5 text-base bg-black data-[pressed=true]:bg-text/25"
                >
                  Cancel
                </Button>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>

      <QuoteModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        post={post}
        currentUser={currentUser}
      />
    </>
  );
}
