#!/usr/bin/env node
import ora from "ora";
import chalk from "chalk";
import { execSync } from "child_process";

const spinner = ora("Building server & client...").start();

process.env.NEXT_FONT_DOWNLOAD_DISABLED ??= "1";

try {
  execSync("npm --prefix server run build", { stdio: "inherit" });
  execSync("npm --prefix client run build", { stdio: "inherit" });
  spinner.succeed(chalk.green("✅ Build completed!"));
} catch (err) {
  spinner.fail(chalk.red("❌ Build failed"));
  process.exit(1);
}
