import React, { ChangeEvent } from "react";
import { toneState } from "../../state";
import { useRecoilState } from "recoil";
import { WRITING_TONES } from "../../config/tones";
import { Select } from "../ui-lib";

const Tone = () => {
  const [tone, setTone] = useRecoilState(toneState);
  const placeholderTextColor = "";
  const textColor =
    tone === "Neutral" || tone === "default" ? placeholderTextColor : "";
  return (
    <div style={{ marginBottom: "16px" }}>
      <label htmlFor="tone">
        {/* <span>Tone</span> */}
        <Select
          value={tone}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setTone(e.target.value)
          }
          name="tone"
          id="tone"
          className={textColor}
        >
          <option value="default">Select a tone</option>
          {WRITING_TONES.map((tone) => (
            <option key={tone} value={tone}>
              {tone}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
};

export default Tone;
