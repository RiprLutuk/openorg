const dangerousBlocks =
  /<(script|style|iframe|object|embed|form)[\s\S]*?<\/\1\s*>/gi;
const dangerousSingles =
  /<(script|style|iframe|object|embed|form)\b[^>]*\/?>/gi;
const eventHandlers = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const javascriptUrls = /(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi;

export function sanitizeHtml(value: string) {
  return value
    .replace(dangerousBlocks, "")
    .replace(dangerousSingles, "")
    .replace(eventHandlers, "")
    .replace(javascriptUrls, '$1="#"');
}
