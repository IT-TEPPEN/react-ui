import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect in the browser (to measure before painting), useEffect on
 * the server, where React 18 warns about useLayoutEffect and there is
 * nothing to measure.
 */
export const useBrowserLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
