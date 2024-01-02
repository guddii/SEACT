import type {
  ClientRequest,
  IncomingMessage,
  RequestListener,
  RequestOptions,
} from "node:http";
import http from "node:http";

interface ProxyOptions {
  hostname?: string;
  port?: number;
}

export function proxy(options: ProxyOptions): RequestListener {
  return (clientRequest, clientResponse) => {
    const proxyRequestOptions: RequestOptions = {
      hostname: options.hostname || "localhost",
      port: options.port || 3000,
      path: clientRequest.url,
      method: clientRequest.method,
      headers: {
        ...{
          "X-Forwarded-Host": "localhost:4000",
          "X-Forwarded-Proto": "http",
        },
        ...clientRequest.headers,
      },
    };

    function onForwardedRequest(forwardedResponse: IncomingMessage): void {
      if (typeof forwardedResponse.statusCode === "number") {
        clientResponse.writeHead(
          forwardedResponse.statusCode,
          forwardedResponse.headers
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

    const proxyRequest: ClientRequest = http
      .request(proxyRequestOptions, onForwardedRequest)
      .on("error", onForwardedError);

    clientRequest.pipe(proxyRequest, {
      end: true,
    });
  };
}
