import { useEffect, useRef, useState } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/config.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import DeleteIcon from "../icons/clear.svg";
import CloseIcon from "../icons/close.svg";
import PluginIcon from "../icons/plugin.svg";
import BotIcon from "../icons/robot.svg";
// import DragIcon from "../icons/drag.svg";
import ChatIcon from "../icons/chat.svg";
import Locale from "../locales";
import { useAccessStore, useAppConfig, useChatStore } from "../store";

import {
  CHAT_COUNT_MAX,
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  NEW_DOC_KEY,
  Path,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { Select, showConfirm, showToast } from "./ui-lib";
import { useRecoilState } from "recoil";
import {
  currentChatDocumentState,
  currentDocumentState,
  showChatState,
} from "../state";
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

const DocumentSelector = () => {
  const [document, setDocument] = useRecoilState(currentDocumentState);
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

  return (
    <div className={styles["document-selector-container"]}>
      <Select
        className={styles["document-selector"]}
        value={document}
        onChange={(e) => setDocument(e.target.value)}
        darkIcon={true}
      >
        {documents.map((doc) => {
          const documentName = doc.replace("document-", "");
          return (
            <option key={doc} value={doc}>
              {documentName}
            </option>
          );
        })}
      </Select>
      <IconButton
        shadow
        title="Create a new document"
        onClick={() => {
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
        }}
        icon={<AddIcon />}
      />
      <IconButton
        shadow
        title="Delete current document"
        icon={<DeleteIcon />}
        // text="Delete"
        onClick={async () => {
          if (
            await showConfirm(
              `Are you sure you want to delete ${document.replace(
                "document-",
                "",
              )}?`,
            )
          ) {
            const isLast = documents.length === 1;
            console.log("isLast", isLast);
            localStorage.removeItem(document);
            if (isLast) {
              localStorage.setItem(NEW_DOC_KEY, "");
              setDocuments([NEW_DOC_KEY]);
              setDocument(NEW_DOC_KEY);
            } else {
              setDocuments(documents.filter((d) => d !== document));
              setDocument(documents[0]);
            }
          }
        }}
      />
    </div>
  );
};

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
  const isMobileScreen = useMobileScreen();
  const accessStore = useAccessStore();
  const { isSubscribed } = accessStore;
  const [document, setDocument] = useRecoilState(currentChatDocumentState);
  const chatCount = chatStore.sessions.length;

  // drag side bar
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();

  useHotKey();

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
            Flow Chat
          </div>
          <div className={styles["sidebar-sub-title"]}>
            Join the{" "}
            <a href="" target="_blank" rel="noopener noreferrer">
              Community 🌟
            </a>
          </div>
        </div>
      </div>

      {showChat && (
        <div className={styles["sidebar-header-bar"]}>
          <IconButton
            icon={<BotIcon />}
            disabled={!isSubscribed}
            type={"primary"}
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
          {/* <IconButton
            icon={<AddIcon />}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={async () => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                localStorage.setItem(
                  `scratchPad-${chatStore.currentSession().id}`,
                  "",
                );
                setDocument(`scratchPad-${chatStore.currentSession().id}`);
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
            shadow
          /> */}
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
        {!showChat && !shouldNarrow && <DocumentSelector />}
        {showChat ? <ChatList /> : <Menu show={true} />}
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          {/* <div className={styles["sidebar-action"]}>
            {!isMobileScreen && Boolean(isSubscribed) && (
              <IconButton
                type={"primary"}
                onClick={() => setShowChat(!showChat)}
                icon={showChat ? <PluginIcon /> : <ChatIcon />}
                text={
                  (!shouldNarrow && (showChat ? "Workflows" : "Chat")) ||
                  undefined
                }
                shadow
              />
            )}
          </div> */}
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
          <Link onClick={() => setShowChat(true)} to={Path.Settings}>
            <IconButton icon={<SettingsIcon />} shadow />
          </Link>
        </div>
        {showChat && (
          <div className={styles["sidebar-action"]}>
            <IconButton
              icon={<AddIcon />}
              text={shouldNarrow ? undefined : Locale.Home.NewChat}
              disabled={!isSubscribed && chatCount >= CHAT_COUNT_MAX}
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
      </div>
      {/* <div
        className={styles["sidebar-drag"]}
        onPointerDown={(e) => onDragStart(e as any)}
      >
        <DragIcon />
      </div> */}
    </div>
  );
}
