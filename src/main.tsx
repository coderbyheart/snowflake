import { render } from "preact";
import { Hashflake } from "./hashflake";

import "./index.css";
import { SVGDownloadContextProvider } from "./useSVGDownload";

render(
  <SVGDownloadContextProvider>
    <Hashflake />
  </SVGDownloadContextProvider>,
  document.getElementById("root")!
);
