import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";

type ReplyModal = {
  isOpen: boolean;
  onOpenChange: () => void;
};

export default function ReplyModal({ isOpen, onOpenChange }: ReplyModal) {
  return (
    <Modal
      size="2xl"
      classNames={{
        base: "bg-black w-full w-[600px] h-[600px] rounded-xl",
        backdrop: "bg-blue/10",
      }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <Button
                size="sm"
                className="hover:bg-blue/10 w-fit px-4 rounded-full bg-transparent text-sm leading-4 text-blue font-bold"
              >
                Draft
              </Button>
            </ModalHeader>
            <ModalBody>content</ModalBody>
            <ModalFooter>
              <Button className="hover:bg-blue/90 w-fit px-4 rounded-full bg-blue text-sm leading-4 text-white font-bold">
                Reply
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
