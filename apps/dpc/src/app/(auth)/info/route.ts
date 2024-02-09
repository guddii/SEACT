import { infoResponse } from "../../../utils/session-cookie.ts";
import { emptyResponse } from "../../../utils/empty-response";

export async function GET(): Promise<Response> {
  try {
    return infoResponse();
  } catch (error: unknown) {
    return emptyResponse();
  }
}
