"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  tx: number;
  ty: number;
  rotation: number;
  scale: number;
}

const EMOJIS = ["🐿️", "🥜", "🌰", "🍂", "❤️", "✨", "🌰", "🥜"];

export function SqueakFAB() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isSqueaking, setIsSqueaking] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const triggerSqueak = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsSqueaking(true);
    setClickCount((prev) => prev + 1);

    // Audio fallback: create synthetic web audio API beep/chirp to sound like a squirrel squeak!
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Play a short double chirp
      const playChirp = (delay: number, pitch: number) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = "sine";
          // High pitch short sweep for a squeak sound
          osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, audioCtx.currentTime + 0.08);

          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start();
          osc.stop(audioCtx.currentTime + 0.08);
        }, delay);
      };

      playChirp(0, 850);
      playChirp(80, 950);
    } catch (err) {
      // AudioContext blocked or not supported - silent fail is fine
    }

    // Spawn 8-12 particles at the button position
    const rect = e.currentTarget.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;

    const newParticles: Particle[] = Array.from({ length: 8 }).map((_, idx) => {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const distance = 30 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      // Drift upwards
      const ty = -100 - Math.random() * 120;

      return {
        id: Date.now() + idx + Math.random(),
        x: buttonCenterX,
        y: buttonCenterY,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        tx,
        ty,
        rotation: (Math.random() - 0.5) * 60,
        scale: 0.5 + Math.random() * 0.8,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Reset button animation state
    setTimeout(() => {
      setIsSqueaking(false);
    }, 300);
  };

  // Clean up particles after they finish animating
  const handleAnimationComplete = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
        {/* Floating Bubble text on click count milestone */}
        <AnimatePresence>
          {isSqueaking && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="pointer-events-none mb-2 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md"
            >
              {clickCount % 10 === 0
                ? "🥜 Special walnut!"
                : clickCount % 5 === 0
                  ? "🌰 Super Squeak!"
                  : "🐿️ Squeak!"}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={triggerSqueak}
          whileHover={{ scale: 1.15, rotate: 8 }}
          whileTap={{ scale: 0.85, rotate: -8 }}
          animate={
            isSqueaking
              ? { scale: [1, 1.25, 0.9, 1.1, 1], rotate: [0, -12, 10, -5, 0] }
              : {}
          }
          transition={{ duration: 0.4 }}
          className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-3xl shadow-xl shadow-amber-500/30 border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-page transition-shadow"
          title="Give Squix a Squeak!"
          aria-label="Squeak squirrel button"
        >
          🐿️
        </motion.button>
      </div>

      {/* Particle Overlay Portal */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 1,
                scale: 0.3,
                x: particle.x - 16, // Center offset
                y: particle.y - 16,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0.8, 0],
                scale: [particle.scale * 0.5, particle.scale * 1.2, particle.scale],
                x: particle.x - 16 + particle.tx,
                y: particle.y - 16 + particle.ty,
                rotate: particle.rotation * 3,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
              }}
              onAnimationComplete={() => handleAnimationComplete(particle.id)}
              className="absolute text-2xl"
            >
              {particle.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
