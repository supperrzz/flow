import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import QuillNoSSRWrapper from "react-quill";

const toolbarOptions = [
  [{ font: [] }, { header: [1, 2, 3, 4, 5, 6, false] }],
  [
    "bold",
    "italic",
    "underline",
    "strike",
    { align: [] },
    "blockquote",
    "code-block",
  ], // toggled buttons
  [
    { list: "ordered" },
    { list: "bullet" },
    { color: [] },
    { background: [] },
    "clean",
  ],
];

const modules = {
  toolbar: toolbarOptions,
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
  history: {
    delay: 2000,
    maxStack: 500,
    userOnly: true,
  },
};
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
const formats = [
  "header",
  "font",
  "size",
  "bold",
  "color",
  "background",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
];

export default function ScratchPad() {
  const [value, setValue] = useState<string>();
  const documentId = "";
  const storageKey = `document-${documentId}`;

  useEffect(() => {
    const data = localStorage.getItem(storageKey as string);
    const empty = !data || data === "<p><br></p>";
    if (!empty) {
      setValue(data);
    } else {
      setValue("");
    }
  }, [documentId]);

  // if (!documentId) return null;

  return (
    <div id="scratch-pad">
      <QuillNoSSRWrapper
        defaultValue={value}
        value={value}
        placeholder={"Start writing here..."}
        modules={modules}
        formats={formats}
        theme="snow"
        onChange={(content) => {
          setValue(content);
          localStorage.setItem(storageKey as string, content);
        }}
      />
    </div>
  );
}
