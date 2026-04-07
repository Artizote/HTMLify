export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "APIError";
  }
}

type ServerErrorBody = { detail?: string; message?: string; error?: string };

export async function parseServerError(
  response: { json: () => Promise<unknown> },
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as ServerErrorBody;
    return body.detail ?? body.message ?? body.error ?? fallback;
  } catch {
    return fallback;
  }
}
