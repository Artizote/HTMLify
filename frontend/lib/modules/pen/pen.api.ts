import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import { PenResponse } from "@/lib/modules/pen/pen.schema";
import { base64ToString, stringToBase64 } from "@/lib/modules/pen/pen.utils";

async function createPen(title: string) {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/pens`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );
  if (error || !response) {
    return { data: null, error: error || "Failed to create pen" };
  }
  return {
    data: (await response.json()) as PenResponse,
    error: null,
  };
}

interface UpdatePenParams {
  id: string;
  title: string;
  head_content: string;
  body_content: string;
  css_content: string;
  js_content: string;
}

async function updatePen(updatePenParams: UpdatePenParams) {
  const { id, ...rest } = updatePenParams;

  rest.body_content = stringToBase64(rest.body_content);
  rest.head_content = stringToBase64(rest.head_content);
  rest.css_content = stringToBase64(rest.css_content);
  rest.js_content = stringToBase64(rest.js_content);

  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/pens/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rest),
    },
  );
  if (error || !response) {
    return { data: null, error: error || "Failed to update pen" };
  }
  return {
    data: (await response.json()) as PenResponse,
    error: null,
  };
}

async function getPenById(id: string) {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/pens/${id}?show_content=true`,
  );
  if (error || !response) {
    return { data: null, error: error || "Failed to get pen" };
  }
  const data = (await response.json()) as PenResponse;

  data.head_content = base64ToString(data.head_content);
  data.body_content = base64ToString(data.body_content);
  data.css_content = base64ToString(data.css_content);
  data.js_content = base64ToString(data.js_content);

  return {
    data: data,
    error: null,
  };
}

async function getPens() {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/pens`,
  );
  if (error || !response) {
    return { data: null, error: error || "Failed to get pens" };
  }
  return {
    data: (await response.json()) as PenResponse[],
    error: null,
  };
}

async function deletePen(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/pens/${id}`,
    {
      method: "DELETE",
    },
  );
  if (error || !response) {
    return { success: false, error: error || "Failed to delete pen" };
  }
  if (response.status !== 204) {
    return { success: false, error: "Failed to delete pen" };
  }
  return {
    success: true,
    error: null,
  };
}

async function hitPen(id: string) {
  await APICall(`${env.NEXT_PUBLIC_BACKEND_API_URL}/internal/pen/hit?id=${id}`);
}

export { createPen, deletePen, getPenById, getPens, hitPen, updatePen };
