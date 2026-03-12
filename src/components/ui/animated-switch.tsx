"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type AnimatedSwitchOption = {
  label: string;
  value: string;
};

type AnimatedSwitchProps = {
  ariaLabel: string;
  options: [AnimatedSwitchOption, AnimatedSwitchOption];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  optionClassName?: string;
  indicatorClassName?: string;
};

export default function AnimatedSwitch({
  ariaLabel,
  options,
  value,
  onChange,
  className,
  optionClassName,
  indicatorClassName,
}: AnimatedSwitchProps) {
  const activeIndex = options.findIndex((option) => option.value === value);
  const resolvedIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "relative grid h-[44px] w-[152px] grid-cols-2 items-center rounded-full bg-[#1a3b5c] p-1 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]",
        className,
      )}
    >
      <motion.span
        aria-hidden="true"
        className={cn(
          "absolute top-1 h-[36px] w-[calc(50%-4px)] rounded-full bg-white shadow-[0_4px_12px_rgba(8,26,48,0.2)]",
          indicatorClassName,
        )}
        initial={false}
        animate={{
          left: resolvedIndex === 0 ? "4px" : "calc(50% + 0px)",
        }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      />

      {options.map((option, index) => {
        const checked = index === resolvedIndex;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex h-full items-center justify-center rounded-full text-[16px] font-bold uppercase leading-none tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a3b5c]",
              checked ? "text-[#1a3b5c]" : "text-white/80 hover:text-white",
              optionClassName,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
