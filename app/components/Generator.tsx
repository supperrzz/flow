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
import StopIcon from "../icons/pause.svg";
import LoadingIcon from "../icons/three-dots.svg";
import ReactMarkdown from "react-markdown";
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";
import error from "next/error";
import { countTokens, updateUsage } from "../utils/usage";

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
  const isComplete = requiredInputs.every((id) => inputValues[id]);
  const hasTone = pageActions[action as keyof typeof pageActions].tone;

  const submit = async () => {
    setLoading(true);
    setOutput("");

    const controller = new AbortController();
    setAbortController(controller); // Store the controller in the state

    try {
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
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      // This data is a ReadableStream
      const data = response.body;
      if (!data) {
        return;
      }

      const onParse = onParseGPT;
      const reader = data.getReader();
      const decoder = new TextDecoder();
      const parser = createParser(onParse);
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        parser.feed(chunkValue);
        if (done) {
          await updateUsage(
            user?.id as string,
            countTokens(chunkValue) as number,
          );
        }
      }
      setLoading(false);
      if (error) {
        console.error("[update usage error]: ", error);
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.log(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setInputValue({});
    setOutput("");
    setTone("Neutral");
  };

  const onParseGPT = (event: ParsedEvent | ReconnectInterval) => {
    if (event.type === "event") {
      const data = event.data;
      try {
        const text = JSON.parse(data).text ?? "";
        setOutput((prev) => prev + text);
      } catch (e) {
        console.error(e);
      }
    }
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

  const [abortController, setAbortController] = useState<any>(null);
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Enter" && isComplete) {
        submit();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isComplete, submit, inputValues]);

  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const stopStream = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === " ") {
        stopStream();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [stopStream]);

  if (actionNotFound) {
    return (
      <div className={styles["empty-state"]}>
        <h3>Select a Workflow</h3>
      </div>
    );
  }

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
                <ReactMarkdown className={styles["output-content"]}>
                  {output}
                </ReactMarkdown>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <IconButton
                  icon={<StopIcon />}
                  onClick={stopStream}
                  text="Stop"
                />
                <IconButton
                  disabled={loading}
                  icon={<CopyIcon />}
                  onClick={handleCopy}
                  text={isCopy ? "Copied" : "Copy to Clipboard"}
                />
                <IconButton
                  disabled={loading}
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
