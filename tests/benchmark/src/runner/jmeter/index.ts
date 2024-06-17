import console from "node:console";
import * as process from "node:process";
import path from "node:path";
import fs from "node:fs/promises";
import {
  buildThing,
  getSolidDataset,
  getThing,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { AGENTS, VOCAB, toUrlString, updateUrl } from "@seact/core";
import type { WithResourceInfo } from "@inrupt/solid-client/src/interfaces.ts";
import type { GetAccessTokenResponse } from "../../utils/get-access-token.ts";
import { getAccessToken } from "../../utils/get-access-token.ts";
import { generateAgents } from "../../utils/generate-agents.ts";
import { updateSolidEco } from "../../utils/update-solid-eco.ts";
import { createPseudoSession } from "../../utils/create-pseudo-session.ts";
import { sleep } from "../../utils/sleep.ts";
import { runJTL } from "./run-jtl.ts";

const storageParameters: ("N" | "C" | "B")[] = ["B", "N", "C"];
const storageNumbers = [1, 10, 30];
const shapeTreeNumbers = [1, 10, 30];
const numberOfThreads = [1, 10, 30];

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

interface SwapRegistrySetOptions {
  dpcSession: { fetch: typeof fetch };
  path: string;
}

async function swapRegistrySet(
  options: SwapRegistrySetOptions,
): Promise<WithResourceInfo> {
  const socialAgentUrl = updateUrl("/profile/card#id", AGENTS.DPC.storage);
  const registriesUrl = updateUrl(options.path, AGENTS.DPC.storage);

  let dataset = await getSolidDataset(
    toUrlString(socialAgentUrl),
    options.dpcSession,
  );

  let socialAgentThing = getThing(dataset, toUrlString(socialAgentUrl));

  if (socialAgentThing) {
    socialAgentThing = buildThing(socialAgentThing)
      .removeAll(VOCAB.INTEROP.hasRegistrySet)
      .addUrl(VOCAB.INTEROP.hasRegistrySet, toUrlString(registriesUrl))
      .build();

    dataset = setThing(dataset, socialAgentThing);
  }

  return saveSolidDatasetAt(
    toUrlString(socialAgentUrl),
    dataset,
    options.dpcSession,
  );
}

export async function runJmeter(): Promise<void> {
  const testFolder = path.join(process.cwd(), "./tests/benchmark/data/plans/");
  const testFiles = await fs.readdir(testFolder);
  const reportFolder = path.join(
    process.cwd(),
    "./tests/benchmark/data/reports/",
  );
  const reportFiles = await fs.readdir(reportFolder);
  const clients = await getClients();

  const dpc = await getAccessToken(
    "dpc",
    process.env.DPC_ID,
    process.env.DPC_SECRET,
  );
  const dpcSession = createPseudoSession(dpc);

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

    if (reportFiles.includes(`${testId}.jtl`)) {
      console.log(
        `------------------------------------------------------------`,
      );
      console.log(`Skipped ${testId}`);
      console.log(
        `------------------------------------------------------------`,
      );
      return;
    }

    console.log(`------------------------------------------------------------`);
    console.log(`Run ${testId}`);
    console.log(`------------------------------------------------------------`);

    await runJTL({
      runId,
      clients,
      t,
      l,
      ncb: options.ncb,
      p: options.p,
      r: options.r,
    });
  }

  for (const file of testFiles) {
    for (const ncb of storageParameters) {
      for (const p of storageNumbers) {
        for (const q of shapeTreeNumbers) {
          for (const r of numberOfThreads) {
            if (ncb.includes("C")) {
              await swapRegistrySet({
                dpcSession,
                path: `/registries-${p}-${q}`,
              });
            }
            await sleep();
            await forEachTestPlan({ file, ncb, p, q, r });
            await swapRegistrySet({ dpcSession, path: `/registries` });
            await sleep();
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
