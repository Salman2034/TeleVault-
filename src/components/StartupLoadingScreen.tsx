import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  ShieldCheck,
  Zap,
  Cloud,
  HardDrive,
  CheckCircle2,
  Lock,
  Radio,
  ArrowRight
} from 'lucide-react';

interface StartupLoadingScreenProps {
  onFinished: () => void;
  isDataReady: boolean;
}

const LOADING_STEPS = [
  { text: 'Connecting to Telegram Storage Infrastructure...', icon: Radio },
  { text: 'Initializing Secure MTProto & Bot Gateway...', icon: Lock },
  { text: 'Decrypting file catalog & index tree...', icon: HardDrive },
  { text: 'Finalizing high-speed workspace...', icon: Zap },
];

export const StartupLoadingScreen: React.FC<StartupLoadingScreenProps> = ({
  onFinished,
  isDataReady,
}) => {
  const [progress, setProgress] = useState(8);
  const [stepIndex, setStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Smooth, cinematic pacing spanning ~3.5 to 4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 96) {
          // Increment smoothly
          const increment = Math.random() < 0.3 ? 1 : Math.floor(Math.random() * 3) + 2;
          const nextVal = Math.min(prev + increment, 96);
          
          if (nextVal >= 75) setStepIndex(3);
          else if (nextVal >= 50) setStepIndex(2);
          else if (nextVal >= 25) setStepIndex(1);
          
          return nextVal;
        }
        
        // Once data is ready and we reached 96%, step to 100%
        if (isDataReady && prev >= 96) {
          return 100;
        }
        return prev;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isDataReady]);

  // When progress reaches 100%, hold briefly to show complete state then smoothly fade out
  useEffect(() => {
    if (progress >= 100) {
      setStepIndex(3);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onFinished();
        }, 550);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinished]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onFinished();
    }, 300);
  };

  const CurrentStepIcon = LOADING_STEPS[stepIndex]?.icon || Zap;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="startup-loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden select-none"
        >
          {/* Animated Background Atmosphere */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Ambient Radial Glows */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-500/20 blur-[120px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600/25 blur-[140px]"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-sky-600/10 blur-[160px]" />

            {/* Subtle Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.07]" 
              style={{
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }} 
            />

            {/* Floating ambient particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-sky-400/50"
                style={{
                  top: `${15 + i * 14}%`,
                  left: `${10 + (i * 18) % 80}%`,
                }}
                animate={{
                  y: [-15, 15, -15],
                  x: [-10, 10, -10],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.8, 1.3, 0.8],
                }}
                transition={{
                  duration: 4 + i * 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          {/* Main Card Content */}
          <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center">
            
            {/* Animated Logo & Emblem */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Outer Pulse Rings */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
                className="absolute w-24 h-24 rounded-3xl border border-sky-400/40 bg-sky-400/10"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute w-20 h-20 rounded-2xl border border-sky-500/50"
              />

              {/* Central Glowing Icon Badge */}
              <motion.div
                animate={{ y: [-4, 4, -4], rotate: [-1, 2, -1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-400 p-0.5 shadow-xl shadow-sky-500/25 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-[14px] bg-slate-900/40 backdrop-blur-md flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Send className="w-8 h-8 text-white -rotate-12 translate-x-0.5 translate-y-0.5 drop-shadow-[0_2px_8px_rgba(56,189,248,0.6)]" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Brand Title & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-1.5 mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>Telegram Cloud Vault</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                Tele<span className="text-sky-400 font-medium">Vault</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Unlimited, fast, and encrypted cloud storage powered by Telegram infrastructure
              </p>
            </motion.div>

            {/* Progress Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              {/* Status Step Row */}
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    progress >= 100
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  }`}>
                    {progress >= 100 ? (
                      <CheckCircle2 className="w-4 h-4 animate-in zoom-in" />
                    ) : (
                      <CurrentStepIcon className="w-4 h-4 animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-300 truncate">
                    {progress >= 100 ? 'Ready! Opening TeleVault workspace...' : (LOADING_STEPS[stepIndex]?.text || 'Loading storage environment...')}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ml-2 transition-colors ${
                  progress >= 100 ? 'text-emerald-400' : 'text-sky-400'
                }`}>
                  {progress}%
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-500 via-blue-400 to-cyan-300 rounded-full relative"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                >
                  {/* Shimmer light bar */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-20"
                  />
                </motion.div>
              </div>

              {/* Mini Status Indicators */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 border-x border-slate-800">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>2GB MTProto</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                  <span>Unlimited</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Skip button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-900/60 cursor-pointer"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Footer branding */}
          <div className="absolute bottom-4 text-center text-[10px] text-slate-600">
            TeleVault Engine • End-to-End Encrypted Cloud Storage
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
