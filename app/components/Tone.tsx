import React, { ChangeEvent } from "react";
import { toneState } from "../state";
import { useRecoilState } from "recoil";
import { WRITING_TONES } from "../config/tones";

const Tone = () => {
  const [tone, setTone] = useRecoilState(toneState);
  const placeholderTextColor = "";
  const textColor =
    tone === "Neutral" || tone === "default" ? placeholderTextColor : "";
  return (
    <label htmlFor="tone">
      <span>Tone</span>
      <hr />
      <select
        value={tone}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setTone(e.target.value)
        }
        name="tone"
        id="tone"
        className={textColor}
      >
        <option value="default">None</option>
        {WRITING_TONES.map((tone) => (
          <option key={tone} value={tone}>
            {tone}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Tone;
