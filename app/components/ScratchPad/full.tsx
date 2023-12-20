import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { getCSSVar } from "@/app/utils";
import { currentDocumentState } from "@/app/state";
import { useRecoilState, useRecoilValue } from "recoil";
import { useAppConfig } from "@/app/store";
import { NEW_DOC_KEY } from "@/app/constant";
import { Selector, showToast } from "../ui-lib";

export default function App() {
  const themeColor = getCSSVar("--theme");
  const bgColor = getCSSVar("--white");
  const [value, setValue] = useState<string>();
  const storageKey = useRecoilValue(currentDocumentState);
  const appConfigStore = useAppConfig();

  useEffect(() => {
    const data = localStorage.getItem(storageKey as string);
    const empty = !data || data === "<p><br></p>";
    if (!empty) {
      setValue(data);
    } else {
      setValue("");
    }
  }, [storageKey]);

  const [documents, setDocuments] = useState<string[]>([]);
  useEffect(() => {
    const docs: string[] = [NEW_DOC_KEY];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("document-")) {
        docs.push(key);
      }
    }
    setDocuments(docs);
  }, []);
  const [document, setDocument] = useRecoilState(currentDocumentState);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Editor
        initialValue={value}
        onEditorChange={(content) => {
          localStorage.setItem(storageKey, content);
        }}
        apiKey="c9y9l8us1kzzfqftbay7hdp7t1nx76cy4p8h3es8jth7etiq"
        init={{
          height: "100%",
          plugins:
            "fullscreen autolink charmap emoticons image link lists media searchreplace table wordcount",
          toolbar:
            "selectDocument deleteDocument print | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
          skin: themeColor === "light" ? "oxide" : "oxide-dark",
          content_css: themeColor === "light" ? "light" : "dark",
          content_style: `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;700;900&display=swap');
            .mce-content-body { 
              background-color: ${bgColor};
              padding: 10px 30px;
            }
          body {
              font-family: "Noto Sans", sans-serif !important;
              font-size: ${appConfigStore.fontSize}px;
          } 
          `,
          branding: false,
          resize: false,
          toolbar_mode: "sliding",
          resize_img_proportional: true,
          text_patterns: [
            { start: "`", end: "`", format: "code" },
            { start: "```\n", end: "\n```", format: "codeblock" },
          ],
          // In your TinyMCE init configuration
          // ai_request: (request: any, respondWith: any) => {
          //   respondWith.stream((signal: any, streamMessage: any) => {
          //     // Adds each previous query and response as individual messages
          //     const conversation = request.thread.flatMap((event: any) => {
          //       if (event.response) {
          //         return [
          //           { role: "user", content: event.request.query },
          //           { role: "assistant", content: event.response.data },
          //         ];
          //       } else {
          //         return [];
          //       }
          //     });

          //     // Forms the new query sent to the API
          //     const content =
          //       request.context.length === 0 || conversation.length > 0
          //         ? request.query
          //         : `Question: ${request.query} Context: """${request.context}"""`;

          //     const messages = [
          //       ...conversation,
          //       { role: "system", content: request.system.join("\n") },
          //       { role: "user", content },
          //     ];

          //     const requestBody = {
          //       model: "gpt-3.5-turbo",
          //       temperature: 0.7,
          //       max_tokens: 800,
          //       messages,
          //       stream: true,
          //     };
          //     console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
          //     const openAiOptions = {
          //       signal,
          //       method: "POST",
          //       headers: {
          //         "Content-Type": "application/json",
          //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          //       },
          //       body: JSON.stringify(requestBody),
          //     };

          //     // This function passes each new message into the plugin via the `streamMessage` callback.
          //     const onmessage = (ev: any) => {
          //       const data = ev.data;
          //       if (data !== "[DONE]") {
          //         const parsedData = JSON.parse(data);
          //         const firstChoice = parsedData?.choices[0];
          //         const message = firstChoice?.delta?.content;
          //         if (message) {
          //           streamMessage(message);
          //         }
          //       }
          //     };

          //     const onerror = (error: any) => {
          //       // Stop operation and do not retry by the fetch-event-source
          //       throw error;
          //     };

          //     // Use microsoft's fetch-event-source library to work around the 2000 character limit
          //     // of the browser `EventSource` API, which requires query strings
          //     return fetchEventSource(
          //       "https://api.openai.com/v1/chat/completions",
          //       {
          //         ...openAiOptions,
          //         openWhenHidden: true,
          //         onmessage,
          //         onerror,
          //       },
          //     );
          //   });
          // },
          setup: function (editor) {
            editor.ui.registry.addButton("selectDocument", {
              text: "My Documents",
              onAction: function () {
                setShowModal(true);
              },
            });
          },
        }}
      />
      {showModal && (
        <Selector
          defaultSelectedValue={document}
          items={[
            ...documents.map((m) => ({
              title:
                m === NEW_DOC_KEY ? "New Document" : m.replace("document-", ""),
              value: m,
            })),
            {
              title: "Create new document",
              value: "new",
            },
          ]}
          onClose={() => setShowModal(false)}
          onSelection={(s) => {
            console.log(s);
            if (s[0] === "new") {
              const name = prompt("Enter a name for your document");
              const docKey = `document-${name}`;
              const docExists = documents.find((doc) => doc === docKey);
              if (docExists) {
                showToast("Document already exists");
                setDocument(docKey);
                return;
              }
              if (name) {
                localStorage.setItem(docKey, "");
                setDocuments([...documents, docKey]);
                setDocument(docKey);
              }
            }
            setDocument(s[0]);
            setShowModal(false);
            showToast("Switched to " + s[0].replace("document-", ""));
          }}
        />
      )}
    </>
  );
}
