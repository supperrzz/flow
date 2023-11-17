import React, { use } from "react";
import { useRecoilState } from "recoil";
import ACTIONS, { ACTION_ICONS } from "../config/actions";
import { actionState, activeCategoryMenuState } from "../state";
import { camelToTitle } from "../utils-2";

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
        className={expanded ? "expanded" : ""}
      >
        <div>
          <h3>
            <span>{ACTION_ICONS[category]}</span>
            {camelToTitle(category)}
          </h3>
          {expanded ? "-" : "+"}
        </div>
      </button>
      <div className={expanded ? "block" : "hidden"}>
        {Object.values(ACTIONS[category]).map((action) => (
          <button
            key={action.name}
            onClick={() => setAction(action.name)}
            className={action.name === currentAction ? "active-action" : ""}
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
