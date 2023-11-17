import React from "react";
import Generator from "../components/Generator";
import ACTIONS from "../config/actions";
import FullPad from "../components/ScratchPad/full";
import Category from "../components/category";

export const Menu = () => {
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

export default function Document({ showChat }: { showChat: any }) {
  return (
    <>
      <div className="generator">
        <Generator />
      </div>
      <div className="document">
        <FullPad />
      </div>
    </>
  );
}
