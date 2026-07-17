import { select } from "@inquirer/prompts";
import { JB } from "./jb";

const DEV_PROMPT = "--jbdev";

interface Handler {
  handler: () => void | Promise<void>;
  hidden?: boolean;
}

const jb = new JB();
const args = process.argv.slice(2);
const [yarnArg] = args;

const argHandlers: Record<string, Handler> = {
  [DEV_PROMPT]: {
    handler: devPrompt,
    hidden: true,
  },
  "--version": { handler: () => jb.InvokeVersionCmd() },
  info: { handler: () => jb.InvokeInfoCmd() },
  install: { handler: () => jb.InvokeBunInstall() },
  config: {
    handler: () => jb.InvokeConfigCmd(),
    hidden: yarnArg === DEV_PROMPT,
  },
  "config get": {
    handler: () => jb.InvokeConfigCmd("get"),
    hidden: yarnArg !== DEV_PROMPT,
  },
  "config set": {
    handler: () => jb.InvokeConfigCmd("set"),
    hidden: yarnArg !== DEV_PROMPT,
  },
};

const visibleArgs = Object.entries(argHandlers).filter(
  ([, { hidden }]) => !hidden,
);

async function invokeCmd(cmd: string): Promise<void> {
  try {
    const handler = argHandlers[cmd];
    if (!handler || (handler.hidden && yarnArg !== DEV_PROMPT)) {
      throw new Error(`unrecognized command: ${cmd}`);
    } else {
      await handler.handler();
    }
  } catch (err) {
    return jb.ExitWithError(`failed to invoke command "${cmd}": ${err}`);
  }
}

async function devPrompt(): Promise<void> {
  try {
    const selection = await select({
      message: "select a yarn command to intercept >",
      choices: visibleArgs.map(([arg]) => arg),
    });
    await invokeCmd(selection);
    process.stdout.write("\n\n");
    return devPrompt();
  } catch (err) {
    if (err instanceof Error && err.name === "ExitPromptError") {
      return jb.ExitWithError(`setup cancelled by user`);
    } else {
      return jb.ExitWithError(`failed to invoke dev prompt: ${err}`);
    }
  }
}

try {
  if (!yarnArg) {
    throw new Error(`no arg provided - please provide a valid arg to execute`);
  } else {
    if (yarnArg !== "--jbdev") await jb.CheckRegistry();
    await invokeCmd(yarnArg);
  }
} catch (err) {
  jb.ExitWithError(`failed to execute command: ${err}`);
}
