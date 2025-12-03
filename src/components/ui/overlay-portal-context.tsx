"use client";

import * as React from "react";

const OverlayPortalContext = React.createContext<HTMLElement | null>(null);

export const OverlayPortalProvider = OverlayPortalContext.Provider;

export function useOverlayPortalContainer() {
  return React.useContext(OverlayPortalContext);
}

