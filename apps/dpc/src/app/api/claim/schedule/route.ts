import { randomBytes } from "node:crypto";
import { createUrl, getStorageFromForm } from "@seact/core";
import { errorResponse } from "../../../../utils/error-response.ts";
import { getSession, getWebId } from "../../../../utils/session-cookie";
import {
  createVerification,
  createVerificationAcl,
  scheduleClaim,
  updateRegistry,
} from "../../../../utils/claim.ts";

export async function PUT(req: Request): Promise<Response> {
  try {
    const storage = createUrl(await getStorageFromForm(req));
    const token = randomBytes(48).toString("hex");
    const session = await getSession();
    const webId = await getWebId(session);

    await createVerification(session, token, storage);
    await createVerificationAcl(webId, session, storage);

    const claim = await scheduleClaim(token, storage);
    await updateRegistry(webId, claim);

    return Response.json(
      { token },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
