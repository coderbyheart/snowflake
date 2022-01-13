import { useEffect, useRef, useState } from "preact/hooks";
import { useSVGDownload } from "./useSVGDownload";

export type DrawSettings = {
  strokeWidth: number;
  branchWidth: number;
  maxBranches: number;
  rotate: boolean;
  size: number;
  border: boolean;
  fillColor: string;
  borderColor: string;
};

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
        position: Math.ceil(Math.random() * drawSettings.size),
        length: Math.ceil(Math.random() * drawSettings.size),
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
                drawSettings.size,
                `${seed} branch ${k} Length`
              ),
              randomNumberFromSeed(
                0,
                drawSettings.size,
                `${seed} branch ${k} Position`
              ),
            ]).then(([length, position]) => {
              return {
                length: length * Math.sqrt(1 - position / drawSettings.size),
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
    <SnowflakeSVG
      drawSettings={drawSettings}
      viewBoxSize={2000}
      branches={configuration.branches}
    />
  );
};

const SnowflakeSVG = ({
  drawSettings,
  viewBoxSize,
  branches,
}: {
  drawSettings: DrawSettings;
  viewBoxSize: number;
  branches: Branch[];
}) => {
  const svgEl = useRef<SVGSVGElement>(null);
  const { setSVG } = useSVGDownload();
  setSVG(svgEl);

  const layers = [];
  if (drawSettings.border) {
    layers.push({
      fill: "transparent",
      "stroke-width": drawSettings.strokeWidth,
      stroke: drawSettings.borderColor,
    });
  }
  layers.push({
    fill: drawSettings.fillColor,
  });

  return (
    <svg
      class={`snowflake ${drawSettings.rotate && "rotate"}`}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      title="Snowflake"
      ref={svgEl}
    >
      {layers.map((pathProps) =>
        [0, 1, 2, 3, 4, 5].map((edge) => (
          <g
            transform={`translate(${viewBoxSize / 2},${
              viewBoxSize / 2
            }) rotate(${edge * 60})`}
          >
            <BranchPath
              size={drawSettings.size}
              branches={branches}
              branchWidth={drawSettings.branchWidth / 2}
              pathProps={pathProps}
            />
          </g>
        ))
      )}
    </svg>
  );
};

const BranchPath = ({
  size,
  branches,
  branchWidth,
  pathProps,
}: {
  size: number;
  branches: Branch[];
  branchWidth: number;
  pathProps: any;
}) => {
  const hexagonSize = branches.sort(
    ({ position: p1 }, { position: p2 }) => p1 - p2
  )[0].position;

  return (
    <>
      <path
        {...pathProps}
        d={[
          `M${hexagonSize} ${branchWidth}`,
          `L${size + hexagonSize} ${branchWidth}`,
          `L${size + hexagonSize + branchWidth / (3 / 2)} 0`,
          `L${size + hexagonSize} -${branchWidth}`,
          `L${hexagonSize} -${branchWidth}`,
          `z`,
        ].join(" ")}
      ></path>
      <path
        {...pathProps}
        d={[
          `M0 ${branchWidth}`,
          `L${hexagonSize} ${branchWidth}`,
          `L${hexagonSize} -${branchWidth}`,
          `L0 -${branchWidth}`,
          `z`,
        ].join(" ")}
        transform={`rotate(60,${hexagonSize},0)`}
      ></path>
      {branches.map((branch) => (
        <>
          <path
            {...pathProps}
            d={[
              `M${branch.position} ${branchWidth}`,
              `L${branch.position + branch.length} ${branchWidth}`,
              `L${branch.position + branch.length + branchWidth / (3 / 2)} 0`,
              `L${branch.position + branch.length} -${branchWidth}`,
              `L${branch.position} -${branchWidth}`,
              `z`,
            ].join(" ")}
            transform={`rotate(45,${branch.position},0) `}
          ></path>
          <path
            {...pathProps}
            d={[
              `M${branch.position} ${branchWidth}`,
              `L${branch.position + branch.length} ${branchWidth}`,
              `L${branch.position + branch.length + branchWidth / (3 / 2)} 0`,
              `L${branch.position + branch.length} -${branchWidth}`,
              `L${branch.position} -${branchWidth}`,
              `z`,
            ].join(" ")}
            transform={`rotate(-45,${branch.position},0) `}
          ></path>
        </>
      ))}
    </>
  );
};
