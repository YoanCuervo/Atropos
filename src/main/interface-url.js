import { join } from "path";
import { pathToFileURL } from "url";
import { is } from "@electron-toolkit/utils";

/**
 * Tells whether an address belongs to the Atropos interface: the development server
 * while developing, the bundled `index.html` once built. Anything else is foreign.
 *
 * @param {string} pageUrl
 * @returns {boolean}
 */
export function isAtroposInterfaceUrl(pageUrl) {
  if (!URL.canParse(pageUrl)) {
    return false;
  }
  const page = new URL(pageUrl);

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    return page.origin === new URL(process.env["ELECTRON_RENDERER_URL"]).origin;
  }

  const interfacePage = pathToFileURL(
    join(__dirname, "../renderer/index.html"),
  );
  return (
    page.protocol === "file:" &&
    decodeURIComponent(page.pathname).toLowerCase() ===
      decodeURIComponent(interfacePage.pathname).toLowerCase()
  );
}
