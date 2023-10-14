"use client";

import { Icons } from "@/components/icons";
import { Button, Modal, ModalBody, ModalContent } from "@nextui-org/react";

type RepostModalMobileProps = {
  isOpen: () => void;
  onOpenChange: () => void;
  isRepostedByCurrentUser: boolean;
  repost: () => void;
};

export default function RepostModalMobile({
  isOpen,
  onOpenChange,
  isRepostedByCurrentUser,
  repost,
}: RepostModalMobileProps) {
  return (
    <Modal
      hideCloseButton
      size="4xl"
      // isOpen={isOpen}
      placement="bottom"
      onOpenChange={onOpenChange}
      classNames={{
        base: "bg-black h-fit",
        body: "px-0 pt-0 gap-0",
        backdrop: "bg-backdrop",
      }}
      className="rounded-t-2xl m-0"
      radius="none"
    >
      <ModalContent>
        {(onClose) => (
          <ModalBody className="flex flex-col justify-between items-center">
            <div className="w-full">
              {isRepostedByCurrentUser ? (
                <Button
                  onPress={() => repost()}
                  disableAnimation
                  className="bg-black w-full rounded-t-2xl rounded-b-none h-11 font-bold leading-5 text-base flex justify-start data-[pressed=true]:bg-hover"
                >
                  <Icons.repost className="h-5 w-5 fill-text" />
                  Undo repost
                </Button>
              ) : (
                <Button
                  onPress={() => repost()}
                  disableAnimation
                  className="bg-black w-full rounded-t-2xl rounded-b-none h-11 font-bold leading-5 text-base flex justify-start data-[pressed=true]:bg-hover"
                >
                  <Icons.repost className="h-5 w-5 fill-text" />
                  Repost
                </Button>
              )}
              <Button
                disabled
                disableAnimation
                className="bg-black w-full h-11 rounded-none font-bold leading-5 text-base flex justify-start data-[pressed=true]:bg-hover"
              >
                <Icons.quote className="h-5 w-5 fill-text" />
                Quote
              </Button>
            </div>
            <div className="px-4 py-3 w-full">
              <Button
                onPress={onClose}
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
  );
}
