"use client";

import React from "react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Selection,
  Button,
} from "@nextui-org/react";
import { Icons } from "../../icons";
import BirthdateSelect from "./bithdate-select";
import BioInput from "./bio-input";
import UsernameInput from "./username-input";
import { useDebouncedValue } from "@mantine/hooks";
import { OnboardingPayload } from "@/lib/validator/onboarding";
import axios from "axios";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { UserWithFollowersFollowing } from "@/types/db";

type OnboardingModalProps = {
  user: UserWithFollowersFollowing;
};

export default function OnboardingModal({ user }: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);

  const [monthValue, setMonthValue] = React.useState<Selection>(new Set([]));
  const [dayValue, setDayValue] = React.useState<Selection>(new Set([]));
  const [yearValue, setYearValue] = React.useState<Selection>(new Set([]));

  const [bio, setBio] = React.useState("");

  const [username, setUsername] = React.useState(user.username);
  const [debouncedUsername] = useDebouncedValue(username, 500);

  const { mutate: submitOnboarding } = useMutation({
    mutationFn: async () => {
      const payload: OnboardingPayload = {
        birthdate: `${[...yearValue][0]}-${[...monthValue][0]}-${
          [...dayValue][0]
        }`,
        bio: bio,
        username: username,
      };
      const { data } = await axios.post("/api/onboarding", payload);
      return data as string;
    },
    onError: (error) => {},
    onSuccess: (data) => {
      router.refresh();
    },
  });

  let isDisabled;

  if (step === 1) {
    isDisabled = !dayValue || !monthValue || !yearValue;
  } else if (step === 3) {
    isDisabled === !debouncedUsername;
  }

  return (
    <Modal
      isOpen={true}
      hideCloseButton={true}
      size="2xl"
      classNames={{
        base: "bg-black w-full w-[600px] h-[600px] rounded-xl",
        backdrop: "bg-backdrop",
      }}
      backdrop="blur"
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col items-center gap-1">
            <Icons.x className="fill-text w-7 h-7" />
          </ModalHeader>
          <ModalBody className="px-16">
            {step === 1 && (
              <BirthdateSelect
                setStep={setStep}
                setMonthValue={setMonthValue}
                monthValue={monthValue}
                setDayValue={setDayValue}
                dayValue={dayValue}
                setYearValue={setYearValue}
                yearValue={yearValue}
              />
            )}
            {step === 2 && (
              <BioInput setStep={setStep} bio={bio} setBio={setBio} />
            )}
            {step === 3 && (
              <UsernameInput
                setStep={setStep}
                step={step}
                user={user}
                setUsername={setUsername}
                debouncedUsername={debouncedUsername}
                submitOnboarding={submitOnboarding}
              />
            )}
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
}
