import * as React from "react";

const Tabs = ({ defaultValue, children, className = "" }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (child.type.displayName === "TabsList") {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        if (child.props.value === activeTab) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab }) => (
  <div className="inline-flex gap-1 rounded-md bg-muted p-1">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

const TabsTrigger = ({ value, activeTab, setActiveTab, children }) => {
  const isActive = value === activeTab;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        isActive
          ? "bg-white text-primary shadow"
          : "text-muted-foreground hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children }) => <div className="mt-4">{children}</div>;

Tabs.displayName = "Tabs";
TabsList.displayName = "TabsList";
TabsTrigger.displayName = "TabsTrigger";
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
