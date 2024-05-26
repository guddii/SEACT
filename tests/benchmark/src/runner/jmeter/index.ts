import console from "node:console";
import * as process from "node:process";
import path from "node:path";
import fs from "node:fs/promises";
import type { GetAccessTokenResponse } from "../../utils/get-access-token.ts";
import { getAccessToken } from "../../utils/get-access-token.ts";
import { generateAgents } from "../../utils/generate-agents.ts";
import { updateSolidEco } from "../../utils/update-solid-eco.ts";
import { runJTL } from "./run-jtl.ts";

const storageParameters: ("N" | "C" | "B")[] = ["N", "B"];
const storageNumbers = [1, 10, 20, 30, 50, 80];
const shapeTreeNumbers = [1, 10, 20, 30, 50, 80];
const numberOfThreads = [1, 10, 20, 30, 50, 80];

export interface ForEachTestPlanOptions {
  file: string;
  ncb: "N" | "C" | "B";
  p: number;
  q: number;
  r: number;
}

async function getClients(): Promise<GetAccessTokenResponse[]> {
  return Promise.all(
    generateAgents("client", 100).map((client) => {
      const CLIENT_N = client.toUpperCase();
      return getAccessToken(
        client,
        process.env[`${CLIENT_N}_ID`],
        process.env[`${CLIENT_N}_SECRET`],
      );
    }),
  );
}

export async function runJmeter(): Promise<void> {
  const testFolder = path.join(process.cwd(), "./tests/benchmark/data/plans/");
  const files = await fs.readdir(testFolder);
  const clients = await getClients();

  async function forEachTestPlan(
    options: ForEachTestPlanOptions,
  ): Promise<void> {
    const runId = Date.now();

    const t = path.format({
      root: testFolder,
      name: options.file,
    });

    const parsedPath = path.parse(t);
    const testId = `${parsedPath.name}-${options.ncb}-${options.p}-${options.q}-${options.r}`;

    const l = path.format({
      root: path.join(parsedPath.dir, "../reports/"),
      name: testId,
      ext: "jtl",
    });

    console.log(`------------------------------------------------------------`);
    console.log(`Run ${testId}`);
    console.log(`------------------------------------------------------------`);

    await runJTL({
      runId,
      clients,
      t,
      l,
      ncb: options.ncb,
      r: options.r,
    });
  }

  for (const file of files) {
    for (const ncb of storageParameters) {
      for (const p of storageNumbers) {
        for (const q of shapeTreeNumbers) {
          for (const r of numberOfThreads) {
            await forEachTestPlan({ file, ncb, p, q, r });
          }
        }
      }
    }
  }
}

export async function runPrepareJmeter(): Promise<void> {
  const clients = await getClients();
  const dpc = await getAccessToken(
    "dpc",
    process.env.DPC_ID,
    process.env.DPC_SECRET,
  );

  await updateSolidEco({ storageNumbers, shapeTreeNumbers, clients, dpc });
}
