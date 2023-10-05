import { Icons } from "@/components/icons";
import ReplyModal from "@/components/modal/reply/reply-modal";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { Repost } from "@prisma/client";

type ReplyButtonProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUserId: string;
  reposts: Repost[];
};

export default function ReplyButton({
  post,
  currentUserId,
  reposts,
}: ReplyButtonProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="flex items-center group">
      <Button
        onPress={onOpen}
        size="sm"
        isIconOnly
        className="rounded-full bg-transparent flex items-center justify-center gap-2 group-hover:bg-blue/10"
      >
        <Icons.reply className="fill-gray w-[18px] h-[18px] group-hover:fill-blue" />
      </Button>
      <p className="text-sm text-gray group-hover:text-blue">4</p>

      <ReplyModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
}
