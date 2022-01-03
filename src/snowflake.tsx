import { useEffect, useState } from "preact/hooks";

type Branch = {
  length: number;
  position: number;
};

type Settings = { branches: Branch[] };

const settingsToString = (settings: Settings) =>
  [
    ...settings.branches.map(({ position, length }) =>
      [position, length].join(":")
    ),
  ].join(",");

const settingsFromString = (settingsAsString: string): Settings => {
  const branchInfo = settingsAsString.split(",");
  return {
    branches: branchInfo.map((s) => {
      const [position, length] = s.split(":");
      return {
        position: parseInt(position, 10),
        length: parseInt(length, 10),
      };
    }) as Branch[],
  };
};

const randomNumberFromSeed = async (min: number, max: number, seed: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return Math.floor(min + Math.abs(parseInt(hashHex, 16) % (max - min)));
};

const getSettingsFromHash = (): Settings => {
  const settingsString = document.location.hash?.substring(1) ?? "";
  if (settingsString.length <= 1)
    return {
      branches: [],
    };
  return settingsFromString(settingsString);
};

export const Snowflake = ({ seed }: { seed: string }) => {
  const [configuration, setConfiguration] = useState<Settings>(
    getSettingsFromHash()
  );

  const onHashChange = () => {
    setConfiguration(getSettingsFromHash());
  };

  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const root: Branch = {
    length: 500,
    position: 500,
  };

  useEffect(() => {
    if (seed.length === 0) return;
    Promise.all([
      randomNumberFromSeed(1, 6, `${seed} branches`).then((branches) =>
        Promise.all(
          [...Array(branches).keys()].map((_, k) =>
            Promise.all([
              randomNumberFromSeed(
                0,
                root.length,
                `${seed} branch ${k} Length`
              ),
              randomNumberFromSeed(
                0,
                root.length,
                `${seed} branch ${k} Position`
              ),
            ]).then(([length, position]) => ({ length, position }))
          )
        )
      ),
    ]).then(([branches]) => {
      const b: Branch[] = [];
      for (const { position, length } of branches) {
        b.push({
          length,
          position,
        });
      }
      document.location.hash = settingsToString({
        branches: b,
      });
    });
  }, [seed]);

  return (
    <svg class="snowflake" viewBox="0 0 2000 2000" title="Snowflake">
      {[0, 1, 2, 3, 4, 5].map((edge) => (
        <g transform={`translate(1000,1000) rotate(${edge * 60})`}>
          <BranchPath root={root} branches={configuration.branches} />
        </g>
      ))}
    </svg>
  );
};

const BranchPath = ({
  root,
  branches,
}: {
  root: Branch;
  branches: Branch[];
}) => {
  const strokeWidth = "10";
  return (
    <>
      <path
        fill="transparent"
        d={`M0 0 L${root.length} 0`}
        stroke="black"
        stroke-width={strokeWidth}
        stroke-linecap="round"
        opacity={0.8}
      ></path>
      {branches.map((branch) => (
        <>
          <path
            fill="transparent"
            d={`M0 0 L${branch.length} 0`}
            stroke="black"
            stroke-width={strokeWidth}
            stroke-linecap="round"
            transform={`translate(${
              root.length - branch.position
            }) rotate(-45,0,0) `}
            opacity={0.8}
          ></path>
          <path
            fill="transparent"
            d={`M0 0 L${branch.length} 0`}
            stroke="black"
            stroke-width={strokeWidth}
            stroke-linecap="round"
            transform={`translate(${
              root.length - branch.position
            }) rotate(45,0,0) `}
            opacity={0.8}
          ></path>
        </>
      ))}
    </>
  );
};
