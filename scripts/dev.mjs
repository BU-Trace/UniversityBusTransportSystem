#!/usr/bin/env node
import concurrently from "concurrently";
import ora from "ora";
import chalk from "chalk";

const spinner = ora("Starting development servers...").start();

concurrently([
  { command: "npm --prefix server run dev", name: "server", prefixColor: "green" },
  { command: "npm --prefix client run dev", name: "client", prefixColor: "blue" }
])
  .then(() => spinner.succeed(chalk.green("✅ Dev servers running!")))
  .catch(() => spinner.fail(chalk.red("❌ Failed to start dev servers")));
