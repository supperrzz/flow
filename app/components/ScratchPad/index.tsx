import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.bubble.css";
import { actionState } from "../../state";
import { useRecoilValue } from "recoil";

const QuillNoSSRWrapper = dynamic(import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

const modules = {
  toolbar: [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "clean",
      { list: "ordered" },
      { list: "bullet" },
    ],
    // ["link", "image", "video"]
  ],
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

interface ScratchPadProps {
  storageKey: string;
  height: string;
  placeholder?: string;
  togglable?: boolean;
}

export default function ScratchPad({
  storageKey,
  height,
  placeholder,
  togglable,
}: ScratchPadProps) {
  const [value, setValue] = useState<string>();
  const [showPad, setShowPad] = useState<boolean>(togglable ? false : true);
  const currentAction = useRecoilValue(actionState);

  useEffect(() => {
    const data = localStorage.getItem(storageKey);
    const empty = !data || data === "<p><br></p>";
    if (!empty) {
      setValue(data);
    } else {
      setValue("");
    }
  }, [currentAction]);

  const MIN_WIDTH = togglable ? "350px" : "0";
  const padDisplay = showPad ? "opacity-100" : "opacity-0 overflow-hidden";
  const padTransitionClasses = `${padDisplay} transition-opacity`;

  useEffect(() => {
    if (!togglable) return;
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("#scratch-pad") === null) {
        setShowPad(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      id="scratch-pad"
      style={
        togglable
          ? {
              position: "fixed",
              bottom: "1.5rem",
              left: "1.5rem",
            }
          : {
              height: "100%",
            }
      }
    >
      <QuillNoSSRWrapper
        defaultValue={value}
        value={value}
        placeholder={placeholder || ""}
        modules={modules}
        formats={formats}
        theme="bubble"
        style={{
          height: showPad ? height : 0,
          minWidth: MIN_WIDTH,
        }}
        className={`${padTransitionClasses} bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-200 rounded-md border border-gray-300 dark:border-slate-700`}
        onChange={(content) => {
          setValue(content);
          localStorage.setItem(storageKey, content);
        }}
      />
      {togglable && (
        <button
          onClick={() => setShowPad(!showPad)}
          className={`text-xl bg-gray-200 dark:bg-slate-900 text-black dark:text-gray-200 p-3 mt-2 rounded-full border border-gray-300 ${
            showPad ? "shadow-inner" : ""
          } hover:bg-gray-300 dark:hover:bg-slate-700`}
        >
          {showPad ? "Hide" : "Show"} Scratch Pad
        </button>
      )}
    </div>
  );
}
