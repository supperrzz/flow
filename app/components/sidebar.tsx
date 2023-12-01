import { useEffect, useRef, useState } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/config.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import PluginIcon from "../icons/plugin.svg";
import BotIcon from "../icons/robot.svg";
import DragIcon from "../icons/drag.svg";
import ChatIcon from "../icons/chat.svg";
import EditIcon from "../icons/edit.svg";
import RenameIcon from "../icons/rename.svg";
import DeleteIcon from "../icons/delete.svg";
import DownloadIcon from "../icons/download.svg";
// @ts-ignore
import html2pdf from "html2pdf.js";

import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  NEW_DOC_KEY,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showConfirm, showToast } from "./ui-lib";
import { useRecoilState } from "recoil";
import { currentDocumentState, showChatState } from "../state";
import { Menu } from "./document";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        if (e.key === "ArrowUp") {
          chatStore.nextSession(-1);
        } else if (e.key === "ArrowDown") {
          chatStore.nextSession(1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
  const lastUpdateTime = useRef(Date.now());

  const toggleSideBar = () => {
    config.update((config) => {
      if (config.sidebarWidth < MIN_SIDEBAR_WIDTH) {
        config.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
      } else {
        config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
      }
    });
  };

  const onDragStart = (e: MouseEvent) => {
    // Remembers the initial width each time the mouse is pressed
    startX.current = e.clientX;
    startDragWidth.current = config.sidebarWidth;
    const dragStartTime = Date.now();

    const handleDragMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 20) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);
      config.update((config) => {
        if (nextWidth < MIN_SIDEBAR_WIDTH) {
          config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
        } else {
          config.sidebarWidth = nextWidth;
        }
      });
    };

    const handleDragEnd = () => {
      // In useRef the data is non-responsive, so `config.sidebarWidth` can't get the dynamic sidebarWidth
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);

      // if user click the drag icon, should toggle the sidebar
      const shouldFireClick = Date.now() - dragStartTime < 300;
      if (shouldFireClick) {
        toggleSideBar();
      }
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragStart,
    shouldNarrow,
  };
}

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();
  const [showChat, setShowChat] = useRecoilState(showChatState);
  const [showDocument, setShowDocument] = useState(true);
  const [documents, setDocuments] = useState<string[]>([]);
  const [currentDocument, setCurrentDocument] =
    useRecoilState(currentDocumentState);
  const isMobileScreen = useMobileScreen();

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
  // drag side bar
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();

  useHotKey();

  const handleDownload = (value: string, title: string) => {
    const styles = `
      p {
        line-height: 1.4 !important;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-bottom: 5px !important;

        &:last-child {
          margin-bottom: 0 !important;
        }
      }

      p,
      ul,
      blockquote {
        margin-bottom: 5px !important;

        &:last-child {
          margin-bottom: 0 !important;
        }
      }

      li, ol {
        margin-bottom: 5px !important;
      }
    `;
    // add styles to the html
    const html = `
      <html>
        <head>
          <style>
            ${styles}
          </style>
        </head>
        <body>
          ${value}
        </body>
      </html>
    `;
    const opt = {
      margin: 10,
      filename: `${title}.pdf`,
      enableLinks: true,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 4 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(html).set(opt).save();
  };

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]} data-tauri-drag-region>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <ChatGptIcon />
        </div>
        <div>
          <div className={styles["sidebar-title"]} data-tauri-drag-region>
            Welcome to Flow
          </div>
          <div className={styles["sidebar-sub-title"]}>
            Developed by{" "}
            <a
              href="https://www.mygptech.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GPTech
            </a>
          </div>
        </div>
      </div>

      {showChat && (
        <div className={styles["sidebar-header-bar"]}>
          <IconButton
            icon={<BotIcon />}
            text={shouldNarrow ? undefined : Locale.Mask.Name}
            className={styles["sidebar-bar-button"]}
            onClick={() => {
              if (config.dontShowMaskSplashScreen !== true) {
                navigate(Path.NewChat, { state: { fromHome: true } });
              } else {
                navigate(Path.Masks, { state: { fromHome: true } });
              }
            }}
            shadow
          />
          <IconButton
            icon={<AddIcon />}
            // text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
            shadow
          />
        </div>
      )}

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (showChat && e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        {showChat ? <ChatList /> : <Menu show={true} />}
        {/* hide documents for now */}
        {/* {!showChat && !shouldNarrow && showDocument && (
          <div className="document-selector">
            <ul className="document-list">
              {documents.map((doc) => {
                const name = doc.replace("document-", "");
                return (
                  <li
                    key={doc}
                    onClick={() => {
                      setCurrentDocument(doc);
                    }}
                    className={currentDocument === doc ? "selected" : ""}
                  >
                    <span className={`document-name`}>{name}</span>
                    <div style={{ display: "flex" }}>
                      <IconButton
                        icon={<DeleteIcon />}
                        // text="Delete"
                        onClick={async () => {
                          if (
                            await showConfirm(
                              `Are you sure you want to delete ${name}?`,
                            )
                          ) {
                            const isLast = documents.length === 1;
                            localStorage.removeItem(doc);
                            if (isLast) {
                              localStorage.setItem(NEW_DOC_KEY, "");
                              setDocuments([NEW_DOC_KEY]);
                              setCurrentDocument(NEW_DOC_KEY);
                            } else {
                              setDocuments(documents.filter((d) => d !== doc));
                              setCurrentDocument(documents[0]);
                            }
                          }
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <IconButton
              fullWidth
              onClick={() => {
                const name = prompt("Enter a name for your document");
                const docKey = `document-${name}`;
                const docExists = documents.find((doc) => doc === docKey);
                if (docExists) {
                  showToast("Document already exists");
                  setCurrentDocument(docKey);
                  return;
                }
                if (name) {
                  localStorage.setItem(docKey, "");
                  setDocuments([...documents, docKey]);
                  setCurrentDocument(docKey);
                }
              }}
              icon={<AddIcon />}
              text="Add Document"
            />
          </div>
        )} */}
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"]}>
            {!isMobileScreen && (
              <IconButton
                onClick={() => setShowChat(!showChat)}
                icon={showChat ? <PluginIcon /> : <ChatIcon />}
                text={
                  (!shouldNarrow && (showChat ? "Workflows" : "Chat")) ||
                  undefined
                }
                shadow
              />
            )}
          </div>
          {/* Hide documents for now */}
          {/* {!showChat && (
            <div className={styles["sidebar-action"]}>
              <IconButton
                onClick={() => setShowDocument(!showDocument)}
                icon={showDocument ? <PluginIcon /> : <EditIcon />}
                text={showDocument ? "Workflows" : "Documents"}
                shadow
              />
            </div>
          )} */}
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <IconButton
              icon={<CloseIcon />}
              onClick={async () => {
                if (await showConfirm(Locale.Home.DeleteChat)) {
                  chatStore.deleteSession(chatStore.currentSessionIndex);
                }
              }}
            />
          </div>
          {/* {showChat && (
            <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<AddIcon />}
                text={shouldNarrow ? undefined : Locale.Home.NewChat}
                onClick={() => {
                  if (config.dontShowMaskSplashScreen) {
                    chatStore.newSession();
                    navigate(Path.Chat);
                  } else {
                    navigate(Path.NewChat);
                  }
                }}
                shadow
              />
            </div>
          )} */}
        </div>
        <Link onClick={() => setShowChat(true)} to={Path.Settings}>
          <IconButton icon={<SettingsIcon />} shadow />
        </Link>
      </div>
      <div
        className={styles["sidebar-drag"]}
        onPointerDown={(e) => onDragStart(e as any)}
      >
        <DragIcon />
      </div>
    </div>
  );
}
