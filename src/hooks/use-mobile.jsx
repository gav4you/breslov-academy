import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useIsNative() {
  const [isNative, setIsNative] = React.useState(false);

  React.useEffect(() => {
    // Check for Capacitor or other native bridge markers
    const isCapacitor = window.Capacitor?.isNative;
    setIsNative(!!isCapacitor);
  }, []);

  return isNative;
}