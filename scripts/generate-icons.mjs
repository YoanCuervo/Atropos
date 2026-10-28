import { app, BrowserWindow } from "electron";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const ONYX = "#141210";
const TERRACOTTA = "#e0913a";
const APP_ICON_RADIUS_RATIO = 56 / 256;
const FULL_LOGO_MINIMUM_SIZE_PX = 32;
const APP_ICON_SIZES_PX = [16, 20, 24, 32, 40, 48, 64, 128, 256];
const TRAY_ICON_SIZES_PX = { "": 16, "@1.25x": 20, "@1.5x": 24, "@2x": 32 };
// Mid terracotta: at least 3:1 on both the light and the dark Windows taskbar,
// because Electron cannot tell a dark taskbar that shows the accent color.
const TRAY_GLYPH_COLOR = "#c06a1f";

const outputDirectory = resolve(readOutputDirectoryArgument() ?? ".");

/**
 * @returns {string | undefined}
 */
function readOutputDirectoryArgument() {
  const flagIndex = process.argv.indexOf("--out");
  return flagIndex === -1 ? undefined : process.argv[flagIndex + 1];
}

/**
 * @param {string} svgText
 * @returns {string}
 */
function convertSvgToDataUrl(svgText) {
  return `data:image/svg+xml;base64,${Buffer.from(svgText).toString("base64")}`;
}

/**
 * Draws the layers on a transparent canvas inside the hidden window.
 *
 * @param {BrowserWindow} renderingWindow
 * @param {number} sizePx
 * @param {{ backgroundColor?: string, imageDataUrl: string }} layers
 * @returns {Promise<{ pngBase64: string, rgbaBase64: string }>}
 */
function renderIcon(renderingWindow, sizePx, layers) {
  const script = `(async () => {
    const sizePx = ${sizePx};
    const canvas = document.createElement("canvas");
    canvas.width = sizePx;
    canvas.height = sizePx;
    const context = canvas.getContext("2d");
    const backgroundColor = ${JSON.stringify(layers.backgroundColor ?? null)};
    if (backgroundColor) {
      context.fillStyle = backgroundColor;
      context.beginPath();
      context.roundRect(0, 0, sizePx, sizePx, sizePx * ${APP_ICON_RADIUS_RATIO});
      context.fill();
    }
    const image = new Image();
    image.src = ${JSON.stringify(layers.imageDataUrl)};
    await image.decode();
    context.drawImage(image, 0, 0, sizePx, sizePx);
    const rgba = context.getImageData(0, 0, sizePx, sizePx).data;
    let binary = "";
    for (const byte of rgba) binary += String.fromCharCode(byte);
    return {
      pngBase64: canvas.toDataURL("image/png").split(",")[1],
      rgbaBase64: btoa(binary),
    };
  })()`;
  return renderingWindow.webContents.executeJavaScript(script);
}

/**
 * Encodes one icon entry as a 32-bit DIB, which every Windows icon reader accepts.
 *
 * @param {Buffer} rgba
 * @param {number} sizePx
 * @returns {Buffer}
 */
function encodeBitmapEntry(rgba, sizePx) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(sizePx, 4);
  header.writeInt32LE(sizePx * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  const pixels = Buffer.alloc(sizePx * sizePx * 4);
  for (let row = 0; row < sizePx; row += 1) {
    const bottomUpRow = sizePx - 1 - row;
    for (let column = 0; column < sizePx; column += 1) {
      const source = (row * sizePx + column) * 4;
      const target = (bottomUpRow * sizePx + column) * 4;
      pixels[target] = rgba[source + 2];
      pixels[target + 1] = rgba[source + 1];
      pixels[target + 2] = rgba[source];
      pixels[target + 3] = rgba[source + 3];
    }
  }
  const maskRowBytes = Math.ceil(sizePx / 32) * 4;
  const transparencyMask = Buffer.alloc(maskRowBytes * sizePx);
  return Buffer.concat([header, pixels, transparencyMask]);
}

/**
 * Bitmap entries up to 128 px, PNG for 256 px, as the NSIS installer expects.
 *
 * @param {{ sizePx: number, png: Buffer, rgba: Buffer }[]} renderedIcons
 * @returns {Buffer}
 */
function assembleIconFile(renderedIcons) {
  const entries = renderedIcons.map(({ sizePx, png, rgba }) =>
    sizePx >= 256 ? png : encodeBitmapEntry(rgba, sizePx),
  );
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const directory = Buffer.alloc(16 * entries.length);
  let dataOffset = header.length + directory.length;
  renderedIcons.forEach(({ sizePx }, index) => {
    const position = index * 16;
    directory.writeUInt8(sizePx >= 256 ? 0 : sizePx, position);
    directory.writeUInt8(sizePx >= 256 ? 0 : sizePx, position + 1);
    directory.writeUInt16LE(1, position + 4);
    directory.writeUInt16LE(32, position + 6);
    directory.writeUInt32LE(entries[index].length, position + 8);
    directory.writeUInt32LE(dataOffset, position + 12);
    dataOffset += entries[index].length;
  });
  return Buffer.concat([header, directory, ...entries]);
}

/**
 * @param {string} relativePath
 * @param {Buffer} content
 */
async function writeOutputFile(relativePath, content) {
  const outputPath = join(outputDirectory, relativePath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content);
  console.log(`wrote ${outputPath}`);
}

async function generateIcons() {
  const fullLogoSvg = await readFile("resources/icon.svg", "utf8");
  const glyphSvg = await readFile("resources/icon-glyph.svg", "utf8");
  const renderingWindow = new BrowserWindow({ show: false });
  await renderingWindow.loadURL("about:blank");

  const renderedAppIcons = [];
  for (const sizePx of APP_ICON_SIZES_PX) {
    const layers =
      sizePx >= FULL_LOGO_MINIMUM_SIZE_PX
        ? { imageDataUrl: convertSvgToDataUrl(fullLogoSvg) }
        : {
            backgroundColor: ONYX,
            imageDataUrl: convertSvgToDataUrl(
              glyphSvg.replaceAll("currentColor", TERRACOTTA),
            ),
          };
    const { pngBase64, rgbaBase64 } = await renderIcon(
      renderingWindow,
      sizePx,
      layers,
    );
    renderedAppIcons.push({
      sizePx,
      png: Buffer.from(pngBase64, "base64"),
      rgba: Buffer.from(rgbaBase64, "base64"),
    });
  }
  const largestAppIcon = renderedAppIcons.at(-1).png;
  await writeOutputFile("build/icon.ico", assembleIconFile(renderedAppIcons));
  await writeOutputFile("build/icon.png", largestAppIcon);
  await writeOutputFile("resources/icon.png", largestAppIcon);

  const trayImageDataUrl = convertSvgToDataUrl(
    glyphSvg.replaceAll("currentColor", TRAY_GLYPH_COLOR),
  );
  for (const [scaleSuffix, sizePx] of Object.entries(TRAY_ICON_SIZES_PX)) {
    const { pngBase64 } = await renderIcon(renderingWindow, sizePx, {
      imageDataUrl: trayImageDataUrl,
    });
    await writeOutputFile(
      `resources/tray${scaleSuffix}.png`,
      Buffer.from(pngBase64, "base64"),
    );
  }
  renderingWindow.destroy();
}

app
  .whenReady()
  .then(generateIcons)
  .then(() => app.quit())
  .catch((error) => {
    console.error(error);
    app.exit(1);
  });
