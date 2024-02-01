import type { SolidApp } from "@seact/core";
import { createUrl, updateUrl } from "@seact/core";

const REFERRER_QUERY_PARAM = "referrer";

export const forwardFromReferrer = (req: Request, app: SolidApp): Response => {
  const referrer = createUrl(req.url).searchParams.get(REFERRER_QUERY_PARAM);
  if (referrer) {
    const redirectUrl = updateUrl(referrer, app.baseUrl);
    return Response.redirect(redirectUrl);
  }

  return Response.redirect(app.baseUrl);
};

export const appendReferrer = (req: Request, app: SolidApp): URL => {
  const url = createUrl("/login/callback", app.baseUrl);
  const referrer = createUrl(req.url).searchParams.get(REFERRER_QUERY_PARAM);

  if (referrer) {
    url.searchParams.set(REFERRER_QUERY_PARAM, referrer);
  }

  return url;
};
