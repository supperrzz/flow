import { inputValuesState } from "../../state";
import { PromptInput } from "../../state/types";
import React, { ChangeEvent } from "react";
import { useRecoilState } from "recoil";

import styles from "../ui-lib.module.scss";

interface TextInputProps {
  input: PromptInput;
}

const TextInput = ({ input }: TextInputProps) => {
  const [inputValues, setInputValues] = useRecoilState(inputValuesState);
  const { id, placeholder } = input;
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValues({ ...inputValues, [id]: e.target.value });
  };
  return (
    <label htmlFor={id}>
      {/* <span>{input.label}</span> */}
      <input
        type="text"
        className={`${styles["input"]}`}
        value={inputValues[id] || ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
        placeholder={input.label}
      />
    </label>
  );
};

export default TextInput;
