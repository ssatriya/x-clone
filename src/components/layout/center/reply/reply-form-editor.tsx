import { Avatar } from "@nextui-org/react";
import { User } from "@prisma/client";
import dynamic from "next/dynamic";
import { DeltaStatic, Sources } from "quill";

const ReplyQuillEditor = dynamic(() => import("./reply-editor"), {
  ssr: false,
});

type ReplyFormEditorProps = {
  editorValue: DeltaStatic | undefined;
  setCharLength: (value: number) => void;
  setEditorValue: (value: DeltaStatic) => void;
  currentUser: User;
};

export default function ReplyFormEditor({
  editorValue,
  setCharLength,
  setEditorValue,
  currentUser,
}: ReplyFormEditorProps) {
  return (
    <div className="py-4 w-full h-full">
      <div className="flex gap-3">
        <div>
          <Avatar src={currentUser.avatar} />
        </div>
        <div className="w-full">
          <ReplyQuillEditor
            editorValue={editorValue}
            setCharLength={setCharLength}
            setEditorValue={setEditorValue}
          />
        </div>
      </div>
    </div>
  );
}
