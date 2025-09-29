#!/usr/bin/env node
import { execSync } from "node:child_process";
import process from "node:process";
import fs from "node:fs";
import ora from "ora";
import chalk from "chalk";

const spinner = ora("Bootstrapping UBTS monorepo...").start();

const run = (cmd) => {
  spinner.text = `Running: ${cmd}`;
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    spinner.fail(chalk.red(`Command failed: ${cmd}`));
    process.exit(1);
  }
};

// Check Node version
const major = parseInt(process.versions.node.split(".")[0], 10);
if (major < 20) {
  spinner.fail(chalk.red(`Node 20+ required. You have ${process.version}`));
  process.exit(1);
}

// Ensure scripts are executable
try {
  fs.chmodSync("./scripts/bootstrap.mjs", 0o755);
} catch {}

// Enable corepack
try { run("corepack enable"); } catch {}

// Install dependencies
run("npm install");

spinner.succeed(chalk.green("✅ Bootstrap complete!"));
console.log(chalk.blue(`
Use these commands:
 - ${chalk.yellow("npm run dev")} : start dev servers
 - ${chalk.yellow("npm run lint")} : lint both server & client
 - ${chalk.yellow("npm run typecheck")} : run typechecks
 - ${chalk.yellow("npm run build")} : build server & client
 - ${chalk.yellow("npm run format")} : format code
`));
