import { getWebId } from "../../../../utils/session-cookie.ts";
import { getClaimedResource } from "../../../../utils/claim.ts";
import { emptyResponse } from "../../../../utils/empty-response.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const webId = await getWebId();
    const pathname = new URL(request.url).pathname.replace("/api/data/", "/");

    return await getClaimedResource(webId, pathname);
  } catch (error: unknown) {
    return emptyResponse("text/turtle");
  }
}
