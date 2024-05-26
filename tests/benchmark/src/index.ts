import console from "node:console";
import * as process from "node:process";
import type { Sequence } from "./generators/sequence";
import { generateProbabilisticCrudSequence } from "./generators/sequence";
import { toAsciidoc } from "./generators/adoc";
import { toTestPlan } from "./generators/testPlan";
import { runJmeter, runPrepareJmeter } from "./runner/jmeter";

function parseTP(tp: string): Sequence[] {
  return JSON.parse(tp) as Sequence[];
}

function getInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    let data = "";

    stdin.setEncoding("utf8");
    stdin.on("data", (chunk) => {
      data += String(chunk);
    });

    stdin.on("end", () => {
      resolve(data);
    });

    stdin.on("error", reject);
  });
}

function generate(argv: string[]): void {
  const arg = argv[3].toLocaleLowerCase();
  // eslint-disable-next-line @typescript-eslint/unbound-method -- cli app
  const log = console.log;
  switch (arg) {
    case "sequence": {
      log(JSON.stringify(generateProbabilisticCrudSequence(), null, 2));
      break;
    }
    case "adoc": {
      getInput().then(parseTP).then(toAsciidoc).then(log).catch(log);
      break;
    }
    case "testplan": {
      getInput().then(parseTP).then(toTestPlan).then(log).catch(log);
      break;
    }
  }
}

async function run(argv: string[]): Promise<void> {
  const arg = argv[3].toLocaleLowerCase();
  switch (arg) {
    case "prepare-jmeter": {
      await runPrepareJmeter();
      break;
    }
    case "jmeter": {
      await runJmeter();
      break;
    }
  }
}

async function main(argv: string[]): Promise<void> {
  const arg = argv[2].toLocaleLowerCase();
  switch (arg) {
    case "generate": {
      generate(argv);
      break;
    }
    case "run": {
      await run(argv);
      break;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/unbound-method -- cli app
main(process.argv).catch(console.log);
