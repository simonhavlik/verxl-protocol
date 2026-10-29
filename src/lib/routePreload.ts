type Loader = () => Promise<unknown>;

const loaders: Record<string, Loader> = {
  chat: () => import("../components/Chat"),
  playground: () => import("../components/Playground"),
  registry: () => import("../components/Registry"),
  oracle: () => import("../components/Oracle"),
  governance: () => import("../components/Governance"),
  whitepaper: () => import("../components/Whitepaper"),
  about: () => import("../components/Vision"),
  console: () => import("../components/Console"),
  legal: () => import("../components/Legal"),
};

const pending = new Map<string, Promise<unknown>>();

export const preloadRoute = (tab: string): void => {
  const load = loaders[tab];
  if (!load || pending.has(tab)) return;
  pending.set(tab, load().catch(() => undefined));
};

export const preloadCoreRoutes = (): void => {
  ["playground", "chat", "about", "console"].forEach(preloadRoute);
};
