#!/usr/bin/env node
import { execSync } from "child_process";
import ora from "ora";
import chalk from "chalk";

const spinner = ora("Formatting code...").start();

try {
  execSync("npm --prefix server run format", { stdio: "inherit" });
  execSync("npm --prefix client run format", { stdio: "inherit" });
  spinner.succeed(chalk.green("✅ Code formatted!"));
} catch {
  spinner.fail(chalk.red("❌ Format failed"));
  process.exit(1);
}
