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
