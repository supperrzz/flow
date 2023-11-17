import React from "react";
import Generator from "../components/Generator";
import ACTIONS from "../config/actions";
import FullPad from "../components/ScratchPad/full";
import Category from "../components/category";

export default function Document({ showChat }: { showChat: any }) {
  const categories = Object.keys(ACTIONS);
  return (
    <>
      <div className="menu">
        <div className="flex flex-col flex-1 max-h-full overflow-y-auto">
          {categories.map((category) => {
            if (Object.values(ACTIONS[category]).length == 0) return null;
            return <Category key={category} category={category} />;
          })}
        </div>
        <button
          onClick={showChat}
          className="text-sm p-3 bg-gray-200 dark:bg-slate-700 hover:brightness-90"
        >
          <span>Back to chat</span>
        </button>
      </div>
      <div className="generator">
        <Generator />
      </div>
      <div className="document">
        <FullPad />
      </div>
    </>
  );
}
