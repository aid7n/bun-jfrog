import packageJson from "./package.json" with { type: "json" };

const version = packageJson.version;
const target = process.argv[2] as Bun.Build.CompileTarget | undefined;

await Bun.build({
  entrypoints: ["./src/index.ts"],
  target: "bun",
  compile: {
    target,
    outfile: `./dist/${target ? version + "-" + target.replace("bun-", "") + "/yarn" : "yarn"}`,
  },
}).then((result) => console.log(result));
