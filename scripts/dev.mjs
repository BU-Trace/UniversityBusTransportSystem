#!/usr/bin/env node
import concurrently from "concurrently";
import ora from "ora";
import chalk from "chalk";

const spinner = ora("Starting development servers...").start();

(async () => {
  try {
    await concurrently([
      { command: "npm --prefix server run dev", name: "server", prefixColor: "green" },
      { command: "npm --prefix client run dev", name: "client", prefixColor: "blue" }
    ]);
    spinner.succeed(chalk.green("✅ Dev servers running!"));
  } catch (err) {
    spinner.fail(chalk.red("❌ Failed to start dev servers"));
    console.error(err);
    process.exit(1);
  }
})();
