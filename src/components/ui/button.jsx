import * as React from "react";

const Button = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant] || ""} ${className}`}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
