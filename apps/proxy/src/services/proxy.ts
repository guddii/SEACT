import type {
  ClientRequest,
  IncomingMessage,
  RequestListener,
  RequestOptions,
  ServerResponse,
} from "node:http";
import http from "node:http";
import { PROXY, log } from "core";

type BeforeForwardingCallback = (
  clientRequest: IncomingMessage,
) => Promise<void>;

type AfterForwardingCallback = (
  clientRequest: IncomingMessage,
  clientResponse: ServerResponse,
) => Promise<void>;

interface ProxyOptions {
  onBeforeForwarding?: BeforeForwardingCallback;
  onAfterForwarding?: AfterForwardingCallback;
}

export function proxy(options: ProxyOptions): RequestListener {
  return (clientRequest, clientResponse) => {
    const proxyRequestOptions: RequestOptions = {
      hostname: PROXY.forwardingUrl.hostname,
      port: PROXY.forwardingUrl.port,
      path: clientRequest.url,
      method: clientRequest.method,
      headers: {
        ...{
          "X-Forwarded-Host": PROXY.baseUrl.host,
          "X-Forwarded-Proto": PROXY.baseUrl.protocol.slice(0, -1),
        },
        ...clientRequest.headers,
      },
    };

    function onForwardedRequest(forwardedResponse: IncomingMessage): void {
      if (typeof forwardedResponse.statusCode === "number") {
        clientResponse.writeHead(
          forwardedResponse.statusCode,
          forwardedResponse.headers,
        );

        forwardedResponse.pipe(clientResponse, {
          end: true,
        });
      }
    }

    function onForwardedError(error: Error): void {
      clientResponse.writeHead(500, { "Content-Type": "text/plain" });
      clientResponse.write(`500 ${error.name}: ${error.message}`);
      clientResponse.end();
    }

    // Callback before forwarding the request
    if (options.onBeforeForwarding) {
      options.onBeforeForwarding(clientRequest).catch(log);
    }

    // Forwarding request
    const proxyRequest: ClientRequest = http
      .request(proxyRequestOptions, onForwardedRequest)
      .on("error", onForwardedError);

    // Callback after forwarding the request
    if (options.onAfterForwarding) {
      options.onAfterForwarding(clientRequest, clientResponse).catch(log);
    }

    clientRequest.pipe(proxyRequest, {
      end: true,
    });
  };
}
