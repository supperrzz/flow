import { useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  createEmptySession,
  currentSessionIndexAtom,
  currentSessionSelector,
  sessionsAtom,
} from "../state";
import { Mask } from "../store/mask";
import { ChatSession, ChatMessage, createMessage, ModelConfig } from "../store";
import Locale, { getLang } from "../locales";
import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_SYSTEM_TEMPLATE,
  SUMMARIZE_MODEL,
} from "../constant";
import { estimateTokenLength } from "../utils/token";
import { api } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { prettyObject } from "../utils/format";
import { supabase } from "../utils/supabaseClient";
import { countTokens, updateUsage } from "../utils/usage";

function getSummarizeModel(currentModel: string) {
  // if it is using gpt-* models, force to use 3.5 to summarize
  return currentModel.startsWith("gpt") ? SUMMARIZE_MODEL : currentModel;
}

function fillTemplateWith(input: string, modelConfig: ModelConfig) {
  const vars = {
    model: modelConfig.model,
    time: new Date().toLocaleString(),
    lang: getLang(),
    input: input,
  };

  let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

  // must contains {{input}}
  const inputVar = "{{input}}";
  if (!output.includes(inputVar)) {
    output += "\n" + inputVar;
  }

  Object.entries(vars).forEach(([name, value]) => {
    output = output.replaceAll(`{{${name}}}`, value);
  });

  return output;
}
export function useChatStore() {
  const [sessions, setSessions] = useRecoilState(sessionsAtom);
  const [currentSessionIndex, setCurrentSessionIndex] = useRecoilState(
    currentSessionIndexAtom,
  );
  const currentSession = useRecoilValue(currentSessionSelector);

  const clearSessions = useCallback(() => {
    setSessions([createEmptySession()]);
    setCurrentSessionIndex(0);
  }, [setSessions, setCurrentSessionIndex]);

  const selectSession = useCallback(
    (index: number) => {
      setCurrentSessionIndex(index);
    },
    [setCurrentSessionIndex],
  );

  const newSession = useCallback(
    (mask?: Mask) => {
      const session = createEmptySession();
      if (mask) {
        session.mask = mask;
      }
      setSessions((prevSessions) => [session, ...prevSessions]);
      setCurrentSessionIndex(0);
    },
    [setSessions, setCurrentSessionIndex],
  );

  const deleteSession = useCallback(
    (index: number) => {
      setSessions((prevSessions) => {
        const newSessions = [...prevSessions];
        newSessions.splice(index, 1);
        // If deleting the last session, add an empty session
        if (newSessions.length === 0) {
          newSessions.push(createEmptySession());
        }
        return newSessions;
      });
      // Adjust currentSessionIndex if necessary
      setCurrentSessionIndex((prevIndex) => {
        if (index < prevIndex || prevIndex === sessions.length - 1) {
          return Math.max(prevIndex - 1, 0);
        }
        return prevIndex;
      });
    },
    [setSessions, setCurrentSessionIndex, sessions.length],
  );

  const updateCurrentSession = useCallback(
    async (updatedSession: ChatSession) => {
      setSessions((prevSessions) => {
        const newSessions = [...prevSessions];
        newSessions[currentSessionIndex] = updatedSession;
        return newSessions;
      });
    },
    [setSessions, currentSessionIndex],
  );

  const moveSession = useCallback(
    (from: number, to: number) => {
      setSessions((prevSessions) => {
        const newSessions = [...prevSessions];
        const session = newSessions.splice(from, 1)[0]; // Remove the session from the array
        newSessions.splice(to, 0, session); // Insert the session at the new index

        return newSessions;
      });
      // Adjust currentSessionIndex if necessary
      setCurrentSessionIndex((prevIndex) => {
        if (prevIndex === from) {
          return to;
        } else if (prevIndex > from && prevIndex <= to) {
          return prevIndex - 1;
        } else if (prevIndex < from && prevIndex >= to) {
          return prevIndex + 1;
        }
        return prevIndex;
      });
    },
    [setSessions, setCurrentSessionIndex],
  );

  const nextSession = useCallback(
    (delta: number) => {
      const n = sessions.length;
      const limit = (x: number) => (x + n) % n;
      const i = currentSessionIndex;
      selectSession(limit(i + delta));
    },
    [sessions.length, currentSessionIndex, selectSession],
  );

  const getMemoryPrompt = useCallback(() => {
    const session = currentSession;

    return {
      role: "system",
      content:
        session.memoryPrompt.length > 0
          ? Locale.Store.Prompt.History(session.memoryPrompt)
          : "",
      date: "",
    } as ChatMessage;
  }, [currentSession]);

  const getMessagesWithMemory = useCallback(() => {
    const session = currentSession;
    const modelConfig = session.mask.modelConfig;
    const clearContextIndex = session.clearContextIndex ?? 0;
    const messages = session.messages.slice();
    const totalMessageCount = session.messages.length;

    // in-context prompts
    const contextPrompts = session.mask.context.slice();

    // system prompts, to get close to OpenAI Web ChatGPT
    const shouldInjectSystemPrompts = modelConfig.enableInjectSystemPrompts;
    const systemPrompts = shouldInjectSystemPrompts
      ? [
          createMessage({
            role: "system",
            content: fillTemplateWith("", {
              ...modelConfig,
              template: DEFAULT_SYSTEM_TEMPLATE,
            }),
          }),
        ]
      : [];
    if (shouldInjectSystemPrompts) {
      console.log(
        "[Global System Prompt] ",
        // systemPrompts.at(0)?.content ?? "empty",
      );
    }

    // long term memory
    const shouldSendLongTermMemory =
      modelConfig.sendMemory &&
      session.memoryPrompt &&
      session.memoryPrompt.length > 0 &&
      session.lastSummarizeIndex > clearContextIndex;
    const longTermMemoryPrompts = shouldSendLongTermMemory
      ? [getMemoryPrompt()]
      : [];
    const longTermMemoryStartIndex = session.lastSummarizeIndex;

    // short term memory
    const shortTermMemoryStartIndex = Math.max(
      0,
      totalMessageCount - modelConfig.historyMessageCount,
    );

    // lets concat send messages, including 4 parts:
    // 0. system prompt: to get close to OpenAI Web ChatGPT
    // 1. long term memory: summarized memory messages
    // 2. pre-defined in-context prompts
    // 3. short term memory: latest n messages
    // 4. newest input message
    const memoryStartIndex = shouldSendLongTermMemory
      ? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
      : shortTermMemoryStartIndex;
    // and if user has cleared history messages, we should exclude the memory too.
    const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
    const maxTokenThreshold = modelConfig.max_tokens;

    // get recent messages as much as possible
    const reversedRecentMessages = [];
    for (
      let i = totalMessageCount - 1, tokenCount = 0;
      i >= contextStartIndex && tokenCount < maxTokenThreshold;
      i -= 1
    ) {
      const msg = messages[i];
      if (!msg || msg.isError) continue;
      tokenCount += estimateTokenLength(msg.content);
      reversedRecentMessages.push(msg);
    }

    // concat all messages
    const recentMessages = [
      ...systemPrompts,
      ...longTermMemoryPrompts,
      ...contextPrompts,
      ...reversedRecentMessages.reverse(),
    ];

    return recentMessages;
  }, [currentSession]);

  const resetSession = useCallback(() => {
    updateCurrentSession({
      ...currentSession,
      messages: [],
      memoryPrompt: "",
    });
  }, [updateCurrentSession]);

  const summarizeSession = useCallback(
    (session: ChatSession) => {
      const modelConfig = session.mask.modelConfig;
      const summarizeIndex = Math.max(
        session.lastSummarizeIndex,
        session.clearContextIndex ?? 0,
      );
      let toBeSummarizedMsgs = session.messages
        .filter((msg) => !msg.isError)
        .slice(summarizeIndex);

      const historyMsgLength = toBeSummarizedMsgs.length;

      if (historyMsgLength > modelConfig?.max_tokens ?? 4000) {
        const n = toBeSummarizedMsgs.length;
        toBeSummarizedMsgs = toBeSummarizedMsgs.slice(
          Math.max(0, n - modelConfig.historyMessageCount),
        );
      }

      // add memory prompt
      toBeSummarizedMsgs.unshift(getMemoryPrompt());

      const lastSummarizeIndex = session.messages.length;

      console.log(
        "[Chat History] ",
        toBeSummarizedMsgs,
        historyMsgLength,
        modelConfig.compressMessageLengthThreshold,
      );

      if (
        historyMsgLength > modelConfig.compressMessageLengthThreshold &&
        modelConfig.sendMemory
      ) {
        api.llm.chat({
          messages: toBeSummarizedMsgs.concat(
            createMessage({
              role: "system",
              content: Locale.Store.Prompt.Summarize,
              date: "",
            }),
          ),
          config: {
            ...modelConfig,
            stream: false,
            model: getSummarizeModel(session.mask.modelConfig.model),
          },
          onFinish(message) {
            console.log("[Memory] ", message);
            const updatedSession = {
              ...session,
              lastSummarizeIndex: lastSummarizeIndex,
              memoryPrompt: message,
            };
            updateCurrentSession(updatedSession);
          },
          onError(err) {
            console.error("[Summarize] ", err);
          },
        });
      }
    },
    [currentSession],
  );

  const updateStat = useCallback(
    (message: ChatMessage) => {
      updateCurrentSession({
        ...currentSession,
        stat: {
          ...currentSession.stat,
          charCount: (currentSession.stat.charCount += message.content.length),
          wordCount: (currentSession.stat.wordCount += estimateTokenLength(
            message.content,
          )),
          tokenCount: (currentSession.stat.tokenCount += estimateTokenLength(
            message.content,
          )),
        },
      });
    },
    [updateCurrentSession],
  );

  const clearAllData = useCallback(() => {
    localStorage.clear();
    location.reload();
  }, []);

  const onUserInput = useCallback(
    async (content: string) => {
      const session = currentSession;
      const modelConfig = session.mask.modelConfig;

      const userContent = fillTemplateWith(content, modelConfig);
      console.log("[User Input] after template: ", userContent);

      const userMessage: ChatMessage = createMessage({
        role: "user",
        content: userContent,
      });

      const botMessage: ChatMessage = createMessage({
        role: "assistant",
        streaming: true,
        model: modelConfig.model,
      });

      // get recent messages
      const recentMessages = getMessagesWithMemory();
      const sendMessages = recentMessages.concat(userMessage);
      const messageIndex = currentSession.messages.length + 1;

      // save user's and bot's message
      const savedUserMessage = {
        ...userMessage,
        content,
      };
      const updatedSession = {
        ...session,
        messages: session.messages.concat([savedUserMessage, botMessage]),
      };
      updateCurrentSession(updatedSession);

      if (modelConfig.systemPrompt) {
        const systemPrompt = createMessage({
          role: "system",
          content: modelConfig.systemPrompt,
        });

        // Add systemPrompt at the beginning of the array
        sendMessages.unshift(systemPrompt);
      }

      console.log("[Sent messages]", sendMessages);

      // make request
      api.llm.chat({
        messages: sendMessages,
        config: { ...modelConfig, stream: true },
        onUpdate(message) {
          const updatedBotMessage = { ...botMessage };
          updatedBotMessage.streaming = true;

          if (message) {
            updatedBotMessage.content = message;
          }
          const updatedMessages = session.messages.concat([
            savedUserMessage,
            updatedBotMessage,
          ]);
          const updatedSession = {
            ...session,
            messages: updatedMessages,
          };
          updateCurrentSession(updatedSession);
        },
        async onFinish(message) {
          const updatedBotMessage = { ...botMessage, streaming: false };

          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
              console.error("No user data found");
              return;
            }
            const tokens = countTokens(message);
            const error = await updateUsage(user.id, tokens);
            if (error) {
              console.error("[update usage error]: ", error);
            }
          } catch (error) {
            console.error("Error updating usage:", error);
          }

          if (message) {
            updatedBotMessage.content = message;
            const updatedMessages = session.messages.concat([
              savedUserMessage,
              updatedBotMessage,
            ]);
            const updatedSession = {
              ...session,
              messages: updatedMessages,
            };
            await updateCurrentSession(updatedSession);
            summarizeSession(updatedSession);
          }
          ChatControllerPool.remove(session.id, updatedBotMessage.id);
        },
        onError(error) {
          const isAborted = error.message.includes("aborted");
          botMessage.content +=
            "\n\n" +
            prettyObject({
              error: true,
              message: error.message,
            });
          botMessage.streaming = false;
          userMessage.isError = !isAborted;
          botMessage.isError = !isAborted;
          const updatedSession = {
            ...session,
            messages: session.messages.concat(),
          };
          updateCurrentSession(updatedSession);
          ChatControllerPool.remove(session.id, botMessage.id ?? messageIndex);

          console.error("[Chat] failed ", error);
        },
        onController(controller) {
          // collect controller for stop/retry
          ChatControllerPool.addController(
            session.id,
            botMessage.id ?? messageIndex,
            controller,
          );
        },
      });
    },
    [currentSession, getMessagesWithMemory, updateCurrentSession],
  );

  const chatStore = {
    sessions,
    currentSessionIndex,
    currentSession,
    clearSessions,
    nextSession,
    selectSession,
    newSession,
    deleteSession,
    updateCurrentSession,
    onUserInput,
    moveSession,
    getMessagesWithMemory,
    summarizeSession,
    resetSession,
    updateStat,
    clearAllData,
  };
  return chatStore;
}
