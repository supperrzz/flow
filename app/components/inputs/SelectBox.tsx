import { inputValuesState } from "../../state";
import { PromptInput } from "../../state/types";
import React, { ChangeEvent } from "react";
import { useRecoilState } from "recoil";
import {
  Input,
  List,
  ListItem,
  Modal,
  Popover,
  Select,
  showConfirm,
} from "../ui-lib";
interface SelectBoxProps {
  input: PromptInput;
}

const SelectBox = ({ input }: SelectBoxProps) => {
  const [inputValues, setInputValues] = useRecoilState(inputValuesState);
  const { id, options } = input;
  const className =
    inputValues[id] === "default" || !inputValues[id] ? "empty" : "";
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "default") {
      const { [id]: _, ...rest } = inputValues;
      setInputValues(rest);
      return;
    }
    setInputValues({ ...inputValues, [id]: e.target.value });
  };
  return (
    <>
      <label htmlFor={id}></label>
      <Select
        value={inputValues[id] || ""}
        onChange={handleChange}
        name={id}
        id={`input-${id}`}
        className={className}
      >
        <option value="default">{input.label}</option>
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </>
  );
};

export default SelectBox;
