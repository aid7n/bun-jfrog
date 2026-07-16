import path from "node:path";
import { targetMap } from "./src/jb";

const requestedTarget = process.argv[2];

const target = targetMap[requestedTarget as keyof typeof targetMap];
if (!target) {
  console.warn(
    `unrecognized target: ${requestedTarget} - will fall back to default detected os target`,
  );
}

await Bun.build({
  entrypoints: ["./src/main.ts"],
  target: "bun",
  minify: true,
  compile: {
    target,
    outfile: target
      ? path.resolve("..", requestedTarget!, "bin", "jb-yarn")
      : "./bin/jb-yarn",
  },
}).then((result) => console.log(result));
