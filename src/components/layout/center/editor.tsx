import ReactQuill, { UnprivilegedEditor, ReactQuillProps } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DeltaStatic, Sources } from "quill";
import * as React from "react";

type EditorProps = {
  focusHandler: () => void;
  editorValue: DeltaStatic | undefined;
  setCharLength: (value: number) => void;
  setEditorValue: (value: DeltaStatic) => void;
};

export default function Editor({
  focusHandler,
  editorValue,
  setCharLength,
  setEditorValue,
}: EditorProps) {
  const handleChange = (
    value: string,
    deltaOp: DeltaStatic,
    sources: Sources,
    editor: UnprivilegedEditor
  ) => {
    const characterCount = editor.getLength() - 1;
    const content = editor.getContents();

    setCharLength(characterCount);
    setEditorValue(content);
  };

  const modules = {
    toolbar: false,
  };

  const formats = [
    // <-- commented-out to suppress auto bullets
    // "background",
    // "bold",
    // "color",
    // "font",
    // "code",
    // "italic",
    "link",
    // "size",
    // "strike",
    // "script",
    // "underline",
    // "blockquote",
    // "header",
    // "indent",
    // "list",
    // "align",
    // "direction",
    // "code-block",
    // "formula",
    // "image",
    // "video"
  ];

  return (
    <div className="max-w-4xl mx-auto relative py-2">
      <ReactQuill
        defaultValue={""}
        modules={modules}
        theme="snow"
        value={editorValue}
        formats={formats}
        onChange={handleChange}
        placeholder="Whats happening?"
        className="text-xl leading-6"
        onFocus={focusHandler}
      />
    </div>
  );
}