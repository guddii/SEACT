import { APPS } from "@seact/core";
import { getSession } from "../../../utils/session-cookie.ts";
import { forwardFromReferrer } from "../../../utils/referrer.ts";
import { emptyResponse } from "../../../utils/empty-response";

export async function GET(req: Request): Promise<Response> {
  try {
    const session = await getSession();
    await session.logout();

    return forwardFromReferrer(req, APPS.DPC);
  } catch (error: unknown) {
    return emptyResponse();
  }
}
