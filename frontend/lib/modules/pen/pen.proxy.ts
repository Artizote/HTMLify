import { NextResponse } from "next/server";

import { getPenById, hitPen } from "@/lib/modules/pen/pen.api";
import { formatHtmlContent } from "@/lib/modules/pen/pen.utils";

const serverPenContent = async (id: string) => {
  const { data, error } = await getPenById(id);
  if (error || !data) {
    return null;
  }
  const html = formatHtmlContent(
    data.body_content,
    data.head_content,
    data.css_content,
    data.js_content,
  );
  void hitPen(id);
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};

// TODO: src, raw and render mode path-modefier

export { serverPenContent };
