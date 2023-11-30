import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { getCSSVar } from "@/app/utils";
import { currentDocumentState } from "@/app/state";
import { useRecoilValue } from "recoil";

export default function App() {
  const themeColor = getCSSVar("--theme");
  const bgColor = getCSSVar("--white");
  const [value, setValue] = useState<string>();
  const storageKey = useRecoilValue(currentDocumentState);

  useEffect(() => {
    const data = localStorage.getItem(storageKey as string);
    const empty = !data || data === "<p><br></p>";
    if (!empty) {
      setValue(data);
    } else {
      setValue("");
    }
  }, [storageKey]);
  return (
    <Editor
      apiKey="c9y9l8us1kzzfqftbay7hdp7t1nx76cy4p8h3es8jth7etiq"
      init={{
        height: "100%",
        plugins:
          "autolink charmap emoticons image link lists media searchreplace table wordcount checklist mediaembed casechange export formatpainter permanentpen footnotes advcode editimage tableofcontents powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss",
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
        skin: themeColor === "light" ? "oxide" : "oxide-dark",
        content_css: themeColor === "light" ? "light" : "dark",
        content_style: `.mce-content-body { background-color: ${bgColor} }`,
        branding: false,
        resize: false,
        toolbar_mode: "sliding",
        resize_img_proportional: true,
        text_patterns: [
          { start: "`", end: "`", format: "code" },
          { start: "```\n", end: "\n```", format: "codeblock" },
        ],
        // revisit ai later
        // ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
      }}
      initialValue={value}
      onEditorChange={(content, editor) => {
        localStorage.setItem("scratchpad", content);
      }}
    />
  );
}
