export class NetworkError extends Error {
  status: Response["status"] = 500;
  statusText: Response["statusText"] = "";
  url: Response["url"] = "";

  constructor(response: Response) {
    super(response.statusText);
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
  }
}
