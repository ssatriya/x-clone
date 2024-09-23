import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

import { Button } from "@/components/ui/button";

type Props = {
  isFollowing: boolean;
  follow: () => void;
  username: string;
  size: "default" | "sm" | "lg" | "icon";
};

const FollowButton = ({ isFollowing, follow, username, size }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFollow = () => {
    if (!isFollowing) {
    }
    follow();
  };

  return (
    <>
      {!isFollowing && (
        <Button
          onClick={handleFollow}
          variant="secondary"
          size={size}
          className="text-[15px] leading-5 font-bold"
        >
          Follow
        </Button>
      )}
      {isFollowing && (
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size={size}
          className="text-[15px] leading-5 font-bold bg-inherit border border-muted-foreground text-secondary-lighter transition-all rounded-full hover:bg-red-700/10 hover:border-red-700 group min-w-[104px]"
        >
          <span className="group-hover:hidden">Following</span>
          <span className="text-red-600 hidden group-hover:block">
            Unfollow
          </span>
        </Button>
      )}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-backdrop" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="bg-black w-[320px] rounded-2xl p-8 sm:mx-0 sm:my-0">
            <h1 className="font-bold text-xl leading-6 mb-2">
              Unfollow {username}?
            </h1>
            <div className="text-[15px] leading-5 text-gray break-words">
              <span className="">
                Their posts will no longer show up in your For You timeline. You
                can still view their profile, unless their posts are protected.
              </span>
            </div>
            <div className="mt-6 flex flex-col">
              <Button
                onClick={() => {
                  handleFollow();
                  setIsOpen(false);
                }}
                variant="secondary"
                className="h-11 rounded-full mb-3 bg-secondary-lighter text-black font-bold text-[15px] data-[hover=true]:bg-secondary-lighter/90 leading-20"
              >
                Unfollow
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="h-11 rounded-full bg-inherit border border-muted-foreground font-bold text-secondary-lighter hover:bg-border/50 text-[15px] leading-20"
              >
                Cancel
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default FollowButton;
