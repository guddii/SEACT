import { APPS, updateUrl, toUrlString } from "@seact/core";
import { getSession } from "../../../../utils/session-cookie.ts";
import { errorResponse } from "../../../../utils/error-response.ts";
import { forwardFromReferrer } from "../../../../utils/referrer.ts";

export async function GET(req: Request): Promise<Response> {
  try {
    const session = await getSession();
    const callbackUrl = updateUrl(req.url, APPS.DPC.baseUrl);
    await session.handleIncomingRedirect(toUrlString(callbackUrl));

    return forwardFromReferrer(req, APPS.DPC);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
