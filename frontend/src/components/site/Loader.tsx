import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** Luxury opening curtain: monogram + gold line reveal, then a soft blur fade. */
export function Loader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {done ? null : (
        <motion.div
          exit={{ opacity: 0, filter: "blur(18px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.28em" }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-xl font-black uppercase sm:text-2xl"
          >
            DAS <span className="text-gold">&amp;</span> CO
          </motion.p>
          <div className="mt-6 h-px w-40 overflow-hidden bg-white/8">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full bg-[image:var(--gradient-gold)]"
            />
          </div>
          <p className="mt-5 text-[0.6rem] uppercase tracking-[0.32em] text-text-muted">
            Luxury Jewelry CAD Design Studio
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
