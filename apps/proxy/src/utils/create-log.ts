import { AGENTS, updateUrl, createOrUpdateResource } from "@seact/core";
import { HTTP, RDF } from "@inrupt/vocab-common-rdf";
import { buildThing } from "@inrupt/solid-client";
import {
  getAgentUserSession,
  ProxySession,
} from "../services/proxy-session.ts";
import type { AsyncMiddlewareFn } from "../services/async-middleware.ts";
import { findDpcContainer } from "./find-dpc-container.ts";

export const createLog: AsyncMiddlewareFn = async (req, res) => {
  if (!ProxySession.isOwnRequest(req) && !ProxySession.isServerRequest(req)) {
    const session = await getAgentUserSession(AGENTS.DPC);
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
          .addUrl(
            HTTP.mthd,
            `http://www.w3.org/2011/http-methods#${req.method}`,
          )
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
  }
};
