import { env } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      return response;
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Signup route error:", error);
    return new Response(JSON.stringify({ detail: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
