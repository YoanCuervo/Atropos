/**
 * Reads the whole standard input as UTF-8 text.
 *
 * @param {NodeJS.ReadableStream} [inputStream]
 * @returns {Promise<string>}
 */
export async function readStandardInput(inputStream = process.stdin) {
  const chunks = [];
  for await (const chunk of inputStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}
