"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useIntro } from "@/context/IntroContext";

const HelpButton = () => {
  const { isIntroActive } = useIntro();
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const [open, setOpen] = useState(false);

  if (isIntroActive) return null;

  const handleRipple = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, { id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 800);
  };

  return (
    <AnimatePresence>
      {!isIntroActive && (
        <>
          {}
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="fixed bottom-48 right-8 z-[1000] group"
          >
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-red-600/40 blur-3xl"
            />

            <motion.div
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
              className="absolute inset-0 rounded-full blur-lg opacity-40 bg-gradient-to-r from-[#9b111e] via-[#b91c1c] to-[#9b111e]"
            />

            <motion.button
              onClick={() => {
                handleRipple();
                setOpen(true);
              }}
              whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
              className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl bg-gradient-to-br from-[#9b111e] to-[#b91c1c] text-white hover:shadow-[#b91c1c]/60 overflow-hidden"
              aria-label="Help"
            >
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-white/40"
                />
              ))}

              <motion.div
                animate={{ y: [0, -2, 0, 2, 0], rotate: [0, 3, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-2xl relative z-10"
              >
                <MessageCircle />
              </motion.div>

              <div className="absolute inset-0 overflow-hidden rounded-full">
                <svg
                  className="absolute bottom-0 left-0 w-full h-full opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  viewBox="0 0 1200 120"
                >
                  <path
                    d="M321.39 56.44C186.45 35.59 79.15 66.6 0 93.68V0h1200v27.35c-110.46 41.42-241.55 73.24-378.61 54.09C643.06 62.7 456.33 77.29 321.39 56.44z"
                    fill="url(#helpWaveGradient)"
                  />
                  <defs>
                    <linearGradient
                      id="helpWaveGradient"
                      x1="0"
                      y1="0"
                      x2="1200"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#ffffff44" />
                      <stop offset="100%" stopColor="#ffffff00" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.button>

            {}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: -10 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="pointer-events-none absolute right-20 bottom-5 bg-white text-[#9b111e] font-semibold text-sm px-6 py-1 rounded-full shadow-md border border-[#b91c1c]/30 backdrop-blur-sm group-hover:opacity-100 group-hover:-translate-y-2 opacity-0"
            >
              New here?
            </motion.span>
          </motion.div>

          {}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1100]"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="relative w-[92%] max-w-lg bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border-t-4 border-red-700"
                >
                  <h2 className="text-xl font-extrabold text-center text-red-800 mb-4">
                    Help Center
                  </h2>

                  <p className="text-sm text-gray-700">
                    Comming soon
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-5 text-red-600 font-bold hover:text-red-800"
                    aria-label="Close"
                  >
                    <X />
                  </motion.button>

                  {}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default HelpButton;
