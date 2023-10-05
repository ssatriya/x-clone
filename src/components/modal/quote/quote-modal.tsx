import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import * as React from "react";

export default function QuoteModal() {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <Button className="text-blue hover:bg-blue/10">Draft</Button>
            </ModalHeader>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
