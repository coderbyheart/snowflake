import { useEffect, useState } from "preact/hooks";

type Branch = {
  length: number;
  position: number;
  angle: number;
};

type Settings = { branches: number; rotation: number };

const generate = (parent: Branch, settings: Settings) => {
  for (let i = 0; i < settings.branches; i++) {
    const length = Math.random() * parent.length;
    const position = Math.random() * parent.length;
    const rightBranch: Branch = {
      length,
      position,
      angle: parent.angle + 45,
    };
    const leftBranch: Branch = {
      length,
      position,
      angle: parent.angle - 45,
    };
  }
};

const randomNumberFromSeed = async (min: number, max: number, seed: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return min + Math.abs(parseInt(hashHex, 16) % (max - min));
};

export const Snowflake = ({ seed }: { seed: string }) => {
  const [settings, setSettings] = useState<{ rotation: number }>({
    rotation: 0,
  });

  const [branches, setBranches] = useState<Branch[]>([]);

  const root: Branch = {
    length: 500,
    position: 500,
    angle: 0,
  };
  useEffect(() => {
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
      randomNumberFromSeed(0, 60, `${seed} rotation`),
    ]).then(([branches, rotation]) => {
      const b: Branch[] = [];
      for (const { position, length } of branches) {
        const rightBranch: Branch = {
          length,
          position,
          angle: 45,
        };
        const leftBranch: Branch = {
          length,
          position,
          angle: -45,
        };
        b.push(rightBranch);
        b.push(leftBranch);
      }
      setBranches(b);
      setSettings({ rotation });
      console.log(b);
    });
  }, [seed]);

  return (
    <svg
      class="snowflake"
      height="200px"
      width="200px"
      viewBox="0 0 2000 2000"
      title="Snowflake"
    >
      {[0, 1, 2, 3, 4, 5].map((edge) => (
        <g
          transform={`translate(1000,1000) rotate(${
            edge * 60 + settings.rotation
          })`}
        >
          <BranchPath root={root} branches={branches} />
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
  return (
    <>
      <path
        fill="transparent"
        d={`M0 0 L${root.length} 0`}
        stroke="black"
        stroke-width="1%"
        stroke-linecap="round"
      ></path>
      {branches.map((branch) => (
        <path
          fill="transparent"
          d={`M0 0 L${branch.length} 0`}
          stroke="black"
          stroke-width="1%"
          stroke-linecap="round"
          transform={`translate(${root.length - branch.position}) rotate(${
            branch.angle
          },0,0) `}
        ></path>
      ))}
    </>
  );
};
