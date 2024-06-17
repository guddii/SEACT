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
  openidConfigurationUrl: string;
  featureLogging: boolean;
  bypassToken: string;
}

export class SolidAppProxy extends SolidApp {
  public readonly forwardingUrl: URL;
  public readonly openidConfigurationUrl: URL;
  public readonly featureLogging: boolean;
  public readonly bypassToken: string;

  constructor(options: SolidAppProxyOptions) {
    super(options);
    this.forwardingUrl = createUrl(options.forwardingUrl);
    this.openidConfigurationUrl = createUrl(options.openidConfigurationUrl);
    this.featureLogging = options.featureLogging;
    this.bypassToken = options.bypassToken;
  }
}
