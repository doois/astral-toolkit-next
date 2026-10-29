// Draft preview. The editor's "Preview" button opens this address with a signed
// token (the project's preview URL is "<site>/preview?token={token}"). The token
// is traded for the draft at the CMS (no API key involved); then Next's draft
// mode is turned on, the token goes into a cookie and the editor lands on the
// entry's real URL, where the catch-all page renders the draft per request,
// never cached, with noindex and a banner. Draft mode ends with the browser
// session, or at /preview?exit=1.
import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { AstralError, AstralHttpError, pathOf } from "@/lib/astral";
import { cms } from "@/lib/cms";
import { PREVIEW_COOKIE } from "@/lib/preview";

const NO_STORE = { "cache-control": "private, no-store", "x-robots-tag": "noindex, nofollow" };

const page = (status: number, problem: string) =>
  new Response(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Preview</title></head><body style="font-family: system-ui; padding: 2rem"><h1>Pré-visualização indisponível</h1><p>${problem}</p></body></html>`,
    { status, headers: { ...NO_STORE, "content-type": "text/html; charset=utf-8" } },
  );

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const draft = await draftMode();
  if (params.get("exit")) {
    draft.disable();
    const response = NextResponse.redirect(new URL("/", request.url), { headers: NO_STORE });
    response.cookies.delete(PREVIEW_COOKIE);
    return response;
  }

  const token = params.get("token") ?? params.get("preview") ?? "";
  let entry;
  try {
    entry = await cms.preview(token);
  } catch (error) {
    const code = error instanceof AstralHttpError ? error.code : error instanceof AstralError ? error.message : "preview_failed";
    return page(401, `O link de pré-visualização é inválido ou expirou (<code>${code.replace(/[^\w.-]/g, "")}</code>). Abra de novo pelo botão Pré-visualizar no CMS.`);
  }
  const path = pathOf(entry.meta.url);
  if (!path) return page(404, "Este tipo de conteúdo não tem página própria no site.");

  draft.enable();
  const target = new URL(entry.meta.url!, request.url);
  const response = NextResponse.redirect(target.origin === request.nextUrl.origin ? new URL(path, request.url) : target, { status: 307, headers: NO_STORE });
  response.cookies.set(PREVIEW_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/" });
  return response;
}
