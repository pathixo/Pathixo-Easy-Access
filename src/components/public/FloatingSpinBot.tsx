"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift } from "lucide-react";

interface FloatingSpinBotProps {
  isRegistered: boolean;
  onOpenRegister: () => void;
  visitorName?: string;
  isModalOpen?: boolean;
}

export function FloatingSpinBot({
  isRegistered,
  onOpenRegister,
  isModalOpen = false,
}: FloatingSpinBotProps) {
  return (
    <AnimatePresence>
      {!isModalOpen && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.15}
          whileDrag={{ scale: 1.12, cursor: "grabbing" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-16 right-5 sm:bottom-24 sm:right-10 z-40 select-none cursor-grab"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {isRegistered ? (
            <Link
              href="/spin"
              className="group relative flex h-[70px] w-[70px] sm:h-[82px] sm:w-[82px] flex-col items-center justify-center rounded-full border-2 border-amber-400 bg-[#16130d]/95 backdrop-blur-md text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)] transition hover:border-amber-300 hover:bg-[#221b10] hover:shadow-[0_0_35px_rgba(251,191,36,0.75)]"
              aria-label="Spin & Win Stall Lucky Draw"
            >
              {/* Pulsing golden beacon */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-400 border-2 border-black" />
              </span>

              {/* Glowing Icon */}
              <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-amber-300 animate-pulse stroke-[2.5]" />
              
              {/* Micro Arcade Label */}
              <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300 leading-none mt-1">
                SPIN
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onOpenRegister}
              className="group relative flex h-[70px] w-[70px] sm:h-[82px] sm:w-[82px] flex-col items-center justify-center rounded-full border-2 border-amber-400 bg-[#16130d]/95 backdrop-blur-md text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)] transition hover:border-amber-300 hover:bg-[#221b10] hover:shadow-[0_0_35px_rgba(251,191,36,0.75)]"
              aria-label="Spin & Win Stall Lucky Draw"
            >
              {/* Pulsing golden beacon */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-400 border-2 border-black" />
              </span>

              {/* Glowing Icon */}
              <Gift className="h-7 w-7 sm:h-8 sm:w-8 text-amber-300 stroke-[2.5]" />

              {/* Micro Arcade Label */}
              <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300 leading-none mt-1">
                SPIN
              </span>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
