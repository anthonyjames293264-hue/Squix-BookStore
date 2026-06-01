"use client";

import { motion } from "framer-motion";

interface ScrollingMarqueeProps {
  items: string[];
  speed?: number;
  className?: string;
  separator?: string;
}

export function ScrollingMarquee({
  items,
  speed = 30,
  className,
  separator = "✦",
}: ScrollingMarqueeProps) {
  const content = items.join(` ${separator} `) + ` ${separator} `;

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className || ""}`}>
      <motion.div
        className="inline-block"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        <span className="inline-block pr-4">{content}</span>
        <span className="inline-block pr-4">{content}</span>
      </motion.div>
    </div>
  );
}
