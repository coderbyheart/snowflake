import { useEffect, useState } from "preact/hooks";

export type DrawSettings = {
  strokeWidth: number;
  maxBranches: number;
  rotate: boolean;
};

const maxSize = 500;

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
  return Math.ceil(min + Math.abs(parseInt(hashHex, 16) % (max - min)));
};

const getSettingsFromHash = (drawSettings: DrawSettings): Settings => {
  const settingsString = document.location.hash?.substring(1) ?? "";
  if (settingsString.length <= 1)
    return {
      branches: [
        ...Array(Math.ceil(Math.random() * drawSettings.maxBranches)).keys(),
      ].map(() => ({
        position: Math.ceil(Math.random() * maxSize),
        length: Math.ceil(Math.random() * maxSize),
      })),
    };
  return settingsFromString(settingsString);
};

export const Snowflake = ({
  seed,
  drawSettings,
}: {
  seed: string;
  drawSettings: DrawSettings;
}) => {
  const [configuration, setConfiguration] = useState<Settings>(
    getSettingsFromHash(drawSettings)
  );

  const onHashChange = () => {
    setConfiguration(getSettingsFromHash(drawSettings));
  };

  // Update configuration from hash
  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  // Write configuration to hash
  useEffect(() => {
    document.location.hash = settingsToString(configuration);
  }, [configuration]);

  const root: Branch = {
    length: maxSize,
    position: maxSize,
  };

  useEffect(() => {
    if (seed.length === 0) return;
    Promise.all([
      randomNumberFromSeed(
        1,
        drawSettings.maxBranches,
        `${seed} branches`
      ).then((branches) =>
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
            ]).then(([length, position]) => {
              return {
                length: length * Math.sqrt(1 - position / root.length),
                position,
              };
            })
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
      setConfiguration({ branches: b });
    });
  }, [seed, drawSettings]);

  return (
    <svg
      class={`snowflake ${drawSettings.rotate && "rotate"}`}
      viewBox="0 0 2000 2000"
      title="Snowflake"
    >
      {[0, 1, 2, 3, 4, 5].map((edge) => (
        <g transform={`translate(1000,1000) rotate(${edge * 60})`}>
          <BranchPath
            root={root}
            branches={configuration.branches}
            strokeWidth={drawSettings.strokeWidth}
          />
        </g>
      ))}
    </svg>
  );
};

const BranchPath = ({
  root,
  branches,
  strokeWidth,
}: {
  root: Branch;
  branches: Branch[];
  strokeWidth: number;
}) => {
  const hexagonSize = branches.sort(
    ({ position: p1 }, { position: p2 }) => p1 - p2
  )[0].position;

  return (
    <>
      <path
        fill="transparent"
        d={`M${hexagonSize} 0 L${root.length + hexagonSize} 0`}
        stroke="black"
        stroke-width={strokeWidth}
        stroke-linecap="round"
      ></path>
      <path
        fill="transparent"
        d={`M0 0 L${hexagonSize} 0`}
        stroke="black"
        stroke-width={strokeWidth}
        stroke-linecap="round"
        transform={`rotate(60,${hexagonSize},0)`}
      ></path>
      {branches.map((branch) => (
        <>
          <path
            fill="transparent"
            d={`M${branch.position} 0 L${branch.position + branch.length} 0`}
            stroke="black"
            stroke-width={strokeWidth}
            stroke-linecap="round"
            transform={`rotate(-45,${branch.position},0) `}
          ></path>
          <path
            fill="transparent"
            d={`M${branch.position} 0 L${branch.position + branch.length} 0`}
            stroke="black"
            stroke-width={strokeWidth}
            stroke-linecap="round"
            transform={`rotate(45,${branch.position},0) `}
          ></path>
        </>
      ))}
    </>
  );
};
