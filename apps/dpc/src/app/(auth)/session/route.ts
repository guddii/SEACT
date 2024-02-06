import { getSession } from "../../../utils/session-cookie.ts";

export async function GET(): Promise<Response> {
  try {
    const session = await getSession();

    return Response.json(session.info);
  } catch (error: unknown) {
    return Response.json({});
  }
}
