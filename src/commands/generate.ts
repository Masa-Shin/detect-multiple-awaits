import type { Arguments, Argv } from "yargs";
import { fileHandler } from "../handler";

type Options = {
  targetPathPattern: string;
};

export const command = "run [targetPathPattern]";
export const desc = "ファイル内からawaitを複数持つ関数を検出する";

export const builder = (yargs: Argv<Options>): Argv<Options> => {
  return yargs
    .positional("target-path-pattern", {
      type: "string",
      requiresArg: true,
      description:
        "Path to the target files. Can be set with glob pattern. eg: './**/*.ts'",
      default: "./**/*.ts",
    })
};

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { targetPathPattern } = argv;

  await fileHandler({
    targetPathPattern,
  });

  process.exit(0);
};
