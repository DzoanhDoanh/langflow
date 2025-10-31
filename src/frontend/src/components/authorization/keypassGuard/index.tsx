import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CustomNavigate } from "@/customization/components/custom-navigate";

export const KeypassGuard = ({ children }) => {
  const [hasKeypass, setHasKeypass] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const keypass = localStorage.getItem("keypass");
    setHasKeypass(keypass === import.meta.env.VITE_KEYPASS);
  }, [location.pathname]);

  if (hasKeypass === null) {
    return null;
  }

  if (location.pathname.startsWith("/playground/") || location.pathname === "/404-not-found") {
    return children;
  }

  if (!hasKeypass) {
    return (
      <CustomNavigate
        replace
        to="/404-not-found"
      />
    );
  }

  return children;
};
