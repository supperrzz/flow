"use client";

require("../polyfill");

import { useState, useEffect } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";
import DragIcon from "../icons/drag.svg";
import CloseIcon from "../icons/close.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import { getISOLang } from "../locales";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useAppConfig } from "../store/config";
import { AuthPage } from "./auth";
import { getClientConfig } from "../config/client";
import { api } from "../client/api";
import { useAccessStore } from "../store";
import useSession from "../hooks/useSession";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { showChatState, showDocumentState } from "../state";
import { useDragDocument } from "./document";
import { IconButton } from "./button";

const FullPad = dynamic(() => import("../components/ScratchPad/full"), {
  ssr: false,
});

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const SideBar = dynamic(async () => (await import("./sidebar")).SideBar, {
  // loading: () => <Loading noLogo />,
  ssr: false,
});

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  // loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  // loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  // loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  // loading: () => <Loading noLogo />,
});

const Document = dynamic(async () => await import("./document"), {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  const proxyFontUrl = "/google-fonts";
  const remoteFontUrl = "https://fonts.googleapis.com";
  const googleFontUrl =
    getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
  linkEl.rel = "stylesheet";
  linkEl.href =
    googleFontUrl +
    "/css2?family=" +
    encodeURIComponent("Noto Sans:wght@300;400;700;900") +
    "&display=swap";
  document.head.appendChild(linkEl);
};

function Screen() {
  const showChat = useRecoilValue(showChatState);
  const config = useAppConfig();
  const location = useLocation();
  const { session, loading: sessionLoading } = useSession(); // Assuming useSession has a loading state
  const isHome = location.pathname === Path.Home;
  const isMobileScreen = useMobileScreen();
  const { onDragStart } = useDragDocument();
  const [showModal, setShowModal] = useRecoilState(showDocumentState);
  const shouldTightBorder =
    config.tightBorder && !isMobileScreen && !getClientConfig()?.isApp;

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  if (sessionLoading) {
    return <Loading />;
  }

  const isAuth = !session?.user;

  const renderMobileView = () => {
    if (!showModal) return null;

    return (
      <div className={`${styles.document} ${styles.modal}`}>
        <FullPad chat={true} />
        <div className={styles.close}>
          <IconButton
            icon={<CloseIcon />}
            bordered
            onClick={() => setShowModal(false)}
          />
        </div>
      </div>
    );
  };

  const renderDesktopView = () => (
    <>
      <div className={styles.document}>
        <FullPad chat={true} />
      </div>
      <div
        className={`${styles.drag} drag-icon`}
        onPointerDown={(e) => onDragStart(e as any)}
      >
        <DragIcon />
      </div>
    </>
  );

  return (
    <div
      className={
        styles.container +
        ` ${shouldTightBorder ? styles["tight-container"] : ""}`
      }
    >
      {isAuth ? (
        <AuthPage />
      ) : (
        <>
          <SideBar className={isHome ? styles["sidebar-show"] : ""} />
          {showChat ? (
            <div className={styles["window-content-container"]}>
              <div className={styles["window-content"]} id={SlotID.AppBody}>
                <Routes>
                  <Route path={Path.Home} element={<Chat />} />
                  <Route path={Path.NewChat} element={<NewChat />} />
                  <Route path={Path.Assistants} element={<MaskPage />} />
                  <Route path={Path.Chat} element={<Chat />} />
                  <Route path={Path.Settings} element={<Settings />} />
                </Routes>
              </div>
            </div>
          ) : (
            <Document />
          )}
          {showChat &&
            (isMobileScreen ? renderMobileView() : renderDesktopView())}
        </>
      )}
    </div>
  );
}

export function useLoadData() {
  const config = useAppConfig();

  useEffect(() => {
    (async () => {
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function Home() {
  useSwitchTheme();
  useLoadData();
  useHtmlLang();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
    useAccessStore.getState().fetch();
  }, []);

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <RecoilRoot>
        <Router>
          <Screen />
        </Router>
      </RecoilRoot>
    </ErrorBoundary>
  );
}
