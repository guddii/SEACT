import type { IncomingMessage, ServerResponse } from "node:http";
import { buildThing } from "@inrupt/solid-client";
import { HTTP, RDF } from "@inrupt/vocab-common-rdf";
import { findDpcContainer } from "./find-dpc-container";
import { createOrUpdateRessource } from "./create-or-update-ressource";

export interface CreateLogOptions {
  req: IncomingMessage;
  res: ServerResponse;
}

export const createLog = async ({
  req,
  res,
}: CreateLogOptions): Promise<void> => {
  const dpcContainer = findDpcContainer(req);
  if (!dpcContainer) {
    return;
  }

  const response = await createOrUpdateRessource({
    ressource: `${dpcContainer}/responses`,
    callback: (thing) =>
      buildThing(thing)
        .addUrl(RDF.type, HTTP.Response)
        .addStringNoLocale(HTTP.httpVersion, req.httpVersion)
        .addStringNoLocale(HTTP.statusCodeValue, `${res.statusCode}`)
        .build(),
  });

  const request = await createOrUpdateRessource({
    ressource: `${dpcContainer}/requests`,
    callback: (thing) =>
      buildThing(thing)
        .addUrl(RDF.type, HTTP.Request)
        .addStringNoLocale(HTTP.absolutePath, req.url || "")
        .addStringNoLocale(HTTP.httpVersion, req.httpVersion)
        .addStringNoLocale(HTTP.methodName, req.method || "")
        .addUrl(HTTP.mthd, `http://www.w3.org/2011/http-methods#${req.method}`)
        .addUrl(HTTP.resp, response)
        .build(),
  });

  await createOrUpdateRessource({
    ressource: `${dpcContainer}/connections#${encodeURIComponent(
      req.headers.host || Date.now(),
    )}`,
    callback: (thing) =>
      buildThing(thing)
        .addUrl(RDF.type, HTTP.Connection)
        .addStringNoLocale(HTTP.connectionAuthority, req.headers.host || "")
        .addUrl(HTTP.requests, request)
        .build(),
  });
};
