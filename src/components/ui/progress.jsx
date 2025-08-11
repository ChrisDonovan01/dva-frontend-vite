import * as React from "react";

const Progress = ({ value, className = "", ...props }) => {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`} {...props}>
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export { Progress };
