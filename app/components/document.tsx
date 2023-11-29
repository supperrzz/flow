import React, { useEffect, useRef } from "react";
import Generator from "../components/Generator";
import ACTIONS from "../config/actions";
import FullPad from "../components/ScratchPad/full";
import Category from "../components/category";
import styles from "./document.module.scss";
import {
  MAX_DOCUMENT_WIDTH,
  DEFAULT_DOCUMENT_WIDTH,
  MIN_DOCUMENT_WIDTH,
  NARROW_DOCUMENT_WIDTH,
} from "../constant";
import { useAppConfig } from "../store";
import { useMobileScreen } from "../utils";
import DragIcon from "../icons/drag.svg";

export const Menu = ({ show }: { show: boolean }) => {
  if (!show) return null;
  const categories = Object.keys(ACTIONS);
  return (
    <div className="menu">
      {categories.map((category) => {
        if (Object.values(ACTIONS[category]).length == 0) return null;
        return <Category key={category} category={category} />;
      })}
    </div>
  );
};

function useDragDocument() {
  const limit = (x: number) => Math.min(MAX_DOCUMENT_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.documentWidth ?? DEFAULT_DOCUMENT_WIDTH);
  const lastUpdateTime = useRef(Date.now());

  const toggleDocument = () => {
    config.update((config) => {
      if (config.documentWidth < MAX_DOCUMENT_WIDTH) {
        config.documentWidth = MAX_DOCUMENT_WIDTH;
      } else {
        config.documentWidth = NARROW_DOCUMENT_WIDTH;
      }
    });
  };

  const onDragStart = (e: MouseEvent) => {
    // Remembers the initial width each time the mouse is pressed
    startX.current = e.clientX;
    startDragWidth.current = config.documentWidth;
    const dragStartTime = Date.now();

    const handleDragMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 20) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);
      config.update((config) => {
        if (nextWidth < MIN_DOCUMENT_WIDTH) {
          config.documentWidth = NARROW_DOCUMENT_WIDTH;
        } else {
          config.documentWidth = nextWidth;
        }
      });
    };

    const handleDragEnd = () => {
      // In useRef the data is non-responsive, so `config.documentWidth` can't get the dynamic documentWidth
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);

      // if user click the drag icon, should toggle the document
      const shouldFireClick = Date.now() - dragStartTime < 300;
      if (shouldFireClick) {
        toggleDocument();
      }
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.documentWidth < MIN_DOCUMENT_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_DOCUMENT_WIDTH
      : limit(config.documentWidth ?? DEFAULT_DOCUMENT_WIDTH);
    const documentWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty(
      "--document-width",
      documentWidth,
    );
  }, [config.documentWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragStart,
    shouldNarrow,
  };
}

export default function Document() {
  const { onDragStart, shouldNarrow } = useDragDocument();
  const [documents, setDocuments] = React.useState<string[]>([]);
  React.useEffect(() => {
    const docs: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("document-")) {
        docs.push(key);
      }
    }
    setDocuments(docs);
  }, []);

  return (
    <>
      <div className={styles["generator"]}>
        <Generator />
      </div>
      <div className={styles["document"]}>
        <FullPad />
        <div
          className={styles["drag"]}
          onPointerDown={(e) => onDragStart(e as any)}
        >
          <DragIcon />
        </div>
      </div>
    </>
  );
}
