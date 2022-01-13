import { Snowflake, DrawSettings } from "./snowflake";
import { useState } from "preact/hooks";
import { useSVGDownload } from "./useSVGDownload";

export const Hashflake = () => {
  const { download } = useSVGDownload();
  const [seed, setSeed] = useState<string>("");
  const [drawSettings, setDrawSettings] = useState<DrawSettings>({
    strokeWidth: 20,
    branchWidth: 50,
    maxBranches: 6,
    rotate: true,
    size: 500,
    border: true,
    fillColor: "white",
    borderColor: "black",
  });
  return (
    <>
      <Snowflake seed={seed} drawSettings={drawSettings} />
      <p>
        <button
          type="button"
          onClick={() => {
            download();
          }}
        >
          Download SVG
        </button>
      </p>
      <form>
        <fieldset>
          <p>
            <button
              type="button"
              onClick={() => {
                document.location.hash = "";
              }}
            >
              Generate a new ❄️
            </button>
          </p>
          <p>
            <span>or</span>{" "}
            <label for="seed">type some text to generate a new ❄️:</label>
            <input
              id="seed"
              type="text"
              value={seed}
              onInput={(e) => {
                setSeed((e.target as any).value);
              }}
              autoComplete="off"
            />
          </p>
        </fieldset>
        <fieldset>
          <p>
            <label for="branchWidth">
              Branch width ({drawSettings.branchWidth})
            </label>
            <input
              type="range"
              id="branchWidth"
              min={1}
              max={250}
              value={drawSettings.branchWidth}
              onInput={(e) => {
                setDrawSettings({
                  ...drawSettings,
                  branchWidth: (e.target as any).value,
                });
              }}
            />
          </p>
          <p>
            <label for="strokeWidth">
              Stroke width ({drawSettings.strokeWidth})
            </label>
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
              Maximum number of branches ({drawSettings.maxBranches})
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
            <label for="size">Size ({drawSettings.size})</label>
            <input
              type="range"
              id="size"
              min={1}
              max={2000}
              value={drawSettings.size}
              onInput={(e) => {
                setDrawSettings({
                  ...drawSettings,
                  size: parseInt((e.target as any).value, 10),
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
          <p>
            <label for="border">Border?</label>
            <input
              type="checkbox"
              id="border"
              checked={drawSettings.border}
              onInput={(e) => {
                setDrawSettings({
                  ...drawSettings,
                  border: (e.target as any).checked,
                });
              }}
            />
          </p>
          <p>
            <label for="fillColor">Fill color</label>
            <input
              type="color"
              id="fillColor"
              value={drawSettings.fillColor}
              onChange={(e) => {
                setDrawSettings({
                  ...drawSettings,
                  fillColor: (e.target as any).value,
                });
              }}
            />
          </p>
          <p>
            {[
              "#58ebf7",
              "#4b4afd",
              "#24c3f7",
              "#10f6fd",
              "#177dcb",
              "#15649b",
              "#73726e",
              "#d1d960",
              "#fce151",
              "#fd9c5b",
              "#fb6c5b",
              "#fb5cac",
              "#fc30e1",
            ].map((color) => (
              <button
                type="button"
                onClick={() => {
                  setDrawSettings({
                    ...drawSettings,
                    fillColor: color,
                  });
                }}
                style={{ backgroundColor: color }}
              >
                {color}
              </button>
            ))}
          </p>
          <p>
            <label for="borderColor">Border color</label>
            <input
              type="color"
              id="borderColor"
              value={drawSettings.borderColor}
              onChange={(e) => {
                setDrawSettings({
                  ...drawSettings,
                  borderColor: (e.target as any).value,
                });
              }}
            />
          </p>
        </fieldset>
      </form>
    </>
  );
};
