import ReactQuill, { UnprivilegedEditor, ReactQuillProps } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DeltaStatic, Sources } from "quill";
import * as React from "react";
import { Progress } from "@nextui-org/react";

type EditorProps = {
  focusHandler?: () => void;
  editorValue: DeltaStatic | undefined;
  setCharLength: (value: number) => void;
  setEditorValue: (value: DeltaStatic) => void;
  className: string;
  placeholder: string;
};

export default function Editor({
  focusHandler,
  editorValue,
  setCharLength,
  setEditorValue,
  className,
  placeholder,
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

  const quillRef = React.useRef(null);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className={className}>
      <ReactQuill
        ref={quillRef}
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
