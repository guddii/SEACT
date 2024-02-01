import type { ClientRequest, IncomingMessage, RequestOptions } from "node:http";
import http from "node:http";
import { APPS, log } from "@seact/core";
import type { Response, Request } from "express";

type BeforeForwardingCallback = (
  clientRequest: IncomingMessage,
) => Promise<void>;

type AfterForwardingCallback = (
  clientRequest: Request,
  clientResponse: Response,
) => Promise<void>;

interface ProxyOptions {
  onBeforeForwarding?: BeforeForwardingCallback;
  onAfterForwarding?: AfterForwardingCallback;
}

export function proxy(options: ProxyOptions) {
  return (clientRequest: Request, clientResponse: Response) => {
    const proxyRequestOptions: RequestOptions = {
      hostname: APPS.PROXY.forwardingUrl.hostname,
      port: APPS.PROXY.forwardingUrl.port,
      path: clientRequest.url,
      method: clientRequest.method,
      headers: {
        ...{
          "X-Forwarded-Host": APPS.PROXY.baseUrl.host,
          "X-Forwarded-Proto": APPS.PROXY.baseUrl.protocol.slice(0, -1),
        },
        ...clientRequest.headers,
      },
    };

    function onForwardedRequest(forwardedResponse: IncomingMessage): void {
      if (typeof forwardedResponse.statusCode === "number") {
        // Callback before forwarding the request
        if (options.onBeforeForwarding) {
          options.onBeforeForwarding(clientRequest).catch(log);
        }

        clientResponse.writeHead(
          forwardedResponse.statusCode,
          forwardedResponse.headers,
        );

        forwardedResponse.pipe(clientResponse, {
          end: true,
        });

        // Callback after forwarding the request
        if (options.onAfterForwarding) {
          options.onAfterForwarding(clientRequest, clientResponse).catch(log);
        }
      }
    }

    function onForwardedError(error: Error): void {
      clientResponse.writeHead(500, { "Content-Type": "text/plain" });
      clientResponse.write(`500 ${error.name}: ${error.message}`);
      clientResponse.end();
    }

    // Forwarding request
    const proxyRequest: ClientRequest = http
      .request(proxyRequestOptions, onForwardedRequest)
      .on("error", onForwardedError);

    clientRequest.pipe(proxyRequest, {
      end: true,
    });
  };
}
