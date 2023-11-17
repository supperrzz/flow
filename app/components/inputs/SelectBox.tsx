import { inputValuesState } from "../../state";
import { PromptInput } from "../../state/types";
import React, { ChangeEvent } from "react";
import { useRecoilState } from "recoil";
interface SelectBoxProps {
  input: PromptInput;
}

const SelectBox = ({ input }: SelectBoxProps) => {
  const [inputValues, setInputValues] = useRecoilState(inputValuesState);
  const { id, options } = input;
  const placeholderTextColor = "";
  const textColor =
    inputValues[id] === "default" || !inputValues[id]
      ? placeholderTextColor
      : "";
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "default") {
      const { [id]: _, ...rest } = inputValues;
      setInputValues(rest);
      return;
    }
    setInputValues({ ...inputValues, [id]: e.target.value });
  };
  return (
    <label htmlFor={id}>
      <span className="text-sm">{input.label}</span>
      <hr />
      <select
        value={inputValues[id] || ""}
        onChange={handleChange}
        name="tone"
        id="tone"
        className=""
      >
        <option value="default">None</option>
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SelectBox;
