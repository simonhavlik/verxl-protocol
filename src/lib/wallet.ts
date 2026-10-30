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
  if (injected?.request) {
    const accounts = await injected.request({ method: "eth_requestAccounts" });
    if (Array.isArray(accounts) && accounts.length > 0) return accounts;
  }

  if (isAppMode()) {
    const sdk = await getMetaMaskSdk();
    const accounts = (await sdk.connect()) || [];
    const provider = sdk.getProvider();
    if (provider) {
      (window as any).ethereum = provider;
    }
    if (accounts.length > 0) return accounts;
    throw new Error("MetaMask did not return an account.");
  }

  if (isMobileDevice() && openMetaMaskOnMobile()) {
    throw new Error("Continue in MetaMask, then return to Verxl.");
  }

  throw new Error("MetaMask was not detected. Install it or open Verxl inside MetaMask.");
}
