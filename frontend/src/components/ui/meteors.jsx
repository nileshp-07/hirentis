"use client";
import React, { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className
}) => {
  const [meteorStyles, setMeteorStyles] = useState([])

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      "--angle": angle + "deg",
      top: Math.random() * 50 + "%",
      left: Math.random() * 100 + "%",
      animationDelay: Math.random() * (maxDelay - minDelay) + minDelay + "s",
      animationDuration: Math.random() * (maxDuration - minDuration) + minDuration + "s",
    }));
    setMeteorStyles(styles);
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes force-meteor {
          0% { transform: rotate(var(--angle)) translateX(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: rotate(var(--angle)) translateX(-1000px); opacity: 0; }
        }
        .force-animate-meteor {
          animation: force-meteor var(--duration, 4s) linear infinite;
        }
      `}</style>
      
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          style={{ 
            ...style, 
            "--duration": style.animationDuration 
          }}
          className={cn(
            "force-animate-meteor pointer-events-none absolute h-1 w-1 rounded-full bg-primary/40 shadow-[0_0_15px_3px_var(--color-primary)] opacity-70 z-50",
            className
          )}>
          {/* Meteor Tail */}
          <div
            className="pointer-events-none absolute top-1/2 -z-10 h-[2px] w-[80px] -translate-y-1/2 bg-gradient-to-r from-primary/60 to-transparent" />
        </span>
      ))}
    </>
  );
}
