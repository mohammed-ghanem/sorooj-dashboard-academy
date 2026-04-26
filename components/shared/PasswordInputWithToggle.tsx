"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PasswordInputWithToggleProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  inputClassName?: string;
  autoComplete?: string;
  placeholder?: string;
  "aria-label"?: string;
};

export default function PasswordInputWithToggle({
  value,
  onChange,
  id: idProp,
  className,
  inputClassName,
  autoComplete = "new-password",
  placeholder,
  "aria-label": ariaLabel,
}: PasswordInputWithToggleProps) {
  const [show, setShow] = useState(false);
  const genId = useId();
  const id = idProp ?? genId;
  const toggleId = `${id}-toggle`;

  return (
    <div className={cn("relative", className)}>
      <KeyRound
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "h-10 border-[#999] pl-10 pr-10 focus-visible:ring-0",
          inputClassName
        )}
      />
      <Button
        type="button"
        id={toggleId}
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setShow((s) => !s)}
        aria-pressed={show}
        aria-controls={id}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
