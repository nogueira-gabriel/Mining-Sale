"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
} | null>(null);

const Select = ({ value, onValueChange, children }: any) => {
  const [open, setOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, selectedLabel, setSelectedLabel }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) return null;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => context.setOpen(!context.open)}
      {...props}
    >
      <div className="flex-1 text-left truncate">
        {children}
      </div>
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
    </button>
  );
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: any) => {
  const context = React.useContext(SelectContext);
  return (
    <span className="block truncate">
      {context?.selectedLabel || placeholder}
    </span>
  );
}

const SelectContent = ({ children, className }: any) => {
  const context = React.useContext(SelectContext);
  if (!context?.open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={() => context.setOpen(false)}
      />
      <div className={cn("absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-card text-card-foreground shadow-lg outline-none", className)}>
        <div className="p-1">{children}</div>
      </div>
    </>
  )
}

const SelectItem = ({ children, value, ...props }: any) => {
  const context = React.useContext(SelectContext);
  const isSelected = context?.value === value;

  // Sync label on mount if selected
  React.useEffect(() => {
    if (context && isSelected) {
      context.setSelectedLabel(String(children));
    }
  }, [context, isSelected, children]);

  if (!context) return null;

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground"
      )}
      onClick={() => {
        context.onValueChange?.(value);
        context.setSelectedLabel(String(children));
        context.setOpen(false);
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span className="truncate">{children}</span>
    </div>
  )
}

const SelectGroup = ({ children }: any) => children;
const SelectLabel = ({ children }: any) => <div className="py-1.5 pl-8 pr-2 text-sm font-semibold">{children}</div>;
const SelectSeparator = () => <div className="-mx-1 my-1 h-px bg-muted" />;

export { 
  Select, 
  SelectGroup, 
  SelectValue, 
  SelectTrigger, 
  SelectContent, 
  SelectLabel, 
  SelectItem, 
  SelectSeparator
}
