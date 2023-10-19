"use client";

import { Icons } from "@/components/icons";
import { useMediaQuery } from "@mantine/hooks";
import {
  Avatar,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import { User } from "@prisma/client";
import Image from "next/image";
import * as React from "react";

import placeholder from "../../../../public/background-placeholder.png";
import AvatarEditor from "./avatar-editor";
import getCroppedImg from "@/lib/cropImage";
import BackgroundEditor from "./background-editor";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPhotoFile } from "@/types/types";
import { uploadFiles, useUploadThing } from "@/lib/uploadthing";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type EditProfileModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  currentUser: User;
  onOpen: () => void;
};

const formSchema = z.object({
  backgroundPhoto: z.string().optional(),
  avatar: z.string().optional(),
  name: z.string().optional(),
  bio: z.string().optional(),
});
type FormSchema = z.infer<typeof formSchema>;

export default function EditProfileModal({
  isOpen,
  onOpen,
  onOpenChange,
  currentUser,
}: EditProfileModalProps) {
  const isMobile = useMediaQuery("(max-width: 420px)");
  const avatarRef = React.useRef<HTMLInputElement>(null);
  const backgroundRef = React.useRef<HTMLInputElement>(null);
  const [currentView, setCurrentView] = React.useState<
    "main" | "avatar" | "background"
  >("main");

  // Avatar
  const [avatarFile, setAvatarFile] = React.useState<File>();
  const [avatarName, setAvatarName] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [cropAvatar, setCropAvatar] = React.useState({ x: 0, y: 0 });
  const [zoomAvatar, setZoomAvatar] = React.useState<number>(1);
  const [croppedAvatarPixels, setCroppedAvatarPixels] = React.useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  }>({ width: 0, height: 0, x: 0, y: 0 });

  // Background
  const [backgroundFile, setBackgroundFile] = React.useState<File>();
  const [backgroundName, setBackgroundName] = React.useState("");
  const [backgroundUrl, setBackgroundUrl] = React.useState("");
  const [cropBackground, setCropBackground] = React.useState({ x: 0, y: 0 });
  const [zoomBackground, setZoomBackground] = React.useState<number>(1);
  const [croppedBackgroundPixels, setCroppedBackgroundPixels] = React.useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  }>({ width: 0, height: 0, x: 0, y: 0 });

  // ==========================

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setAvatarName(file.name);

      setAvatarUrl(objectUrl);
      setCurrentView("avatar");
    }
  };

  const handleAvatarButton = () => {
    if (avatarRef && avatarRef.current) {
      avatarRef.current.click();
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setBackgroundName(file.name);

      setBackgroundUrl(objectUrl);
      setCurrentView("background");
    }
  };

  const handleBackgroundButton = () => {
    if (backgroundRef && backgroundRef.current) {
      backgroundRef.current.click();
    }
  };

  React.useEffect(() => {
    setZoomAvatar(1);
    setZoomBackground(1);
  }, [avatarUrl]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleBack = async () => {
    if (currentView === "avatar") {
      const croppedAvatar = await getCroppedImg(avatarUrl, croppedAvatarPixels);

      if (croppedAvatar) {
        setAvatarUrl(croppedAvatar);
        console.log(croppedAvatar);

        axios.get(croppedAvatar, { responseType: "blob" }).then((res) => {
          const f = new File([res.data], avatarName, {
            type: res.data.type,
          });
          setAvatarFile(f);
        });
      }

      setCurrentView("main");
    } else if (currentView === "background") {
      const croppedBackground = await getCroppedImg(
        backgroundUrl,
        croppedBackgroundPixels
      );

      if (croppedBackground) {
        setBackgroundUrl(croppedBackground);
        axios.get(croppedBackground, { responseType: "blob" }).then((res) => {
          const f = new File([res.data], backgroundName, {
            type: res.data.type,
          });
          setBackgroundFile(f);
        });
      }

      setCurrentView("main");
    }
  };

  // Mutation
  const { mutate: updateProfile } = useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: async ({
      avatar,
      backgroundPhoto,
      bio,
      name,
    }: {
      avatar: string | "";
      backgroundPhoto: string | "";
      bio: string | "";
      name: string | "";
    }) => {
      const payload = {
        avatar,
        backgroundPhoto,
        bio,
        name,
      };

      const { data } = await axios.post(
        `/api/profile/${currentUser.id}`,
        payload
      );
      return data;
    },
  });

  // Forms
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatar: currentUser.avatar,
      backgroundPhoto: "",
      bio: currentUser.bio || "",
      name: currentUser.name,
    },
  });

  const handleProfileEdit = async (data: FormSchema) => {
    if (!avatarFile && !backgroundFile) {
      return;
    }
    if (avatarFile) {
      const res = await uploadFiles({
        endpoint: "userPhoto",
        files: [avatarFile],
      });

      if (res) {
        updateProfile({
          bio: data.bio || "",
          name: data.name || "",
          backgroundPhoto: "",
          avatar: res[0].url,
        });
      }
      return;
    }
    if (backgroundFile) {
      const res = await uploadFiles({
        endpoint: "userPhoto",
        files: [backgroundFile],
      });
      updateProfile({
        bio: data.bio || "",
        name: data.name || "",
        backgroundPhoto: res[0].url,
        avatar: "",
      });
      return;
    }
    // if (avatarFile && backgroundFile) {
    //   const avatarRes = await uploadFiles({
    //     endpoint: "userPhoto",
    //     files: [avatarFile.file],
    //   });
    //   const backgroundRes = await uploadFiles({
    //     endpoint: "userPhoto",
    //     files: [backgroundFile.file],
    //   });
    //   updateProfile({
    //     bio: data.bio || "",
    //     name: data.name || "",
    //     backgroundPhoto: backgroundRes[0].url,
    //     avatar: avatarRes[0].url,
    //   });
    //   return;
    // }

    updateProfile({
      bio: data.bio || "",
      name: data.name || "",
      backgroundPhoto: "",
      avatar: "",
    });
  };

  return (
    <Modal
      isDismissable={currentView === "main" ? true : false}
      hideCloseButton
      isOpen={isOpen}
      disableAnimation
      size={isMobile ? "full" : "2xl"}
      onOpenChange={onOpenChange}
      classNames={{
        backdrop: "bg-backdrop",
        base: "bg-black w-full max-sm:h-full w-[600px] lg:h-[660px] rounded-2xl px-0 overflow-y-auto",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="sticky top-0 z-50 bg-black">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-6">
                  {currentView === "main" ? (
                    <Button isIconOnly size="sm" className="rounded-full">
                      <Icons.close className="h-5 w-5 fill-text" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      isIconOnly
                      onClick={handleBack}
                      className="rounded-full"
                    >
                      <Icons.arrowLeft className="h-5 w-5 fill-text" />
                    </Button>
                  )}
                  <p className="font-bold text-xl leading-6">Edit profile</p>
                </div>
                {currentView === "main" ? (
                  <Button
                    isLoading={isSubmitting}
                    onClick={() => handleSubmit(handleProfileEdit)()}
                    size="sm"
                    className="bg-text rounded-full text-sm leading-4 text-black font-bold hover:bg-text/90"
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    // onClick={applyAvatarHandler}
                    size="sm"
                    className="bg-text rounded-full text-sm leading-4 text-black font-bold hover:bg-text/90"
                  >
                    Apply
                  </Button>
                )}
              </div>
            </ModalHeader>
            <ModalBody className="px-[2px] pt-0">
              {currentView === "avatar" && (
                <AvatarEditor
                  avatarUrl={avatarUrl}
                  cropAvatar={cropAvatar}
                  zoomAvatar={zoomAvatar}
                  setZoomAvatar={setZoomAvatar}
                  setCroppedAvatarPixels={setCroppedAvatarPixels}
                  setCropAvatar={setCropAvatar}
                />
              )}
              {currentView === "background" && (
                <BackgroundEditor
                  backgroundUrl={backgroundUrl}
                  cropBackground={cropBackground}
                  zoomBackground={zoomBackground}
                  setZoomBackground={setZoomBackground}
                  setCroppedBackgroundPixels={setCroppedBackgroundPixels}
                  setCropBackground={setCropBackground}
                />
              )}
              {currentView === "main" && (
                <>
                  <div className="w-full relative">
                    <div className="max-h-[200px] overflow-hidden">
                      <div className="relative">
                        <input
                          {...register("backgroundPhoto")}
                          type="file"
                          className="hidden"
                          ref={backgroundRef}
                          onChange={handleBackgroundChange}
                        />
                        {currentUser.background_photo ? (
                          <Image
                            src={
                              !!backgroundUrl
                                ? backgroundUrl
                                : currentUser.background_photo
                            }
                            height={200}
                            width={600}
                            alt="placholder"
                          />
                        ) : (
                          <Image
                            src={!!backgroundUrl ? backgroundUrl : placeholder}
                            height={200}
                            width={600}
                            alt="placholder"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/60" />
                        <div className="w-full gap-[22px] justify-center items-center flex absolute top-[50%] -translate-y-[50%]">
                          <Button
                            onClick={handleBackgroundButton}
                            size="sm"
                            isIconOnly
                            className="bg-text/10 hover:bg-text/20 h-[42px] w-[42px] rounded-full z-50"
                          >
                            <Icons.camera className="w-[22px] h-[22px] fill-text" />
                          </Button>
                          <Button
                            size="sm"
                            isIconOnly
                            className="bg-text/10 hover:bg-text/20 h-[42px] w-[42px] rounded-full z-50"
                          >
                            <Icons.close className="w-[22px] h-[22px] fill-text" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <input
                      {...register("avatar")}
                      type="file"
                      className="hidden"
                      ref={avatarRef}
                      onChange={handleAvatarChange}
                    />
                    <Avatar
                      showFallback
                      src={!!avatarUrl ? avatarUrl : currentUser.avatar}
                      isBordered
                      className="absolute ml-4 -translate-y-[50%] h-[112px] w-[112px]"
                    />
                    <div className="absolute ml-4 -translate-y-[50%] h-[112px] w-[112px] bg-black/60 rounded-full z-40" />
                    <Button
                      onClick={handleAvatarButton}
                      size="sm"
                      isIconOnly
                      className="bg-text/10 hover:bg-text/20 absolute ml-4 -translate-y-[50%] translate-x-[80%] h-[42px] w-[42px] rounded-full z-50"
                    >
                      <Icons.camera className="w-[22px] h-[22px] fill-text" />
                    </Button>
                  </div>
                  <div className="mt-20 px-4 flex flex-col gap-6">
                    <Input
                      {...register("name")}
                      variant="bordered"
                      // value={currentUser.name}
                      label="Name"
                      type="text"
                      classNames={{
                        inputWrapper:
                          "rounded-md group-data-[focus=true]:border-blue",
                        input: "mt-[4px] -ml-[2px] text-[17px]",
                        label:
                          "group-data-[focus=true]:text-blue text-gray text-[15px]",
                      }}
                    />
                    <Textarea
                      {...register("bio")}
                      maxLength={160}
                      //   onChange={handleChange}
                      value={currentUser.bio || ""}
                      label="Bio"
                      minRows={2}
                      variant="bordered"
                      classNames={{
                        inputWrapper:
                          "rounded-md group-data-[focus=true]:border-blue",
                        label: "group-data-[focus=true]:text-blue text-[15px]",
                      }}
                    />
                    <Input
                      disabled
                      variant="bordered"
                      value=""
                      label="Location"
                      type="text"
                      classNames={{
                        inputWrapper:
                          "rounded-md group-data-[focus=true]:border-blue",
                        input: "mt-[4px] -ml-[2px] text-[17px]",
                        label:
                          "group-data-[focus=true]:text-blue text-gray text-[15px]",
                      }}
                    />
                    <Input
                      disabled
                      variant="bordered"
                      value=""
                      label="Website"
                      type="text"
                      classNames={{
                        inputWrapper:
                          "rounded-md group-data-[focus=true]:border-blue",
                        input: "mt-[4px] -ml-[2px] text-[17px]",
                        label:
                          "group-data-[focus=true]:text-blue text-gray text-[15px]",
                      }}
                    />
                  </div>
                </>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
