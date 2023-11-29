import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import "react-quill/dist/quill.snow.css";
import Quill from "quill";
// @ts-ignore
import { ImageDrop } from "quill-image-drop-module";
import htmlEditButton from "quill-html-edit-button";
// @ts-ignore
import ImageResize from "quill-image-resize-module-react";
import BlotFormatter, {
  AlignAction,
  DeleteAction,
  ImageSpec,
} from "quill-blot-formatter";
import { useRecoilValue } from "recoil";
import { currentDocumentState } from "@/app/state";
Quill.register("modules/blotFormatter", BlotFormatter);
Quill.register("modules/imageResize", ImageResize);
Quill.register("modules/imageDrop", ImageDrop);
Quill.register("modules/htmlEditButton", htmlEditButton);
Quill.register("modules/blotFormatter", BlotFormatter);
class CustomImageSpec extends ImageSpec {
  getActions() {
    return [AlignAction, DeleteAction];
  }
}

const toolbarOptions = [
  [{ font: [] }, { header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike", { align: [] }, "blockquote"], // toggled buttons
  [
    { list: "ordered" },
    { list: "bullet" },
    { color: [] },
    { background: [] },
    "link",
    "image",
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
  imageResize: {
    parchment: Quill.import("parchment"),
    modules: ["Resize", "DisplaySize"],
  },
  imageDrop: true,
  htmlEditButton: {},
  blotFormatter: {
    specs: [CustomImageSpec],
    overlay: {
      style: {
        border: "none",
      },
    },
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
  "align",
  "clean",
  "alt",
  "style",
  "width",
  "height",
];

export default function ScratchPad() {
  const [value, setValue] = useState<string>();
  const storageKey = useRecoilValue(currentDocumentState);
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    [],
  );

  useEffect(() => {
    const data = localStorage.getItem(storageKey as string);
    const empty = !data || data === "<p><br></p>";
    if (!empty) {
      setValue(data);
    } else {
      setValue("");
    }
  }, [storageKey]);

  // if (!documentId) return null;

  return (
    <div id="scratch-pad">
      <ReactQuill
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
