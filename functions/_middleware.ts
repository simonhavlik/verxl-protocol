import { setDbEnv } from "./api/lib/db";
import { setAuthEnv } from "./api/lib/auth";

export const onRequest: PagesFunction<{ HYPERDRIVE?: any }> = async (context) => {
  const url = new URL(context.request.url);
  if (url.hostname === "docs.verxl.com") {
    const target = new URL("https://verxl.com/docs/");
    if (url.pathname !== "/" && url.pathname !== "") target.hash = url.hash;
    return Response.redirect(target.toString(), 301);
  }

  setDbEnv(context.env);
  setAuthEnv(context.env);
  return await context.next();
};
