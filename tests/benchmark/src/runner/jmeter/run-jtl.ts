import process from "node:process";
import { spawn } from "node:child_process";
import console from "node:console";
import type { GetAccessTokenResponse } from "../../utils/get-access-token.ts";

interface RunJTLOptions {
  runId: number;
  t: string;
  l: string;
  clients: GetAccessTokenResponse[];
  ncb: "N" | "C" | "B";
  p: number;
  r: number;
}

export function runJTL(options: RunJTLOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const jmeterClientCredentialArgs = options.clients.map((client) => [
      `-J${client.name}AccessToken=${client.access_token}`,
      `-J${client.name}TokenType=${client.token_type}`,
      `-J${client.name}Name=${client.name}`,
    ]);

    jmeterClientCredentialArgs.push([
      `-JactiveClientAccessToken=${options.clients[options.p - 1].access_token}`,
      `-JactiveClientTokenType=${options.clients[options.p - 1].token_type}`,
      `-JactiveClientName=${options.clients[options.p - 1].name}`,
    ]);

    const bypassArgs = [];
    if (options.ncb.includes("B")) {
      bypassArgs.push(`-JproxyBypassToken=${process.env.PROXY_BYPASS_TOKEN}`);
    }

    const jmeterArgs = [
      `-Jthreads=${options.r}`,
      `-Jloops=10`,
      "-n",
      "-t",
      options.t,
      "-l",
      options.l,
      `-JrunId=${options.runId}`,
      ...bypassArgs,
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
