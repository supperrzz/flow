import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect, useCallback } from "react";
import { copyToClipboard, downloadAs } from "../utils";
import mermaid from "mermaid";
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
import { useDebouncedCallback } from "use-debounce";
import { showImageModal, showToast } from "./ui-lib";
import { useMaskStore } from "../store/mask";
import { EmojiAvatar } from "./emoji";
import { IconButton } from "./button";
import AddIcon from "../icons/add.svg";
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
  const parsedVa = JSON.parse(code);
  const { avatar, abilities, name } = parsedVa;
  const chatStore = useChatStore();
  const navigate = useNavigate();
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
    <div className="va-preview">
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

// export const HtmlContent = ({ code }: { code: string }) => {
//   const handleDownload = () => {
//     const opt = {
//       margin: 10,
//       filename: "document.pdf",
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//     };
//     const trimmer = code.replace(/```html/g, "").replace(/```/g, "");
//     html2pdf().from(trimmer).set(opt).save();
//   };
//   const isFinished = code.includes("</html>");
//   return (
//     <>
//       {!isFinished && <div>⌛ Please wait while we load your document...</div>}
//       {isFinished && (
//         <div
//           style={{ marginBottom: "1rem" }}
//           dangerouslySetInnerHTML={{ __html: code }}
//         />
//       )}
//       {isFinished && (
//         <IconButton
//           text="Download PDF"
//           icon={<AddIcon />}
//           className="btn btn-primary"
//           onClick={handleDownload}
//         />
//       )}
//     </>
//   );
// };
export const PdfMakeContent = ({ code }: { code: string }) => {
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const documentDefinitionRef = useRef<DocumentDefinition>({});

  React.useEffect(() => {
    try {
      documentDefinitionRef.current = JSON.parse(code);
      documentDefinitionRef.current.watermark = {
        text: "GPTech",
        color: "lightgrey",
        opacity: 0.1,
      };
    } catch (e) {
      return;
    }
    setIsFinished(true);
    pdfMake
      .createPdf(documentDefinitionRef.current)
      .getDataUrl((dataUrl: any) => {
        setPdfPreview(dataUrl);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);
  return (
    <>
      {!isFinished && <div>⌛ Please wait, writing your document...</div>}
      {isFinished && (
        <div style={{ width: "1000px", maxWidth: "100%" }}>
          <iframe
            src={`${pdfPreview}#toolbar=`}
            style={{ width: "100%", height: "300px" }}
          ></iframe>
        </div>
      )}
    </>
  );
};

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);
  const refText = ref.current?.innerText;
  const [mermaidCode, setMermaidCode] = useState("");
  const [vaContent, setVaContent] = useState<string | null>(null);
  const VA_KEYS = ["avatar", "abilities", "name"];
  const isVaContent =
    vaContent && VA_KEYS.every((key) => vaContent.includes(key));
  // const [htmlCode, setHtmlCode] = useState<string | null>(null);
  const [pdfMakeCode, setPdfMakeCode] = useState<string | null>(null);
  const renderMermaid = useDebouncedCallback(() => {
    if (!ref.current) return;
    const mermaidDom = ref.current.querySelector("code.language-mermaid");
    if (
      mermaidDom instanceof HTMLElement &&
      mermaidDom.parentElement instanceof HTMLElement
    ) {
      mermaidDom.parentElement.style.display = "none";
      setMermaidCode(mermaidDom.innerText);
    }

    const vaDom = ref.current.querySelector("code.language-json-va");
    if (
      vaDom instanceof HTMLElement &&
      vaDom.parentElement instanceof HTMLElement
    ) {
      vaDom.parentElement.style.display = "none";
      setVaContent(vaDom.innerText);
    }

    // const htmlDom = ref.current.querySelector("code.language-html");
    // if (
    //   htmlDom instanceof HTMLElement &&
    //   htmlDom.parentElement instanceof HTMLElement
    // ) {
    //   htmlDom.parentElement.style.display = "none";
    //   setHtmlCode(htmlDom.innerText);
    // }

    const pdfMakeDom = ref.current.querySelector("code.language-json-pdfmake");
    if (
      pdfMakeDom instanceof HTMLElement &&
      pdfMakeDom.parentElement instanceof HTMLElement
    ) {
      pdfMakeDom.parentElement.style.display = "none";
      setPdfMakeCode(pdfMakeDom.innerText);
    }
  }, 600);

  useEffect(() => {
    renderMermaid();
  }, [refText]);

  return (
    <>
      {mermaidCode.length > 0 && (
        <Mermaid code={mermaidCode} key={mermaidCode} />
      )}
      {vaContent && isVaContent && <VaContent code={vaContent} />}
      {vaContent &&
        !isVaContent &&
        "⌛ Please wait while we load your Virtual Assistant..."}
      {/* {htmlCode && <HtmlContent code={htmlCode} />} */}
      {pdfMakeCode && <PdfMakeContent code={pdfMakeCode} />}
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

function _MarkDownContent(props: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
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
        pre: PreCode,
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
          <MarkdownContent content={props.content} />
        </>
      )}
    </div>
  );
}
