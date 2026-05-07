import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { clearRuntimeAuthProfileStoreSnapshots } from "./runtime-snapshots.js";
import { hasAnyAuthProfileStoreSource } from "./source-check.js";

const tempDirs: string[] = [];

function makeTempAgentDir(prefix: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  clearRuntimeAuthProfileStoreSnapshots();
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("hasAnyAuthProfileStoreSource", () => {
  it("does not treat an empty auth-profiles.json store as an auth source", () => {
    const agentDir = makeTempAgentDir("openclaw-empty-auth-source-");
    fs.writeFileSync(
      path.join(agentDir, "auth-profiles.json"),
      `${JSON.stringify({ version: 1, profiles: {} }, null, 2)}\n`,
      "utf8",
    );

    expect(hasAnyAuthProfileStoreSource(agentDir)).toBe(false);
  });

  it("treats auth-profiles.json with at least one profile as an auth source", () => {
    const agentDir = makeTempAgentDir("openclaw-present-auth-source-");
    fs.writeFileSync(
      path.join(agentDir, "auth-profiles.json"),
      `${JSON.stringify(
        {
          version: 1,
          profiles: {
            "openai:default": {
              type: "api_key",
              provider: "openai",
              key: "sk-test",
            },
          },
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    expect(hasAnyAuthProfileStoreSource(agentDir)).toBe(true);
  });
});
