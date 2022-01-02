import { Snowflake } from "./snowflake";
import { useState } from "preact/hooks";

export const Hashflake = () => {
  const [seed, setSeed] = useState<string>("");
  return (
    <>
      <Snowflake seed={seed} />
      <form>
        <label for="seed">Seed:</label>
        <input
          id="seed"
          type="text"
          value={seed}
          onInput={(e) => {
            setSeed((e.target as any).value);
          }}
        />
      </form>
    </>
  );
};