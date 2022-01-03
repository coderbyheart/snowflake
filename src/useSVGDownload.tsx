import { createContext, ComponentChildren } from "preact";
import { useState, Ref, useContext } from "preact/hooks";

export const SVGDownloadContext = createContext<{
  setSVG: (ref: Ref<SVGSVGElement>) => void;
  download: () => void;
}>({
  setSVG: () => undefined,
  download: () => undefined,
});

export const useSVGDownload = () => useContext(SVGDownloadContext);

export const SVGDownloadContextProvider = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  const [svgEl, setSVG] = useState<Ref<SVGSVGElement>>();

  const download = () => {
    const file = new File(
      [(svgEl?.current as any).outerHTML],
      `${document.location.hash?.substring(1) ?? "snowflake"}.svg`
    );
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = URL.createObjectURL(file);
    link.download = file.name;

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.parentNode?.removeChild(link);
    }, 0);
  };

  return (
    <SVGDownloadContext.Provider
      value={{
        download,
        setSVG,
      }}
    >
      {children}
    </SVGDownloadContext.Provider>
  );
};
