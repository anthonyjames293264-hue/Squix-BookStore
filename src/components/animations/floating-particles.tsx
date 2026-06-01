"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingItem {
  id: number;
  emoji: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
}

const EMOJIS = ["🌰", "🥜", "🍂", "🍁", "🌿", "✨", "🐾"];

export function FloatingParticles({
  count = 12,
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
      size: 12 + Math.random() * 16,
      duration: (15 + Math.random() * 20) / speed,
      delay: Math.random() * 10,
      sway: 20 + Math.random() * 40,
    }));
  }, [count, speed]);

  useEffect(() => {
    setItems(generateItems());
  }, [generateItems]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              opacity: 0,
              y: "-10%",
              x: `${item.x}vw`,
            }}
            animate={{
              opacity: [0, 0.3, 0.3, 0],
              y: ["110vh", "-10%"],
              x: [
                `${item.x}vw`,
                `${item.x + item.sway * (Math.random() > 0.5 ? 1 : -1)}vw`,
                `${item.x}vw`,
              ],
              rotate: [0, 360],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute"
            style={{ fontSize: item.size }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
