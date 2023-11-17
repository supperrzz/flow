import React, { useEffect, useState } from "react";
import {
  toneState,
  promptInputsState,
  inputValuesState,
  actionState,
} from "../state";
import { useRecoilState, useRecoilValue } from "recoil";
import Tone from "../components/Tone";
import TextInput from "../components/inputs/TextInput";
import TextAreaInput from "../components/inputs/TextAreaInput";
import { camelToTitle } from "../utils-2";
import SelectBox from "./inputs/SelectBox";
import pageActions from "../actions";

export default function Generator() {
  const tone = useRecoilValue(toneState);
  const [promptInputs, setPromptInputs] = useRecoilState(promptInputsState);
  const [output, setOutput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [requiredInputs, setRequiredInputs] = useState<string[]>([]);
  const action = useRecoilValue(actionState);
  const actionNotFound = !pageActions[action as keyof typeof pageActions];
  const inputValues = useRecoilValue(inputValuesState);

  useEffect(() => {
    if (action) {
      const inputs =
        pageActions[action as keyof typeof pageActions]?.inputs || [];
      const requiredInputIds = inputs
        .filter((input) => input.required)
        .map((input) => input.id);
      setRequiredInputs(requiredInputIds);
      setPromptInputs(inputs);
    }
  }, [action, setPromptInputs]);

  if (actionNotFound) {
    return (
      <div>
        <h2>Select an action to get started</h2>
      </div>
    );
  }

  const isComplete = requiredInputs.every((id) => inputValues[id]);
  const hasTone = pageActions[action as keyof typeof pageActions].tone;

  // Debug Mode
  // console.log("inputValues", inputValues);

  const inputMapping = {
    text: TextInput,
    textArea: TextAreaInput,
    select: SelectBox,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output.trim());
    setIsCopy(true);
    setTimeout(() => {
      setIsCopy(false);
    }, 500);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: action, payload: inputValues, tone }),
      });
      const output: { result: string } = await response.json();
      const { result } = output;
      setOutput(result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (!action) return <div>Loading...</div>;

  return (
    <div>
      <div>
        <div>
          <h3>{camelToTitle(action)}</h3>
          <hr />
        </div>
        {/* Action Inputs */}
        <div>
          {promptInputs.map((input) => {
            const Component = inputMapping[input.type];
            return (
              <div key={input.id}>
                <Component input={input} />
              </div>
            );
          })}
        </div>
        {hasTone && <Tone />}
        <button
          onClick={submit}
          className={`${loading || !isComplete ? "disabled-button" : ""}`}
          disabled={loading || !isComplete}
        >
          {loading ? "loading..." : "Generate"}
        </button>
        {/* output here */}
        {output && (
          <>
            <div className={loading ? "hidden" : "block"}>
              <p>{output}</p>
              <div
                style={{ whiteSpace: "pre-line" }}
                dangerouslySetInnerHTML={{ __html: output }}
              />
            </div>
            <div>
              <div>
                <button onClick={() => setOutput("")}>Clear</button>
                <button onClick={handleCopy}>
                  {isCopy ? "Copied" : "Copy to Clipboard"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
