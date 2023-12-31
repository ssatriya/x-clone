import ReactQuill, { UnprivilegedEditor } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DeltaStatic, Sources } from "quill";
import * as React from "react";

type EditorProps = {
  focusHandler?: () => void;
  editorValue: DeltaStatic | undefined;
  setCharLength: (value: number) => void;
  setEditorValue: (value: DeltaStatic) => void;
  className: string;
  placeholder: string;
  isModalOpen: boolean;
};

export default function Editor({
  focusHandler,
  editorValue,
  setCharLength,
  setEditorValue,
  className,
  placeholder,
  isModalOpen,
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

  const quillEditorRef = React.useRef<ReactQuill>(null);

  React.useEffect(() => {
    if (isModalOpen) {
      quillEditorRef.current?.focus();
    }
  }, [isModalOpen]);

  return (
    <div className={className}>
      <ReactQuill
        ref={quillEditorRef}
        defaultValue={""}
        modules={modules}
        theme="snow"
        value={editorValue}
        formats={formats}
        onChange={handleChange}
        placeholder={placeholder}
        className="text-xl leading-6"
        onFocus={focusHandler}
      />
    </div>
  );
}
