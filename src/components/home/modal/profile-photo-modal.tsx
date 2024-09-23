"use client";

import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Props = {
  photo: string | null;
};

const ProfilePhotoModal = ({ photo }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const closeHandler = () => {
    setIsOpen(false);
    router.back();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
        router.back();
      }}
      className="relative z-50"
    >
      <DialogBackdrop
        className="fixed inset-0 bg-black/90"
        onClick={closeHandler}
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 bg-inherit rounded-full">
          {photo && (
            <Image
              src={photo}
              alt="user avatar"
              width={368}
              height={368}
              className="rounded-full"
            />
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ProfilePhotoModal;
