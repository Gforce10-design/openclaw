import fs from "node:fs";
import {
  resolveAuthStatePath,
  resolveAuthStorePath,
  resolveLegacyAuthStorePath,
} from "./path-resolve.js";
import { hasAnyRuntimeAuthProfileStoreSource } from "./runtime-snapshots.js";

function hasProfileEntries(pathname: string): boolean {
  if (!fs.existsSync(pathname)) {
    return false;
  }
  try {
    const raw = fs.readFileSync(pathname, "utf8");
    const parsed = JSON.parse(raw) as { profiles?: unknown };
    return Boolean(
      parsed.profiles &&
      typeof parsed.profiles === "object" &&
      !Array.isArray(parsed.profiles) &&
      Object.keys(parsed.profiles).length > 0,
    );
  } catch {
    return true;
  }
}

function hasStoredAuthProfileFiles(agentDir?: string): boolean {
  return (
    hasProfileEntries(resolveAuthStorePath(agentDir)) ||
    fs.existsSync(resolveAuthStatePath(agentDir)) ||
    fs.existsSync(resolveLegacyAuthStorePath(agentDir))
  );
}

export function hasEmptyAuthProfileStoreFile(agentDir?: string): boolean {
  const pathname = resolveAuthStorePath(agentDir);
  if (!fs.existsSync(pathname)) {
    return false;
  }
  try {
    const raw = fs.readFileSync(pathname, "utf8");
    const parsed = JSON.parse(raw) as { profiles?: unknown };
    return Boolean(
      parsed.profiles &&
      typeof parsed.profiles === "object" &&
      !Array.isArray(parsed.profiles) &&
      Object.keys(parsed.profiles).length === 0,
    );
  } catch {
    return false;
  }
}

export function hasAnyAuthProfileStoreSource(agentDir?: string): boolean {
  if (hasAnyRuntimeAuthProfileStoreSource(agentDir)) {
    return true;
  }
  if (hasStoredAuthProfileFiles(agentDir)) {
    return true;
  }

  const authPath = resolveAuthStorePath(agentDir);
  const mainAuthPath = resolveAuthStorePath();
  if (agentDir && authPath !== mainAuthPath && hasStoredAuthProfileFiles(undefined)) {
    return true;
  }
  return false;
}
