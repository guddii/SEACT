import { randomBytes } from "node:crypto";
import {
  createUrl,
  getStorageFromForm,
  createVerification,
  createVerificationAcl,
  toUrlString,
  AGENTS,
} from "@seact/core";
import { errorResponse } from "../../../../utils/error-response.ts";
import { getSession, getWebId } from "../../../../utils/session-cookie";
import { updateRegistry } from "../../../../utils/claim.ts";

export async function PUT(req: Request): Promise<Response> {
  try {
    const storage = createUrl(await getStorageFromForm(req));
    const token = randomBytes(48).toString("hex");
    const session = await getSession();
    const webId = await getWebId(session);

    // Setup client storage
    const verification = await createVerification(session, token, storage);
    await createVerificationAcl(
      verification.internal_resourceInfo.sourceIri,
      toUrlString(AGENTS.DPC.webId),
      session,
    );

    // Setup dpc storage
    await updateRegistry(
      verification.internal_resourceInfo.sourceIri,
      webId,
      token,
      storage,
    );

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
