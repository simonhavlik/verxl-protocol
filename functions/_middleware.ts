import { setDbEnv } from "./api/lib/db";

export const onRequest: PagesFunction<{ HYPERDRIVE?: any }> = async (context) => {
  setDbEnv(context.env);
  return await context.next();
};
