import console from "node:console";
import { spawn } from "node:child_process";
import * as process from "node:process";
import path from "node:path";
import fs from "node:fs/promises";

interface OidcToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface GetAccessTokenResponse extends OidcToken {
  name: string;
}

async function getAccessToken(
  name: string | undefined,
  id: string | undefined,
  secret: string | undefined,
): Promise<GetAccessTokenResponse> {
  if (!name || !id || !secret) {
    throw new Error("Credentials missing");
  }

  const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;

  const tokenUrl = "http://proxy.localhost:4000/.oidc/token";
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=webid",
  });

  const json = (await response.json()) as OidcToken;

  return { ...json, name };
}

interface RunEachJTLOptions {
  runId: number;
  t: string;
  l: string;
  clients: GetAccessTokenResponse[];
  r: number;
}

function runEachJTL(options: RunEachJTLOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const jmeterClientCredentialArgs = options.clients.map((client) => [
      `-J${client.name}AccessToken=${client.access_token}`,
      `-J${client.name}TokenType=${client.token_type}`,
      `-J${client.name}Name=${client.name}`,
    ]);

    const jmeterArgs = [
      `-Jthreads=${options.r}`,
      `-Jloops=1`,
      "-n",
      "-t",
      options.t,
      "-l",
      options.l,
      `-JrunId=${options.runId}`,
      ...jmeterClientCredentialArgs,
    ].flat();

    const jmeter = spawn("jmeter", jmeterArgs);

    jmeter.stdout.on("data", (data) => {
      console.log(`${data}`);
    });

    jmeter.on("close", (code) => {
      resolve();
      console.log(`child process close all stdio with code ${code}`);
    });

    jmeter.on("exit", (code) => {
      console.log(`child process exited with code ${code}`);
    });

    jmeter.on("error", (err) => {
      reject(err);
    });
  });
}

const generateAgents = (name: string, amountOfAgents = 1): string[] => {
  return Array.from({ length: amountOfAgents }, (_, index) => {
    const patchedIndex = index + 1;
    return `${name}${patchedIndex}`;
  });
};

export async function runJmeter(): Promise<void> {
  const testFolder = path.join(process.cwd(), "./tests/benchmark/data/plans/");
  const files = await fs.readdir(testFolder);

  const clients = await Promise.all(
    generateAgents("client", 100).map((client) => {
      const CLIENT_N = client.toUpperCase();
      return getAccessToken(
        client,
        process.env[`${CLIENT_N}_ID`],
        process.env[`${CLIENT_N}_SECRET`],
      );
    }),
  );

  interface ForEachTestPlanOptions {
    file: string;
    ncd: string;
    p: number;
    q: number;
    r: number;
  }

  async function forEachTestPlan(
    options: ForEachTestPlanOptions,
  ): Promise<void> {
    const runId = Date.now();

    const t = path.format({
      root: testFolder,
      name: options.file,
    });

    const parsedPath = path.parse(t);
    const testId = `${parsedPath.name}-${options.ncd}-${options.p}-${options.q}-${options.r}`;

    const l = path.format({
      root: path.join(parsedPath.dir, "../reports/"),
      name: testId,
      ext: "jtl",
    });

    console.log(`------------------------------------------------------------`);
    console.log(`Run ${testId}`);
    console.log(`------------------------------------------------------------`);

    await runEachJTL({
      runId,
      clients,
      t,
      l,
      r: options.r,
    });
  }

  const storageParameters = ["N"];
  const storageNumbers = [1, 20, 40, 60];
  const shapeTreeNumbers = [1, 20, 40, 60];
  const numberOfThreads = [1, 20, 40, 60];

  for (const file of files) {
    for (const ncd of storageParameters) {
      for (const p of storageNumbers) {
        for (const q of shapeTreeNumbers) {
          for (const r of numberOfThreads) {
            // eslint-disable-next-line no-await-in-loop -- Enforce sequential runs
            await forEachTestPlan({ file, ncd, p, q, r });
          }
        }
      }
    }
  }
}
