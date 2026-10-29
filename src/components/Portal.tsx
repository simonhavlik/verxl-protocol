import React from "react";
import { createPortal } from "react-dom";

/** Render overlays at document.body so no transformed/clipped page container can bury them. */
export const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
};
