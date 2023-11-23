import React from "react";
import { useRecoilState } from "recoil";
import ACTIONS, { ACTION_ICONS } from "../config/actions";
import { actionState, activeCategoryMenuState } from "../state";
import { camelToTitle } from "../utils-2";
import styles from "./category.module.scss";

const Category = ({ category }: { category: string }) => {
  const [currentAction, setAction] = useRecoilState(actionState);
  const [activeMenu, setActiveMenu] = useRecoilState(activeCategoryMenuState);
  const expanded = activeMenu === category;
  return (
    <div key={category}>
      <button
        onClick={() => {
          if (expanded) {
            setActiveMenu("");
            return;
          }
          setActiveMenu(category);
        }}
        className={styles["category"]}
      >
        <div className={styles["category-title"]}>
          <h3>
            <span style={{ fontSize: "16px" }}>{ACTION_ICONS[category]}</span>
            {camelToTitle(category)}
          </h3>
          <h3>{expanded ? "-" : "+"}</h3>
        </div>
      </button>
      <div
        className={`${styles["category-content"]} ${
          expanded && styles["category-content-expanded"]
        }`}
      >
        {Object.values(ACTIONS[category]).map((action) => (
          <button
            key={action.name}
            onClick={() => setAction(action.name)}
            className={styles["category-item"]}
            // className={action.name === currentAction ? "active-action" : ""}
            disabled={action.name === currentAction}
          >
            {camelToTitle(action.name)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Category;
