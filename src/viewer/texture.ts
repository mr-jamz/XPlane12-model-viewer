import * as THREE from "three";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader.js";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader.js";
import { resolveRelative, withoutExtension } from "../core/path";

function findFile(fileMap: Map<string, File>, ownerPath: string, reference?: string): { path: string; file: File } | null {
  if (!reference || reference.toLowerCase() === "none") return null;
  const resolved = resolveRelative(ownerPath, reference);
  const candidates = [
    resolved,
    `${withoutExtension(resolved)}.png`,
    `${withoutExtension(resolved)}.dds`,
    `${withoutExtension(resolved)}.tga`,
    `${withoutExtension(resolved)}.jpg`,
  ];
  for (const candidate of candidates) {
    const file = fileMap.get(candidate.toLowerCase());
    if (file) return { path: candidate, file };
  }
  return null;
}

export async function loadTexture(
  fileMap: Map<string, File>,
  ownerPath: string,
  reference?: string,
  color = false,
): Promise<THREE.Texture | null> {
  const source = findFile(fileMap, ownerPath, reference);
  if (!source) return null;
  const url = URL.createObjectURL(source.file);
  const extension = source.path.split(".").pop()?.toLowerCase();
  try {
    const texture = extension === "dds"
      ? await new DDSLoader().loadAsync(url)
      : extension === "tga"
        ? await new TGALoader().loadAsync(url)
        : await new THREE.TextureLoader().loadAsync(url);
    texture.flipY = false;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    if (color) texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
