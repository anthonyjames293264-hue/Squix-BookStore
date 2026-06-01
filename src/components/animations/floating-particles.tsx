"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface FloatingItem {
  id: number;
  emoji: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

const EMOJIS = ["🌰", "🥜", "🍂", "🍁", "🌿", "✨", "🐾"];

export function FloatingParticles({
  count = 6,
  speed = 1,
}: {
  count?: number;
  speed?: number;
}) {
  const [items, setItems] = useState<FloatingItem[]>([]);

  const generateItems = useCallback(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 100,
      size: 14 + Math.random() * 12,
      duration: (20 + Math.random() * 15) / speed,
      delay: Math.random() * 10,
    }));
  }, [count, speed]);

  useEffect(() => {
    setItems(generateItems());
  }, [generateItems]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item) => {
        // Subtle random horizontal sway distance
        const sway = 3 + (item.id % 4); 
        return (
          <motion.div
            key={item.id}
            initial={{
              opacity: 0,
              y: "115%",
              x: `${item.x}vw`,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 0.35, 0.35, 0],
              y: ["115%", "-15%"],
              x: [
                `${item.x}vw`,
                `${item.x + sway}vw`,
                `${item.x - sway}vw`,
                `${item.x}vw`,
              ],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute"
            style={{ fontSize: item.size, willChange: "transform" }}
          >
            {item.emoji}
          </motion.div>
        );
      })}
    </div>
  );
}
