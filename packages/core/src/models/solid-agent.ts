import type { ILoginInputOptions } from "@inrupt/solid-client-authn-node";
import { createUrl, toUrlString } from "../utils/url-helper";
import type { SolidApp } from "./solid-app";

export interface SolidAgentOptions {
  webId: string;
  storage: string;
  clientId: ILoginInputOptions["clientId"];
  clientSecret: ILoginInputOptions["clientSecret"];
  provider: SolidApp;
}

export class SolidAgent {
  public readonly webId: URL;
  public readonly storage: URL;
  public readonly clientId: ILoginInputOptions["clientId"];
  public readonly clientSecret: ILoginInputOptions["clientSecret"];
  public readonly provider: SolidApp;

  constructor(option: SolidAgentOptions) {
    this.webId = createUrl(option.webId);
    this.storage = createUrl(option.storage);
    this.clientId = option.clientId;
    this.clientSecret = option.clientSecret;
    this.provider = option.provider;
  }

  get oidcIssuer(): ILoginInputOptions["clientSecret"] {
    return toUrlString(this.provider.baseUrl);
  }
}
