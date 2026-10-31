export const isMobileDevice = (): boolean =>
  typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const getMetaMaskDappTarget = (): string => {
  if (typeof window === "undefined") return "verxl.com";
  const { host, pathname, search } = window.location;
  return `${host}${pathname}${search}`;
};

export const getMetaMaskDappUrl = (): string =>
  `https://metamask.app.link/dapp/${getMetaMaskDappTarget()}`;

/**
 * On a phone there is no injected provider in Safari/Chrome. Open the current
 * page inside MetaMask's in-app browser, where window.ethereum exists.
 * Returns true when navigation was started.
 */
export const openMetaMaskOnMobile = (): boolean => {
  if (typeof window === "undefined" || !isMobileDevice()) return false;
  const target = getMetaMaskDappTarget();
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isIOS) {
    // Custom scheme opens the installed MetaMask app directly. The universal
    // link alone is what falls through to the App Store on iOS.
    window.location.href = `metamask://dapp/${target}`;
    window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.location.href = getMetaMaskDappUrl();
      }
    }, 1600);
    return true;
  }
  window.location.assign(getMetaMaskDappUrl());
  return true;
};

/**
 * App mode (the installed PWA / Electron / Capacitor shell) has no browser
 * extension. MetaMask SDK provides the same EIP-1193 provider through its
 * QR/deeplink flow and injects it into window.ethereum for the rest of the app.
 */
export const isAppMode = (): boolean => {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("app") === "1") return true;
  try {
    return sessionStorage.getItem("vrxl_app_mode") === "1";
  } catch {
    return false;
  }
};

let sdkPromise: Promise<any> | null = null;
let sdkInstance: any = null;
let sdkProvider: any = null;

const withTimeout = <T>(promise: Promise<T>, ms: number, message: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      }
    );
  });

export async function resetMetaMaskSdk(): Promise<void> {
  try {
    await Promise.race([
      Promise.resolve(sdkInstance?.terminate?.()),
      new Promise((resolve) => window.setTimeout(resolve, 1500)),
    ]);
  } catch {}
  sdkInstance = null;
  sdkPromise = null;
  if (sdkProvider && typeof window !== "undefined" && (window as any).ethereum === sdkProvider) {
    try {
      delete (window as any).ethereum;
    } catch {}
  }
  sdkProvider = null;
}

const getMetaMaskSdk = (): Promise<any> => {
  if (!sdkPromise) {
    sdkPromise = import("@metamask/sdk")
      .then(async ({ MetaMaskSDK }) => {
        const sdk = new MetaMaskSDK({
          dappMetadata: {
            name: "Verxl",
            url: typeof window !== "undefined" ? window.location.origin : "https://verxl.com",
            iconUrl: typeof window !== "undefined" ? `${window.location.origin}/icon-512.png` : undefined,
          },
          injectProvider: true,
          forceInjectProvider: true,
          checkInstallationImmediately: false,
          useDeeplink: isMobileDevice(),
          preferDesktop: false,
          enableAnalytics: false,
        });
        await sdk.init();
        sdkInstance = sdk;
        return sdk;
      })
      .catch((err) => {
        sdkPromise = null;
        throw err;
      });
  }
  return sdkPromise;
};

/**
 * Connect MetaMask in a way that also works inside the installed shells.
 * Existing browser extensions are used first. In app mode without an
 * extension, MetaMask SDK opens its QR/deeplink flow and injects the provider.
 */
export async function connectMetaMask(): Promise<string[]> {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection is only available in a browser.");
  }

  const injected = (window as any).ethereum;
  const injectedIsStaleSdk = Boolean(sdkProvider && injected === sdkProvider);
  let injectedError: any = null;

  if (injected?.request && !injectedIsStaleSdk) {
    try {
      const accounts = await withTimeout(
        injected.request({ method: "eth_requestAccounts" }),
        12000,
        "MetaMask did not respond. Unlock MetaMask, then retry."
      );
      if (Array.isArray(accounts) && accounts.length > 0) return accounts;
    } catch (err: any) {
      // A user rejection is final; do not open a second wallet flow on top.
      if (err?.code === 4001) throw err;
      injectedError = err;
    }
  }

  const timedOut = Boolean(injectedError && /did not respond|timed out|timeout/i.test(String(injectedError.message || "")));

  if (isAppMode() || timedOut) {
    // A stale SDK provider can accept a request and never answer. Start a
    // fresh SDK session in app mode so the QR/deeplink appears again.
    if (isAppMode()) await resetMetaMaskSdk();
    const sdk = await getMetaMaskSdk();
    const accounts = await withTimeout(
      Promise.resolve(sdk.connect()),
      45000,
      "MetaMask did not complete the connection. Open MetaMask, approve Verxl, then retry."
    );
    const provider = sdk.getProvider();
    if (provider) {
      sdkProvider = provider;
      (window as any).ethereum = provider;
    }
    if (Array.isArray(accounts) && accounts.length > 0) return accounts;
    throw new Error("MetaMask did not return an account.");
  }

  if (isMobileDevice() && openMetaMaskOnMobile()) {
    throw new Error("Continue in MetaMask, then return to Verxl.");
  }

  if (injectedError) throw injectedError;
  throw new Error("MetaMask was not detected. Install it or open Verxl inside MetaMask.");
}

