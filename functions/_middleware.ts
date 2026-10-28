import { setDbEnv } from "./api/lib/db";
import { setAuthEnv } from "./api/lib/auth";

export const onRequest: PagesFunction<{ HYPERDRIVE?: any }> = async (context) => {
  setDbEnv(context.env);
  setAuthEnv(context.env);
  return await context.next();
};
