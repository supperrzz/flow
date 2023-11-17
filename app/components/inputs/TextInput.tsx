import { inputValuesState } from "../../state";
import { PromptInput } from "../../state/types";
import React, { ChangeEvent } from "react";
import { useRecoilState } from "recoil";
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
      <span>{input.label}</span>
      <hr />
      <input
        type="text"
        value={inputValues[id] || ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
        placeholder={placeholder}
      />
    </label>
  );
};

export default TextInput;
