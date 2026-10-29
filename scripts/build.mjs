#!/usr/bin/env node
// `npm run build`: runs `next build` and, when ASTRAL_BUILD_WEBHOOK_ID and
// ASTRAL_WEBHOOK_SECRET are set, reports "building", then "success" or "failed"
// to the CMS (POST /api/<project>/webhooks/<id>/status, signed like a webhook).
// The admin shows the status and e-mails the people who look after the site
// when a build fails. Reads .env so a local build behaves like CI.

import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadDotEnv(path.join(root, ".env"));

const url = (process.env.ASTRAL_URL ?? "").replace(/\/+$/, "");
const project = process.env.ASTRAL_PROJECT ?? "";
const webhookId = process.env.ASTRAL_BUILD_WEBHOOK_ID ?? "";
const secret = process.env.ASTRAL_WEBHOOK_SECRET ?? "";
const siteUrl = process.env.SITE_URL ?? "";
const reports = Boolean(url && project && webhookId && secret);

await report("building");
const started = Date.now();
// The Next CLI runs with this same Node, without a shell (no .cmd shims on Windows).
const code = await run(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build"]);
const seconds = Math.round((Date.now() - started) / 1000);
if (code === 0) await report("success", `Build em ${seconds}s`);
else await report("failed", `next build saiu com código ${code} após ${seconds}s`);
process.exit(code);

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit" });
    child.on("exit", (exitCode) => resolve(exitCode ?? 1));
    child.on("error", () => resolve(1));
  });
}

async function report(status, message) {
  if (!reports) return;
  const body = JSON.stringify({ status, ...(message ? { message } : {}), ...(siteUrl && status === "success" ? { url: siteUrl } : {}) });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  try {
    const response = await fetch(`${url}/api/${project}/webhooks/${webhookId}/status`, { method: "POST", headers: { "content-type": "application/json", "x-cms-timestamp": timestamp, "x-cms-signature": signature }, body });
    if (!response.ok) console.warn(`[astral] build status ${status} not accepted: ${response.status}`);
  } catch (error) {
    console.warn(`[astral] build status ${status} not sent: ${error instanceof Error ? error.message : error}`);
  }
}

/** KEY=value lines; values already in the environment win. */
function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match || line.trim().startsWith("#")) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}
