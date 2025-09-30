
import { execSync } from "child_process";
import ora from "ora";
import chalk from "chalk";

const spinner = ora("Running lint...").start();

try {
  execSync("npm --prefix server run lint", { stdio: "inherit" });
  execSync("npm --prefix client run lint", { stdio: "inherit" });
  spinner.succeed(chalk.green("✅ Lint passed!"));
} catch {
  spinner.fail(chalk.red("❌ Lint errors found"));
  process.exit(1);
}
