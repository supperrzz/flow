import { inputValuesState } from "../../state";
import { PromptInput } from "../../state/types";
import React, { ChangeEvent } from "react";
import { useRecoilState } from "recoil";
interface TextAreaInputProps {
  input: PromptInput;
}
const TextAreaInput = ({ input }: TextAreaInputProps) => {
  const { id, placeholder } = input;
  const CHARACTER_LIMIT = 224;
  const [inputValues, setInputValues] = useRecoilState(inputValuesState);
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValues({ ...inputValues, [id]: e.target.value });
  };
  const currentInputValue = inputValues[id];
  return (
    <div>
      <label htmlFor={id}>
        <span>{input.label}</span>
        <hr />
      </label>
      <textarea
        rows={5}
        value={inputValues[id]}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>): void =>
          handleChange(e)
        }
        placeholder={placeholder}
      />
      <div>
        <span
          className={currentInputValue?.length >= CHARACTER_LIMIT ? "red" : ""}
        >
          {currentInputValue?.length || 0}
        </span>
        /{CHARACTER_LIMIT}
      </div>
    </div>
  );
};

export default TextAreaInput;
