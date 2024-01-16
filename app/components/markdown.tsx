import ReactMarkdown from "react-markdown";
import RemarkBreaks from "remark-breaks";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect } from "react";
import { copyToClipboard, downloadAs } from "../utils";
import mermaid from "mermaid";
import pptxgen from "pptxgenjs";

// @ts-ignore
import html2pdf from "html2pdf.js";
// @ts-ignore
import pdfMake from "pdfmake/build/pdfmake";
// @ts-ignore
import pdfFonts from "pdfmake/build/vfs_fonts";

// Set the fonts to use
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import LoadingIcon from "../icons/three-dots.svg";
import React from "react";
// How was this used before???
import { useDebouncedCallback } from "use-debounce";
import { showImageModal, showToast } from "./ui-lib";
import { useMaskStore } from "../store/mask";
import { EmojiAvatar } from "./emoji";
import { IconButton } from "./button";
import AddIcon from "../icons/add.svg";
import DownloadIcon from "../icons/download.svg";
import { useChatStore } from "../store";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";

interface DocumentDefinition {
  watermark?: {
    text: string;
    color: string;
    opacity: number;
  };
}

const vaPreviewHeaderStyle = {
  marginTop: 0,
  marginBottom: "1rem",
};

const vaSubHeaderStyle = {
  marginBottom: "0.5rem",
  marginTop: "0.5rem",
};

export const Mermaid = (props: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (props.code && ref.current) {
      mermaid
        .run({
          nodes: [ref.current],
          suppressErrors: true,
        })
        .catch((e) => {
          setHasError(true);
          console.error("[Mermaid] ", e.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.code]);

  function viewSvgInNewWindow() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([text], { type: "image/svg+xml" });
    showImageModal(URL.createObjectURL(blob));
  }

  if (hasError) {
    return null;
  }

  return (
    <div
      className="no-dark mermaid"
      style={{
        cursor: "pointer",
        overflow: "auto",
      }}
      ref={ref}
      onClick={() => viewSvgInNewWindow()}
    >
      {props.code}
    </div>
  );
};

export const VaContent = ({ code }: { code: string }) => {
  const vaStore = useMaskStore();
  const chatStore = useChatStore();
  const navigate = useNavigate();
  let parsedVa: any = null;

  try {
    parsedVa = JSON.parse(code);
  } catch (e) {
    return (
      <div>
        There was an error creating your Virtual Assistant. You can try again by
        clicking the <strong>Retry</strong> button.
      </div>
    );
  }

  const VA_KEYS = ["avatar", "abilities", "name"];
  const isVaContent = VA_KEYS.every((key) => parsedVa.hasOwnProperty(key));
  if (!isVaContent) {
    return "⌛ Please wait while we load your Virtual Assistant...";
  }

  const { avatar, abilities, name } = parsedVa;

  const handleSaveVirtualAssistant = () => {
    setTimeout(() => {
      try {
        vaStore.create(parsedVa);
        showToast("Virtual Assistant saved");
        chatStore.newSession(parsedVa);
        navigate(Path.Chat);
      } catch (e) {
        console.error(e);
      }
    }, 500);
  };

  return (
    <div style={vaPreviewHeaderStyle} className="va-preview">
      <div className="va-preview-header">
        <h3 style={vaPreviewHeaderStyle}>
          <EmojiAvatar avatar={avatar.toLocaleLowerCase()} />{" "}
          <span className="va-preview-header-name">{name}</span>
        </h3>
        <h4 style={vaSubHeaderStyle}>Abilities</h4>
        <ul className="va-preview-header-abilities">
          {abilities.map((ability: any) => (
            <li key={ability} className="va-preview-header-ability">
              {ability}
            </li>
          ))}
        </ul>
      </div>
      <IconButton
        text="Save Virtual Assistant"
        icon={<AddIcon />}
        className="btn btn-primary"
        onClick={handleSaveVirtualAssistant}
      />
    </div>
  );
};

export const HtmlContent = ({ code }: { code: string }) => {
  const handleDownload = () => {
    const opt = {
      margin: 10,
      filename: `document.pdf`,
      enableLinks: true,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 4 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    const trimmer = code.replace(/```html/g, "").replace(/```/g, "");
    html2pdf().from(trimmer).set(opt).save();
  };
  const htmlDocTemplate = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Generated Document</title>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.7/tailwind.min.css"
      />
      <style>
        body {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          color: #000;
          margin: 0;
        }
        body * {
          box-sizing: border-box;
        }
      </style>
      <script>
        document.addEventListener("click", function (e) {
          if (e.target.tagName === "A" || e.target.tagName === "BUTTON") {
            e.preventDefault();
          }
        });
      </script>
    </head>
    <body>
      ${code}
    </body>
  </html>
  `;
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div className="browser-mockup">
        <iframe
          srcDoc={htmlDocTemplate}
          style={{
            width: "100%",
            height: "auto",
            border: "none",
            borderRadius: "0 0 8px 8px",
          }}
        />
      </div>
      <IconButton
        text="Download as PDF"
        icon={<DownloadIcon />}
        className="btn btn-primary"
        onClick={handleDownload}
      />
    </div>
  );
};

export const PdfMakeContent = ({ code }: { code: string }) => {
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const documentDefinitionRef = useRef<DocumentDefinition>({});
  const [error, setError] = useState<boolean>(false);

  React.useEffect(() => {
    try {
      documentDefinitionRef.current = JSON.parse(code);
      // Watermark generated pdfs
      // documentDefinitionRef.current.watermark = {
      //   text: "GPTech",
      //   color: "lightgrey",
      //   opacity: 0.1,
      // };
    } catch (e) {
      console.error(e);
      setError(true);
      return;
    }

    pdfMake
      .createPdf(documentDefinitionRef.current)
      .getDataUrl((dataUrl: any) => {
        setPdfPreview(dataUrl);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (error)
    return (
      <div>
        There was an error creating your document. You can try again by clicking
        the <strong>Retry</strong> button.
      </div>
    );
  return (
    <div style={{ width: "1000px", maxWidth: "100%" }}>
      <iframe
        src={`${pdfPreview}#toolbar=`}
        style={{ width: "100%", height: "600px" }}
      ></iframe>
    </div>
  );
};

type Slide = {
  title: string;
  content: string;
};
type PresentationDefinition = {
  title: string;
  slides: Slide[];
  primaryColor: string;
};
export const PptxGenContent = ({ code }: { code: string }) => {
  let parsedPptxGen: any = null;
  try {
    parsedPptxGen = JSON.parse(code);
  } catch (e) {
    return (
      <div>
        There was an error creating your Presentation. You can try again by
        clicking the <strong>Retry</strong> button.
      </div>
    );
  }
  const presentationDefinition: PresentationDefinition = JSON.parse(code);
  let pres = new pptxgen();

  presentationDefinition.slides.forEach((slide: any) => {
    let newSlide = pres.addSlide();

    // Add title
    newSlide.addText(slide.title, {
      x: "10%",
      y: "5%",
      w: "80%",
      h: "10%",
      align: "center",
      fontSize: 24,
      bold: true,
    });

    // Add body text
    if (slide.body.type === "list") {
      slide.body.value.forEach((item: string, index: number) => {
        newSlide.addText(item, {
          x: "10%",
          y: `${15 + index * 5}%`,
          w: "80%",
          h: "5%",
          bullet: { code: "2022" },
        });
      });
    } else {
      newSlide.addText(slide.body.value, {
        x: "10%",
        y: "15%",
        w: "80%",
        h: "25%",
        align: "justify",
      });
    }
  });

  const handleDownload = () => {
    pres.writeFile({ fileName: `${presentationDefinition.title}.pptx` });
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <IconButton
        text="Download Presentation"
        icon={<DownloadIcon />}
        className="btn btn-primary"
        onClick={handleDownload}
      />
    </div>
  );
};

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);
  const [content, setContent] = useState<{
    mermaid: string;
    html: string;
    pdfMake: string;
    "json-va": string;
    pptxGen: string;
  }>({
    mermaid: "",
    html: "",
    pdfMake: "",
    "json-va": "",
    pptxGen: "",
  });

  const renderContent = (type: string) => {
    if (!ref.current) return;
    const dom = ref.current.querySelector(`code.language-${type}`);
    if (
      dom instanceof HTMLElement &&
      dom.parentElement instanceof HTMLElement
    ) {
      if (type !== "html") {
        dom.parentElement.style.display = "none";
      }
      setContent((prevContent) => ({ ...prevContent, [type]: dom.innerText }));
    }
  };

  useEffect(() => {
    ["mermaid", "json-va", "html", "pdfMake", "pptxGen"].forEach(renderContent);
  }, [ref.current?.innerText]);

  return (
    <>
      {content.mermaid.length > 0 && (
        <Mermaid code={content.mermaid} key={content.mermaid} />
      )}
      {content["json-va"] && (
        <VaContent code={content["json-va"]} key={content["json-va"]} />
      )}
      {content.html && <HtmlContent code={content.html} key={content.html} />}
      {content.pdfMake && (
        <PdfMakeContent code={content.pdfMake} key={content.pdfMake} />
      )}
      {content.pptxGen && (
        <PptxGenContent code={content.pptxGen} key={content.pptxGen} />
      )}
      <pre ref={ref}>
        <span
          className="copy-code-button"
          onClick={() => {
            if (ref.current) {
              const code = ref.current.innerText;
              copyToClipboard(code);
            }
          }}
        ></span>
        {props.children}
      </pre>
    </>
  );
}

function _MarkDownContent(props: { content: string; isTyping: boolean }) {
  const INTERACTIVE_TYPES = [
    "```mermaid",
    "```json-va",
    "```html",
    "```pdfMake",
    "```pptxGen",
  ];
  const isInteractive = INTERACTIVE_TYPES.some((type) =>
    props.content.includes(type),
  );

  return (
    <ReactMarkdown
      remarkPlugins={[RemarkGfm, RemarkBreaks]}
      rehypePlugins={[
        [
          RehypeHighlight,
          {
            detect: false,
            ignoreMissing: true,
          },
        ],
      ]}
      components={{
        pre: (preProps) => {
          if (isInteractive) {
            return (
              <>
                {props.isTyping ? (
                  <p>⌛ Please wait, loading your content...</p>
                ) : (
                  <PreCode>{preProps.children}</PreCode>
                )}
              </>
            );
          }
          return <PreCode>{preProps.children}</PreCode>;
        },
        p: (pProps) => <p {...pProps} dir="auto" />,
        a: (aProps) => {
          const href = aProps.href || "";
          const isInternal = /^\/#/i.test(href);
          const target = isInternal ? "_self" : aProps.target ?? "_blank";
          return <a {...aProps} target={target} />;
        },
      }}
    >
      {props.content}
    </ReactMarkdown>
  );
}

export const MarkdownContent = React.memo(_MarkDownContent);

export function Markdown(
  props: {
    isTyping?: boolean;
    content: string;
    loading?: boolean;
    fontSize?: number;
    parentRef?: RefObject<HTMLDivElement>;
    defaultShow?: boolean;
  } & React.DOMAttributes<HTMLDivElement>,
) {
  const mdRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="markdown-body"
      style={{
        fontSize: `${props.fontSize ?? 14}px`,
      }}
      ref={mdRef}
      onContextMenu={props.onContextMenu}
      onDoubleClickCapture={props.onDoubleClickCapture}
      dir="auto"
    >
      {props.loading ? (
        <LoadingIcon />
      ) : (
        <>
          <MarkdownContent
            content={props.content}
            isTyping={props.isTyping === true}
          />
        </>
      )}
    </div>
  );
}
