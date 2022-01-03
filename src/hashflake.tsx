import { Snowflake, DrawSettings } from "./snowflake";
import { useState } from "preact/hooks";

export const Hashflake = () => {
  const [seed, setSeed] = useState<string>("");
  const [drawSettings, setDrawSettings] = useState<DrawSettings>({
    strokeWidth: 20,
    maxBranches: 6,
    rotate: true,
  });
  return (
    <>
      <Snowflake seed={seed} drawSettings={drawSettings} />
      <form>
        <fieldset>
          <label for="seed">Type some text to generate a new ❄️:</label>
          <input
            id="seed"
            type="text"
            value={seed}
            onInput={(e) => {
              setSeed((e.target as any).value);
            }}
            autoComplete="off"
          />
        </fieldset>
        <fieldset>
          <p>
            <label for="strokeWidth">Stroke width</label>
            <input
              type="range"
              id="strokeWidth"
              min={1}
              max={100}
              value={drawSettings.strokeWidth}
              onInput={(e) => {
                setDrawSettings({
                  ...drawSettings,
                  strokeWidth: (e.target as any).value,
                });
              }}
            />
          </p>
          <p>
            <label for="maxBranches">
              Maximum umber of branches ({drawSettings.maxBranches})
            </label>
            <input
              type="range"
              id="maxBranches"
              min={1}
              max={20}
              value={drawSettings.maxBranches}
              onInput={(e) => {
                setDrawSettings({
                  ...drawSettings,
                  maxBranches: parseInt((e.target as any).value, 10),
                });
              }}
            />
          </p>
          <p>
            <label for="rotate">Rotate?</label>
            <input
              type="checkbox"
              id="rotate"
              checked={drawSettings.rotate}
              onInput={(e) => {
                setDrawSettings({
                  ...drawSettings,
                  rotate: (e.target as any).checked,
                });
              }}
            />
          </p>
        </fieldset>
      </form>
    </>
  );
};
