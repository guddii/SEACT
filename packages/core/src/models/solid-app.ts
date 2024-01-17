import { createUrl } from "../utils/url-helper";

export interface SolidAppOptions {
  baseUrl: string;
  forwardingUrl: string;
  tokenUrl: string;
}

export class SolidApp {
  public readonly baseUrl: URL;
  public readonly forwardingUrl: URL;
  public readonly tokenUrl: URL;

  constructor(options: SolidAppOptions) {
    this.baseUrl = createUrl(options.baseUrl);
    this.forwardingUrl = createUrl(options.forwardingUrl);
    this.tokenUrl = createUrl(options.tokenUrl);
  }
}
