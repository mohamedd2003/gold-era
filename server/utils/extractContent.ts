import fs from "node:fs/promises";

const TEXT_LIMIT = 100_000; // cap stored text to protect the DB row size.

const TEXT_MATCHERS: RegExp[] = [
  /^text\//i,
  /application\/json/i,
  /application\/xml/i,
  /application\/javascript/i,
  /application\/x-yaml/i,
  /\+xml$/i,
  /csv/i,
  /markdown/i,
];

function isTextMimetype(mimetype: string): boolean {
  return TEXT_MATCHERS.some((matcher) => matcher.test(mimetype));
}

/**
 * Extracts readable text from text-based uploads. Binary formats (images,
 * PDFs, archives, ...) return null. Swap in dedicated parsers (pdf-parse,
 * mammoth, ...) here to support more formats later.
 */
export async function extractTextContent(
  filePath: string,
  mimetype: string
): Promise<string | null> {
  if (!isTextMimetype(mimetype)) return null;
  try {
    const buffer = await fs.readFile(filePath);
    return buffer.toString("utf8").slice(0, TEXT_LIMIT);
  } catch {
    return null;
  }
}
