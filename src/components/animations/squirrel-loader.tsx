"use client";

import { motion } from "framer-motion";

export function SquirrelLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="relative">
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-6xl select-none"
        >
          🐿️
        </motion.div>

        {/* Acorn orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: 100, height: 100, top: -18, left: -18 }}
        >
          <motion.span
            className="absolute text-lg"
            style={{ top: 0, left: "50%", transform: "translateX(-50%)" }}
          >
            🌰
          </motion.span>
        </motion.div>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: 120, height: 120, top: -28, left: -28 }}
        >
          <motion.span
            className="absolute text-sm"
            style={{ bottom: 0, left: "50%", transform: "translateX(-50%)" }}
          >
            🥜
          </motion.span>
        </motion.div>
      </div>

      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-medium text-amber-500 tracking-wider"
      >
        {text}
      </motion.p>

      {/* Paw prints trail */}
      <div className="flex gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="text-xs text-amber-500/60"
          >
            🐾
          </motion.span>
        ))}
      </div>
    </div>
  );
}
