import { APPS, createUrl, toUrlString } from "@seact/core";
import { errorResponse } from "../../../utils/error-response.ts";
import { setSessionCookie } from "../../../utils/session-cookie";
import { appendReferrer } from "../../../utils/referrer.ts";

export async function GET(req: Request): Promise<Response> {
  try {
    const session = await setSessionCookie();
    const callbackUrl = createUrl("/login/callback", APPS.DPC.baseUrl);
    let url = toUrlString(appendReferrer(req, callbackUrl));

    await session.login({
      redirectUrl: url,
      oidcIssuer: toUrlString(APPS.PROXY.baseUrl),
      clientName: "Data Privacy Cockpit App",
      handleRedirect: (redirectUrl: string): void => {
        url = redirectUrl;
      },
    });

    return Response.redirect(url);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
