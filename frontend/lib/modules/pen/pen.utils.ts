function formatHtmlContent(
  title: string,
  html: string,
  head: string,
  css: string,
  js: string,
) {
  return `
<html>
  <head>
  <title>${title}</title>
  <style>
${css}
  </style>
${head}
  </head>
  <body>
${html}
    <script>
${js}
    </script>
  </body>
</html>
`.trim();
}

function stringToBase64(str: string) {
  return Buffer.from(str).toString("base64");
}
function base64ToString(base64: string) {
  return Buffer.from(base64, "base64").toString("utf-8");
}

export { base64ToString, formatHtmlContent, stringToBase64 };
