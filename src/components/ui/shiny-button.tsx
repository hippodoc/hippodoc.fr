"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        initial={{ "--x": "100%", scale: 0.8 } as any}
        animate={{ "--x": "-100%", scale: 1 } as any}
        whileTap={{ scale: 0.95 }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 1,
          type: "spring",
          stiffness: 20,
          damping: 15,
          mass: 2,
          scale: {
            type: "spring",
            stiffness: 200,
            damping: 5,
            mass: 0.5,
          },
        }}
        onClick={onClick}
        className={cn(
          "relative rounded-lg px-6 py-3.5 font-semibold text-lg backdrop-blur-xl transition-shadow duration-300 ease-in-out bg-gradient-to-r from-hippo-500 to-hippo-600 hover:from-hippo-600 hover:to-hippo-700 shadow-lg shadow-hippo-500/30 hover:shadow-xl hover:shadow-hippo-500/40",
          className
        )}
        type={props.type || "button"}
      >
        <span
          className="relative flex items-center justify-center size-full text-white leading-none"
          style={{
            maskImage:
              "linear-gradient(-75deg, white calc(var(--x) + 20%), transparent calc(var(--x) + 30%), white calc(var(--x) + 100%))",
          }}
        >
          {children}
        </span>
        <span
          style={{
            mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box, linear-gradient(rgb(0,0,0), rgb(0,0,0))",
            maskComposite: "exclude",
          }}
          className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,hsl(var(--hippo-400)/10%)_calc(var(--x)+20%),hsl(var(--hippo-200)/80%)_calc(var(--x)+25%),hsl(var(--hippo-400)/10%)_calc(var(--x)+100%))] p-px"
        ></span>
      </motion.button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";

export default ShinyButton;
