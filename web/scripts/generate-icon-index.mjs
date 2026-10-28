import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const iconsRoot = path.join(repoRoot, "icons");
const outRoot = path.resolve(__dirname, "../public/data");
const setsOutDir = path.join(outRoot, "sets");

function titleCaseSlug(slug) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function firstMarkdownHeading(readmePath) {
  try {
    const text = fs.readFileSync(readmePath, "utf8");
    const match = text.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

function parseRootReadmeTable(readmePath) {
  /** @type {Map<string, { name: string, license: string, author: string }>} */
  const map = new Map();
  try {
    const text = fs.readFileSync(readmePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      // | [Name](slug/) | count | license | author |
      const m = line.match(
        /^\|\s*\[([^\]]+)\]\(([^)/]+)\/?\)\s*\|\s*(\d+)\s*\|\s*([^|]+)\|\s*(.+)\|\s*$/,
      );
      if (!m) continue;
      map.set(m[2], {
        name: m[1].trim(),
        license: m[4].trim(),
        author: m[5].trim(),
      });
    }
  } catch {
    // ignore
  }
  return map;
}

function decodeXmlEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Parse draw.io library.xml into a map of filename → { title, tags }.
 * @param {string} libraryPath
 */
function parseLibraryXml(libraryPath) {
  /** @type {Map<string, { title: string, tags: string[] }>} */
  const byFile = new Map();
  let raw;
  try {
    raw = fs.readFileSync(libraryPath, "utf8");
  } catch {
    return byFile;
  }

  const contentMatch = raw.match(/<mxlibrary[^>]*>([\s\S]*)<\/mxlibrary>/i);
  if (!contentMatch) return byFile;

  let jsonText = contentMatch[1].trim();
  if (!jsonText) return byFile;

  /** @type {unknown} */
  let entries;
  try {
    entries = JSON.parse(jsonText);
  } catch {
    return byFile;
  }
  if (!Array.isArray(entries)) return byFile;

  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const title =
      typeof entry.title === "string" && entry.title.trim()
        ? entry.title.trim()
        : null;
    const tags =
      typeof entry.tags === "string"
        ? entry.tags
            .split(/\s+/)
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    let fileName = null;
    const xml = typeof entry.xml === "string" ? entry.xml : "";
    const decoded = decodeXmlEntities(xml);
    const imageMatch = decoded.match(/image=([^;"\s]+)/);
    if (imageMatch) {
      try {
        const url = decodeURIComponent(imageMatch[1]);
        fileName = path.basename(url.split("?")[0]);
      } catch {
        fileName = path.basename(imageMatch[1].split("?")[0]);
      }
    }

    if (fileName && title) {
      byFile.set(fileName, { title, tags });
    }
  }

  return byFile;
}

function displayTitleFromFile(file) {
  return path
    .basename(file, path.extname(file))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  if (!fs.existsSync(iconsRoot)) {
    console.error(`Icons directory not found: ${iconsRoot}`);
    process.exit(1);
  }

  ensureDir(setsOutDir);

  const tableMeta = parseRootReadmeTable(path.join(iconsRoot, "README.md"));
  const setDirs = fs
    .readdirSync(iconsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  /** @type {Array<{ id: string, name: string, count: number, license: string, author: string }>} */
  const sets = [];
  /** @type {Array<{ id: string, set: string, t: string, tags: string[] }>} */
  const searchMin = [];

  let totalIcons = 0;
  let libraryHits = 0;
  let libraryMisses = 0;

  for (const id of setDirs) {
    const setDir = path.join(iconsRoot, id);
    const svgDir = path.join(setDir, "svg");
    if (!fs.existsSync(svgDir) || !fs.statSync(svgDir).isDirectory()) {
      continue;
    }

    const IMAGE_EXT = new Set([".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif"]);
    const files = fs
      .readdirSync(svgDir)
      .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const meta = tableMeta.get(id);
    const name =
      firstMarkdownHeading(path.join(setDir, "README.md")) ||
      meta?.name ||
      titleCaseSlug(id);
    const license = meta?.license ?? "";
    const author = meta?.author ?? "";

    const libraryMap = parseLibraryXml(path.join(setDir, "library.xml"));

    /** @type {Array<{ file: string, title: string, tags: string[] }>} */
    const icons = [];
    for (const file of files) {
      const fromLib = libraryMap.get(file);
      const title = fromLib?.title || displayTitleFromFile(file);
      const tags = fromLib?.tags ?? [];
      if (fromLib) libraryHits += 1;
      else libraryMisses += 1;

      icons.push({ file, title, tags });
      searchMin.push({
        id: `${id}/${file}`,
        set: id,
        t: title,
        tags,
      });
    }

    fs.writeFileSync(
      path.join(setsOutDir, `${id}.json`),
      JSON.stringify({ id, name, icons }),
    );

    sets.push({ id, name, count: icons.length, license, author });
    totalIcons += icons.length;
  }

  fs.writeFileSync(path.join(outRoot, "sets.json"), JSON.stringify(sets));
  fs.writeFileSync(
    path.join(outRoot, "search-min.json"),
    JSON.stringify(searchMin),
  );

  console.log(
    `Indexed ${sets.length} sets, ${totalIcons} icons → ${outRoot}`,
  );
  console.log(
    `library.xml titles: ${libraryHits} hit, ${libraryMisses} filename fallback`,
  );
}

main();
