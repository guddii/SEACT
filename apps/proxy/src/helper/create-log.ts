import type { IncomingMessage, ServerResponse } from "node:http";
import { buildThing } from "@inrupt/solid-client";
import { HTTP, RDF } from "@inrupt/vocab-common-rdf";
import { updateUrl, DPC, createOrUpdateResource } from "@seact/core";
import { getAgentUserSession } from "../services/proxy-session";
import { findDpcContainer } from "./find-dpc-container";

export interface CreateLogOptions {
  req: IncomingMessage;
  res: ServerResponse;
}

export const createLog = async ({
  req,
  res,
}: CreateLogOptions): Promise<void> => {
  const session = await getAgentUserSession(DPC);
  if (!session.info.isLoggedIn) {
    return;
  }

  const dpcContainer = await findDpcContainer(req, session);
  if (!dpcContainer) {
    return;
  }

  const prefixes = {
    ...HTTP.PREFIX_AND_NAMESPACE,
    ...{ httpm: "http://www.w3.org/2011/http-methods#" },
  };

  const response = await createOrUpdateResource({
    resource: updateUrl("/responses", dpcContainer),
    session,
    callback: (thing) =>
      buildThing(thing)
        .addUrl(RDF.type, HTTP.Response)
        .addStringNoLocale(HTTP.httpVersion, req.httpVersion)
        .addStringNoLocale(HTTP.statusCodeValue, `${res.statusCode}`)
        .build(),
    prefixes,
  });

  const request = await createOrUpdateResource({
    resource: updateUrl("/requests", dpcContainer),
    session,
    callback: (thing) =>
      buildThing(thing)
        .addUrl(RDF.type, HTTP.Request)
        .addStringNoLocale(HTTP.absolutePath, req.url || "")
        .addStringNoLocale(HTTP.httpVersion, req.httpVersion)
        .addStringNoLocale(HTTP.methodName, req.method || "")
        .addUrl(HTTP.mthd, `http://www.w3.org/2011/http-methods#${req.method}`)
        .addUrl(HTTP.resp, response)
        .build(),
    prefixes,
  });

  const path = `/connections#${encodeURIComponent(
    req.headers.host || Date.now(),
  )}`;

  await createOrUpdateResource({
    resource: updateUrl(path, dpcContainer),
    session,
    callback: (thing) =>
      buildThing(thing)
        .addUrl(RDF.type, HTTP.Connection)
        .addStringNoLocale(HTTP.connectionAuthority, req.headers.host || "")
        .addUrl(HTTP.requests, request)
        .build(),
    prefixes,
  });
};
