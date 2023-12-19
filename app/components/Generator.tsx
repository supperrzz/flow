import React, { useEffect, useState } from "react";
import {
  toneState,
  promptInputsState,
  inputValuesState,
  actionState,
  currentUserState,
} from "../state";
import { useRecoilState, useRecoilValue } from "recoil";
import Tone from "./inputs/Tone";
import TextInput from "../components/inputs/TextInput";
import TextAreaInput from "../components/inputs/TextAreaInput";
import { camelToTitle } from "../utils-2";
import SelectBox from "./inputs/SelectBox";
import pageActions from "../actions";
import styles from "../components/document.module.scss";
import { IconButton } from "./button";
import ChatGptIcon from "../icons/chatgpt.svg";
import CopyIcon from "../icons/copy.svg";
import ClearIcon from "../icons/clear.svg";
import LoadingIcon from "../icons/three-dots.svg";
import ReactMarkdown from "react-markdown";

export default function Generator() {
  const user = useRecoilValue(currentUserState);
  const [tone, setTone] = useRecoilState(toneState);
  const [promptInputs, setPromptInputs] = useRecoilState(promptInputsState);
  const [output, setOutput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [requiredInputs, setRequiredInputs] = useState<string[]>([]);
  const action = useRecoilValue(actionState);
  const actionNotFound = !pageActions[action as keyof typeof pageActions];
  const [inputValues, setInputValue] = useRecoilState(inputValuesState);

  const reset = () => {
    setInputValue({});
    setOutput("");
    setTone("Neutral");
  };

  useEffect(() => {
    if (action) {
      const inputs =
        pageActions[action as keyof typeof pageActions]?.inputs || [];
      const requiredInputIds = inputs
        .filter((input) => input.required)
        .map((input: { id: any }) => input.id);
      setRequiredInputs(requiredInputIds);
      setPromptInputs(inputs);
      setInputValue({});
      setTone("Neutral");
      setOutput("");
    }
  }, [action, setPromptInputs]);

  if (actionNotFound) {
    return (
      <div className={styles["empty-state"]}>
        <h3>Select a Workflow</h3>
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
    const node = document.querySelector(".output-content");
    if (!node) return;
    const html = node.innerHTML;
    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ])
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((error) => {
        console.error("Failed to copy text to clipboard:", error);
      });
    setIsCopy(true);
    setTimeout(() => {
      setIsCopy(false);
    }, 500);
  };

  const submit = async () => {
    setLoading(true);
    try {
      // send supabase user id
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: action,
          payload: {
            ...inputValues,
            userId: user?.id,
            userEmail: user?.email,
          },
          tone,
        }),
      });
      const output = await response.json();
      const { result } = output;
      setOutput(result.content);
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
          <div className={styles["action-title"]}>{camelToTitle(action)}</div>
        </div>
        {/* Action Inputs */}
        {
          <div style={loading ? { opacity: "0.5", pointerEvents: "none" } : {}}>
            <div className={styles["inputs"]}>
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
          </div>
        }
        <IconButton
          onClick={submit}
          // text={loading ? "Generating..." : ""}
          disabled={loading || !isComplete}
          icon={!loading ? <ChatGptIcon /> : <LoadingIcon />}
          type={loading ? undefined : "primary"}
        />
        {/* output here */}
        {output && (
          <div className={styles["output"]} style={{ marginTop: "20px" }}>
            <div className={loading ? "hidden" : "block"}>
              <div>
                <ReactMarkdown className="output-content">
                  {output}
                </ReactMarkdown>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <IconButton
                  icon={<CopyIcon />}
                  onClick={handleCopy}
                  text={isCopy ? "Copied" : "Copy to Clipboard"}
                />
                <IconButton
                  icon={<ClearIcon />}
                  onClick={() => reset()}
                  text="Clear"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
