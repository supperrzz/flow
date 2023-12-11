import { ModalConfigValidator, ModelConfig, useAppConfig } from "../store";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { Input, ListItem, Select } from "./ui-lib";
import { MODEL_NAMES } from "../constant";

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
  showFields?: boolean;
  isSubscribed: boolean;
}) {
  const config = useAppConfig();

  return (
    <>
      <ListItem title={Locale.Settings.Model}>
        <Select
          value={props.modelConfig.model}
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.model = ModalConfigValidator.model(
                  e.currentTarget.value,
                )),
            );
          }}
        >
          {!props.isSubscribed && (
            <>
              <option value="gpt-3.5-turbo" disabled={false}>
                {"Default"}
              </option>
              <option value="" disabled>
                {"Turbo"}
              </option>
              {/* <option value="" disabled>
                {"GPT-4 Turbo"}
              </option> */}
            </>
          )}
          {props.isSubscribed &&
            config.allModels().map((v, i) => (
              <option value={v.name} key={i} disabled={!v.available}>
                {MODEL_NAMES[v.name as keyof typeof MODEL_NAMES]}
              </option>
            ))}
        </Select>
      </ListItem>
      <ListItem title="AI Instructions" subTitle="Default AI Instructions">
        <Input
          defaultValue={props.modelConfig.systemPrompt}
          style={{ width: "80%" }}
          rows={4}
          onChange={(e) => {
            props.updateConfig(
              (config) => (config.systemPrompt = e.currentTarget.value),
            );
          }}
        />
      </ListItem>
      {props.showFields && (
        <>
          <ListItem
            title={Locale.Settings.Temperature.Title}
            subTitle={Locale.Settings.Temperature.SubTitle}
          >
            <InputRange
              value={props.modelConfig.temperature?.toFixed(1)}
              min="0"
              max="1" // lets limit it to 0-1
              step="0.1"
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.temperature = ModalConfigValidator.temperature(
                      e.currentTarget.valueAsNumber,
                    )),
                );
              }}
            ></InputRange>
          </ListItem>
          <ListItem
            title={Locale.Settings.TopP.Title}
            subTitle={Locale.Settings.TopP.SubTitle}
          >
            <InputRange
              value={(props.modelConfig.top_p ?? 1).toFixed(1)}
              min="0"
              max="1"
              step="0.1"
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.top_p = ModalConfigValidator.top_p(
                      e.currentTarget.valueAsNumber,
                    )),
                );
              }}
            ></InputRange>
          </ListItem>
          <ListItem
            title={Locale.Settings.MaxTokens.Title}
            subTitle={Locale.Settings.MaxTokens.SubTitle}
          >
            <input
              type="number"
              min={100}
              max={100000}
              value={props.modelConfig.max_tokens}
              onChange={(e) =>
                props.updateConfig(
                  (config) =>
                    (config.max_tokens = ModalConfigValidator.max_tokens(
                      e.currentTarget.valueAsNumber,
                    )),
                )
              }
            ></input>
          </ListItem>
          <ListItem
            title={Locale.Settings.PresencePenalty.Title}
            subTitle={Locale.Settings.PresencePenalty.SubTitle}
          >
            <InputRange
              value={props.modelConfig.presence_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.1"
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.presence_penalty =
                      ModalConfigValidator.presence_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.FrequencyPenalty.Title}
            subTitle={Locale.Settings.FrequencyPenalty.SubTitle}
          >
            <InputRange
              value={props.modelConfig.frequency_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.1"
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.frequency_penalty =
                      ModalConfigValidator.frequency_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.HistoryCount.Title}
            subTitle={Locale.Settings.HistoryCount.SubTitle}
          >
            <InputRange
              title={props.modelConfig.historyMessageCount.toString()}
              value={props.modelConfig.historyMessageCount}
              min="0"
              max="64"
              step="1"
              onChange={(e) =>
                props.updateConfig(
                  (config) =>
                    (config.historyMessageCount = e.target.valueAsNumber),
                )
              }
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.CompressThreshold.Title}
            subTitle={Locale.Settings.CompressThreshold.SubTitle}
          >
            <input
              type="number"
              min={500}
              max={4000}
              value={props.modelConfig.compressMessageLengthThreshold}
              onChange={(e) =>
                props.updateConfig(
                  (config) =>
                    (config.compressMessageLengthThreshold =
                      e.currentTarget.valueAsNumber),
                )
              }
            ></input>
          </ListItem>
          <ListItem title={Locale.Memory.Title} subTitle={Locale.Memory.Send}>
            <input
              type="checkbox"
              checked={props.modelConfig.sendMemory}
              onChange={(e) =>
                props.updateConfig(
                  (config) => (config.sendMemory = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>
        </>
      )}
    </>
  );
}
