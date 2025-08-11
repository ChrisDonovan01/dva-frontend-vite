import * as React from "react";

const Badge = ({ className = "", variant = "default", ...props }) => {
  const baseStyles =
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none";
  const variants = {
    default: "bg-primary text-white",
    secondary: "bg-secondary text-primary",
    outline: "border text-muted-foreground",
  };
  return (
    <span className={`${baseStyles} ${variants[variant] || ""} ${className}`} {...props} />
  );
};

export { Badge };
