import { createUrl } from "../utils/url-helper";

export interface SolidAppOptions {
  baseUrl: string;
}

export class SolidApp {
  public readonly baseUrl: URL;

  constructor(options: SolidAppOptions) {
    this.baseUrl = createUrl(options.baseUrl);
  }
}

export interface SolidAppProxyOptions extends SolidAppOptions {
  forwardingUrl: string;
  tokenUrl: string;
}

export class SolidAppProxy extends SolidApp {
  public readonly forwardingUrl: URL;
  public readonly tokenUrl: URL;

  constructor(options: SolidAppProxyOptions) {
    super(options);
    this.forwardingUrl = createUrl(options.forwardingUrl);
    this.tokenUrl = createUrl(options.tokenUrl);
  }
}

export interface SolidAppDPCOptions extends SolidAppOptions {
  forwardingUrl: string;
  tokenUrl: string;
}
