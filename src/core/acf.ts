import { basename, normalizePath } from "./path";
import type { AircraftAttachment, AircraftManifest, AttachmentRole } from "./types";

function unquote(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function roleFromProperties(properties: Map<string, string>): AttachmentRole {
  const joined = [...properties.entries()].map(([key, value]) => `${key} ${value}`).join(" ").toLowerCase();
  if (/cockpit/.test(joined) && /(?:^|\s)1(?:\s|$)/.test(joined)) return "cockpit";
  if (/glass/.test(joined) || /_lighting\s+2/.test(joined)) return "glass";
  if (/interior|inside|_lighting\s+1/.test(joined)) return "interior";
  if (/exterior|outside|_lighting\s+0/.test(joined)) return "exterior";
  return "unknown";
}

function firstVector(properties: Map<string, string>, patterns: RegExp[]): number[] | null {
  for (const [key, raw] of properties) {
    if (!patterns.some((pattern) => pattern.test(key))) continue;
    const values = raw.split(/\s+/).map(Number).filter(Number.isFinite);
    if (values.length >= 3) return values;
  }
  return null;
}

export function parseAcf(path: string, source: string): AircraftManifest {
  const records = new Map<number, Map<string, string>>();
  const warnings: string[] = [];

  for (const rawLine of source.replace(/^\uFEFF/, "").split(/\r\n?|\n/)) {
    const line = rawLine.trim();
    const match = line.match(/^(?:P\s+)?acf\/_obja\/(\d+)\/([^\s]+)\s*(.*)$/i);
    if (!match) continue;
    const index = Number(match[1]);
    const properties = records.get(index) ?? new Map<string, string>();
    properties.set(match[2].toLowerCase(), unquote(match[3]));
    records.set(index, properties);
  }

  const attachments: AircraftAttachment[] = [];
  for (const [index, properties] of [...records.entries()].sort(([a], [b]) => a - b)) {
    const pathEntry = [...properties.entries()].find(([key]) => /(?:obj_path|file|path)$/.test(key));
    if (!pathEntry || !/\.obj(?:\s|$)/i.test(pathEntry[1])) continue;

    const transform = firstVector(properties, [
      /_v10_att_file_stl$/,
      /_att_file_stl$/,
      /_position$/,
      /_xyz$/,
    ]);
    const position: [number, number, number] = transform
      ? [transform[0], transform[1], transform[2]]
      : [0, 0, 0];
    const rotation: [number, number, number] = transform && transform.length >= 6
      ? [transform[3], transform[4], transform[5]]
      : [0, 0, 0];

    attachments.push({
      index,
      path: normalizePath(pathEntry[1]),
      role: roleFromProperties(properties),
      position,
      rotation,
    });
  }

  if (records.size > 0 && attachments.length === 0) {
    warnings.push("The ACF contains object records, but their paths use an unrecognized Plane Maker field.");
  }

  return {
    acfPath: path,
    name: basename(path).replace(/\.acf$/i, ""),
    attachments,
    warnings,
  };
}
