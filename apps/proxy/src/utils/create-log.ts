import type * as http from "node:http";
import {
  AGENTS,
  updateUrl,
  createOrUpdateResource,
  createUrl,
  VOCAB,
  findClaimedData,
} from "@seact/core";
import { RDF } from "@inrupt/vocab-common-rdf";
import { buildThing } from "@inrupt/solid-client";
import type express from "express";
import {
  getAgentUserSession,
  ProxySession,
} from "../services/proxy-session.ts";
import type { AsyncMiddlewareFn } from "../services/async-middleware.ts";
import { parseJwt } from "./jwt-parser.ts";
import { registrationStore, type Registration } from "./registration-store.ts";
import type { OpenIDConfiguration } from "./oidc-discovery.ts";
import { oidcDiscovery } from "./oidc-discovery.ts";

const isRegistrationEndpoint = (
  req: http.IncomingMessage,
  oidcConfig: OpenIDConfiguration,
): boolean => {
  const registrationEndpointUrl = createUrl(oidcConfig.registration_endpoint);
  return req.url === registrationEndpointUrl.pathname && req.method === "POST";
};

export const createLogInterceptor = async (
  buffer: Buffer,
  _proxyRes: http.IncomingMessage,
  req: http.IncomingMessage,
): Promise<Buffer | string> => {
  if (ProxySession.isLoggableRequest(req, true)) {
    const oidcConfig = await oidcDiscovery();
    if (!oidcConfig) {
      return buffer;
    }

    if (isRegistrationEndpoint(req, oidcConfig)) {
      const response = buffer.toString("utf8");
      const data = JSON.parse(response) as Registration;
      registrationStore.set(data.client_id, data);

      return response;
    }
  }
  return buffer;
};

const getCRUD = (req: express.Request): string => {
  switch (req.method.toUpperCase()) {
    case "GET":
      return "READ";
    case "PATCH":
    case "PUT":
    case "POST":
      return "UPDATE";
    case "DELETE":
      return "DELETE";
    default:
      return "";
  }
};

export const createLog: AsyncMiddlewareFn = async (req, res, next) => {
  if (ProxySession.isLoggableRequest(req)) {
    let accessor = "";
    let application = "";

    if (req.headers.authorization) {
      const jwt = parseJwt(req.headers.authorization);
      if (jwt?.payload.client_id) {
        accessor = jwt.payload.webid ? jwt.payload.webid : "";
      }

      if (jwt?.payload.client_id) {
        const registration = registrationStore.get(jwt.payload.client_id);
        application = registration?.client_name ? registration.client_name : "";
      }
    }

    const session = await getAgentUserSession(AGENTS.DPC);
    if (!session.info.isLoggedIn) {
      next();
      return;
    }

    const claimedData = await findClaimedData(req, session);
    if (claimedData) {
      await createOrUpdateResource({
        resource: updateUrl("/accessLog", claimedData),
        session,
        callback: (thing) =>
          buildThing(thing)
            .addUrl(RDF.type, VOCAB.LOG.AccessLog)
            .addDatetime(VOCAB.LOG.date, new Date())
            .addStringNoLocale(VOCAB.LOG.accessor, accessor)
            .addStringNoLocale(VOCAB.LOG.application, application)
            .addStringNoLocale(VOCAB.LOG.action, getCRUD(req))
            .addStringNoLocale(VOCAB.LOG.resource, req.url || "")
            .build(),
      });
    }
  }

  next();
};
