"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  BarChart3,
  Dices,
  Check,
  Copy,
  Gift,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface WheelSegment {
  label: string;
  slug: string;
  color: string;
  text: string;
}

interface TestReward {
  spin_id: string;
  reward_id: string;
  reward_name: string;
  display_label: string;
  reward_slug: string;
  reward_type: string;
  reward_description: string;
  reward_code: string;
  expires_at: string;
  redemption_instructions: string;
  target_index: number;
}

interface BatchStat {
  slug: string;
  name: string;
  display_label: string;
  reward_type: string;
  probability_weight: number;
  expected_percentage: number;
  actual_percentage: number;
  hits: number;
}

const SEGMENT_STYLES = [
  { color: "#ccff00", text: "#0a0b0c" },
  { color: "#16191d", text: "#f4f4f5" },
  { color: "#ccff00", text: "#0a0b0c" },
  { color: "#16191d", text: "#f4f4f5" },
  { color: "#ccff00", text: "#0a0b0c" },
  { color: "#16191d", text: "#f4f4f5" },
  { color: "#ccff00", text: "#0a0b0c" },
  { color: "#16191d", text: "#f4f4f5" },
];

const DEFAULT_SEGMENTS: WheelSegment[] = [
  { label: "1-Yr Vakxo", slug: "vakxo-1-year", color: "#ccff00", text: "#0a0b0c" },
  { label: "1-Mo Vakxo", slug: "vakxo-1-month", color: "#16191d", text: "#f4f4f5" },
  { label: "30% Vakxo", slug: "discount-30-vakxo", color: "#ccff00", text: "#0a0b0c" },
  { label: "20% Vakxo", slug: "discount-20-vakxo", color: "#16191d", text: "#f4f4f5" },
  { label: "50% kroc", slug: "discount-50-krocpdf", color: "#ccff00", text: "#0a0b0c" },
  { label: "6M krocPDF", slug: "krocpdf-6-month", color: "#16191d", text: "#f4f4f5" },
  { label: "3M krocPDF", slug: "extended-trial-3mo", color: "#ccff00", text: "#0a0b0c" },
  { label: "6-Mo Vakxo", slug: "vakxo-6-month", color: "#16191d", text: "#f4f4f5" },
];

export function TestSpinSandbox() {
  const [activeTab, setActiveTab] = useState<"interactive" | "batch">("interactive");
  const [segments, setSegments] = useState<WheelSegment[]>(DEFAULT_SEGMENTS);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentWin, setCurrentWin] = useState<TestReward | null>(null);
  const [spinHistory, setSpinHistory] = useState<TestReward[]>([]);
  const [turboMode, setTurboMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Batch Simulation State
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchStats, setBatchStats] = useState<BatchStat[] | null>(null);
  const [batchTotal, setBatchTotal] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rotationRef = useRef<number>(0);

  // Load live segments from server
  useEffect(() => {
    fetch("/api/spin/rewards")
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok && Array.isArray(json.data) && json.data.length >= 2) {
          const segs = json.data.map((r: { slug: string; name: string; display_label?: string }, idx: number) => ({
            label: r.display_label || r.name,
            slug: r.slug,
            ...SEGMENT_STYLES[idx % SEGMENT_STYLES.length],
          }));
          setSegments(segs);
        }
      })
      .catch(() => {});
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTickSound = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  };

  const playVictoryChime = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
      });
    } catch {}
  };

  const executeTestSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setErrorMessage(null);
    setCurrentWin(null);

    try {
      const res = await fetch("/api/test-spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "single" }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMessage(json?.error?.message || "Test spin failed.");
        setIsSpinning(false);
        return;
      }

      const outcome = json.data as TestReward;

      const segs = segments;
      let targetIndex = segs.findIndex((s) => s.slug === outcome.reward_slug);
      if (targetIndex === -1) targetIndex = 0;

      const segmentAngle = 360 / segs.length;
      const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
      const fullRotations = turboMode ? 3 : 5;
      
      const currentDeg = rotationRef.current;
      const targetDeg = currentDeg + (fullRotations * 360) + (360 - (currentDeg % 360) + (360 - segmentCenter));

      rotationRef.current = targetDeg;
      setRotation(targetDeg);

      // Play ticking sounds
      const durationMs = turboMode ? 1200 : 4500;
      let ticks = 0;
      const totalTicks = turboMode ? 15 : 35;
      const tick = () => {
        playTickSound();
        ticks++;
        if (ticks < totalTicks) {
          const delay = (durationMs / totalTicks) * (0.4 + (ticks / totalTicks) * 0.8);
          tickIntervalRef.current = setTimeout(tick, delay);
        }
      };
      tick();

      setTimeout(() => {
        if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
        playVictoryChime();

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ccff00", "#ffffff", "#38bdf8"],
        });

        setIsSpinning(false);
        setCurrentWin(outcome);
        setSpinHistory((prev) => [outcome, ...prev.slice(0, 19)]);
      }, durationMs);
    } catch {
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
      setErrorMessage("Network error during test spin.");
      setIsSpinning(false);
    }
  };

  const runBatchSimulation = async (count: number) => {
    setIsBatchRunning(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/test-spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "batch", count }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setBatchStats(json.data.stats);
        setBatchTotal(json.data.total_simulations);
      } else {
        setErrorMessage(json?.error?.message || "Simulation error");
      }
    } catch {
      setErrorMessage("Network error running batch simulation.");
    } finally {
      setIsBatchRunning(false);
    }
  };

  const copyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#252a31] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
              {"// DEV / TEST SANDBOX"}
            </span>
            <span className="rounded-full bg-[#ccff00]/10 border border-[#ccff00]/40 px-2 py-0.5 font-mono text-[10px] font-bold text-[#ccff00]">
              UNLIMITED SPINS
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Spin Wheel <span className="text-[#ccff00]">Simulator & Testing Lab</span>
          </h1>
          <p className="mt-1 font-mono text-xs text-neutral-400">
            Spin the live wheel unlimited times, verify outcomes & target angles, and simulate thousands of runs.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("interactive")}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 font-mono text-xs font-bold uppercase transition ${
              activeTab === "interactive"
                ? "border-[#ccff00] bg-[#ccff00] text-black"
                : "border-[#252a31] bg-[#141619] text-neutral-400 hover:text-white"
            }`}
          >
            <Dices className="h-3.5 w-3.5" />
            <span>Interactive Wheel</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("batch");
              if (!batchStats) runBatchSimulation(1000);
            }}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 font-mono text-xs font-bold uppercase transition ${
              activeTab === "batch"
                ? "border-[#ccff00] bg-[#ccff00] text-black"
                : "border-[#252a31] bg-[#141619] text-neutral-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Batch Odds Simulator</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: INTERACTIVE WHEEL TESTING */}
      {activeTab === "interactive" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Wheel Column */}
          <div className="lg:col-span-7 rounded-2xl border-2 border-[#252a31] bg-[#101214] p-6 text-center shadow-cyber">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-4 border-b border-[#252a31] pb-3">
              <button
                onClick={() => setTurboMode((prev) => !prev)}
                className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 font-mono text-[10px] font-bold uppercase transition ${
                  turboMode
                    ? "border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00]"
                    : "border-white/10 bg-[#141619] text-neutral-400 hover:text-white"
                }`}
              >
                <Zap className="h-3 w-3" />
                <span>{turboMode ? "TURBO (1.2s)" : "NORMAL (4.5s)"}</span>
              </button>

              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-white/10 bg-[#141619] px-2 font-mono text-[10px] text-neutral-400 hover:text-white"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-3 w-3 text-neutral-500" />
                    <span>MUTED</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3 text-[#ccff00]" />
                    <span className="text-[#ccff00]">SFX ON</span>
                  </>
                )}
              </button>
            </div>

            {/* The Animated Wheel */}
            <div className="relative mx-auto flex h-[310px] w-[310px] items-center justify-center select-none">
              {/* Pointer */}
              <div className="absolute -top-3.5 z-20 flex flex-col items-center">
                <div className="h-0 w-0 border-x-[10px] border-x-transparent border-t-[20px] border-t-[#ccff00] drop-shadow-[0_2px_8px_rgba(204,255,0,0.6)]" />
              </div>

              {/* Wheel Body */}
              <div
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning
                    ? `transform ${turboMode ? 1.2 : 4.5}s cubic-bezier(0.12, 0.95, 0.22, 1.0)`
                    : "none",
                  willChange: "transform",
                }}
                className="h-[300px] w-[300px] rounded-full border-4 border-[#ccff00]/60 shadow-[0_0_30px_rgba(204,255,0,0.12)] relative overflow-hidden bg-[#101214]"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  {segments.map((seg, i) => {
                    const angle = 360 / segments.length;
                    const startAngle = i * angle;
                    const endAngle = (i + 1) * angle;
                    const midAngle = startAngle + angle / 2;
                    const isFlipped = midAngle > 90 && midAngle < 270;

                    const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    return (
                      <g key={i}>
                        <path d={pathData} fill={seg.color} stroke="#0a0b0c" strokeWidth="0.7" />
                        <text
                          x="50"
                          y="18"
                          fill={seg.text}
                          fontSize="3.1"
                          fontWeight="800"
                          fontFamily="monospace"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={
                            isFlipped
                              ? `rotate(${midAngle}, 50, 50) rotate(180, 50, 18)`
                              : `rotate(${midAngle}, 50, 50)`
                          }
                        >
                          {seg.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Center Tactile Spin Button */}
              <button
                onClick={executeTestSpin}
                disabled={isSpinning}
                className="absolute z-30 flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-black bg-[#ccff00] text-black shadow-cyber transition active:scale-95 hover:bg-[#d9ff33] disabled:opacity-80 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-black stroke-[2.5]" />
                <span className="font-mono text-xs font-black uppercase tracking-wider">
                  {isSpinning ? "..." : "SPIN"}
                </span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={executeTestSpin}
                disabled={isSpinning}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ccff00] px-6 font-mono text-xs font-black uppercase tracking-wider text-black shadow-cyber transition hover:bg-[#d9ff33] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isSpinning ? "Spinning..." : "TRIGGER TEST SPIN"}</span>
              </button>
            </div>
          </div>

          {/* Outcome & History Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Current Win Card */}
            {currentWin ? (
              <div className="rounded-2xl border-2 border-[#ccff00] bg-[#141619] p-5 shadow-cyber animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#ccff00]">
                    {"// LATEST TEST OUTCOME"}
                  </span>
                  <span className="rounded-full bg-[#ccff00]/10 border border-[#ccff00]/40 px-2 py-0.5 font-mono text-[10px] font-bold text-[#ccff00]">
                    WON
                  </span>
                </div>

                <h3 className="mt-2 text-xl font-black uppercase text-white">
                  {currentWin.display_label}
                </h3>
                <p className="text-xs font-mono text-neutral-400 mt-1">
                  {currentWin.reward_name}
                </p>

                <div className="mt-3 rounded-xl border border-dashed border-[#ccff00]/40 bg-[#0c0d0e] p-3 flex items-center justify-between">
                  <div>
                    <span className="block font-mono text-[9px] uppercase text-neutral-500">Test Voucher Code</span>
                    <span className="font-mono text-sm font-black tracking-wider text-[#ccff00]">
                      {currentWin.reward_code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyCode(currentWin.reward_code)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-[#1a1d21] px-2.5 font-mono text-[10px] text-neutral-300 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-[#ccff00]" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-[#252a31] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-400">
                    Target Sector Index: <strong className="text-white">#{currentWin.target_index + 1}</strong>
                  </span>
                  <button
                    onClick={executeTestSpin}
                    disabled={isSpinning}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#ccff00] px-3 font-mono text-[10px] font-black uppercase text-black hover:bg-[#d9ff33]"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Spin Again</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-[#252a31] bg-[#101214] p-5 text-center text-neutral-500 font-mono text-xs">
                <Gift className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
                <span>Tap &quot;TRIGGER TEST SPIN&quot; to execute a spin and see the live outcome.</span>
              </div>
            )}

            {/* Recent Spins Log */}
            <div className="rounded-2xl border-2 border-[#252a31] bg-[#101214] overflow-hidden">
              <div className="border-b border-[#252a31] bg-[#141619] px-4 py-2.5 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase text-neutral-300">
                  Session Spins History ({spinHistory.length})
                </span>
                {spinHistory.length > 0 && (
                  <button
                    onClick={() => setSpinHistory([])}
                    className="font-mono text-[10px] text-neutral-500 hover:text-red-400"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-[260px] overflow-y-auto divide-y divide-[#252a31] text-xs font-mono">
                {spinHistory.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500 text-[11px]">
                    No test spins completed yet in this session.
                  </div>
                ) : (
                  spinHistory.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-[#141619]">
                      <div>
                        <span className="font-bold text-white block">{item.display_label}</span>
                        <span className="text-[10px] text-neutral-500">{item.reward_code}</span>
                      </div>
                      <span className="rounded bg-[#ccff00]/10 border border-[#ccff00]/30 px-1.5 py-0.5 text-[9px] font-bold text-[#ccff00]">
                        #{spinHistory.length - idx}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH ODDS SIMULATOR */}
      {activeTab === "batch" && (
        <div className="rounded-2xl border-2 border-[#252a31] bg-[#101214] p-6 shadow-cyber space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#252a31] pb-4">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
                {"// MONTE CARLO PROBABILITY VALIDATOR"}
              </span>
              <h2 className="text-lg font-black uppercase text-white">
                Simulate Thousands of Random Runs
              </h2>
              <p className="font-mono text-xs text-neutral-400 mt-1">
                Executes the exact backend weighted selection function repeatedly to prove percentage distribution.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => runBatchSimulation(100)}
                disabled={isBatchRunning}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#252a31] bg-[#141619] px-3 font-mono text-xs font-bold uppercase text-white hover:border-[#ccff00] disabled:opacity-50"
              >
                <span>Run 100x</span>
              </button>
              <button
                onClick={() => runBatchSimulation(1000)}
                disabled={isBatchRunning}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#ccff00] px-4 font-mono text-xs font-black uppercase text-black hover:bg-[#d9ff33] disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isBatchRunning ? "Simulating..." : "Run 1,000x"}</span>
              </button>
            </div>
          </div>

          {batchStats && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Sample Size: <strong className="text-white">{batchTotal.toLocaleString()} spins</strong></span>
                <span className="text-[#ccff00]">Deterministic Verification</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#252a31]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#141619] border-b border-[#252a31] text-[10px] uppercase text-neutral-400">
                    <tr>
                      <th className="p-3">Reward Segment</th>
                      <th className="p-3">Target Weight</th>
                      <th className="p-3">Expected %</th>
                      <th className="p-3">Actual Hits</th>
                      <th className="p-3">Observed %</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252a31] bg-[#0c0d0e]">
                    {batchStats.map((stat, i) => {
                      const isZeroWeight = stat.probability_weight === 0;
                      return (
                        <tr key={i} className={isZeroWeight ? "bg-red-500/5" : ""}>
                          <td className="p-3">
                            <span className="font-bold text-white block">{stat.display_label}</span>
                            <span className="text-[10px] text-neutral-500">{stat.name}</span>
                          </td>
                          <td className="p-3 text-neutral-300 font-bold">{stat.probability_weight}</td>
                          <td className="p-3 text-neutral-300">{stat.expected_percentage}%</td>
                          <td className="p-3 font-bold text-white">{stat.hits}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-black ${isZeroWeight ? "text-neutral-500" : "text-[#ccff00]"}`}>
                                {stat.actual_percentage}%
                              </span>
                              <div className="h-1.5 w-16 rounded-full bg-[#252a31] overflow-hidden">
                                <div
                                  className={`h-full ${isZeroWeight ? "bg-neutral-600" : "bg-[#ccff00]"}`}
                                  style={{ width: `${Math.min(stat.actual_percentage * 2, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {isZeroWeight ? (
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                                0 HITS (NEVER LANDS)
                              </span>
                            ) : stat.probability_weight >= 30 ? (
                              <span className="rounded-full bg-[#ccff00]/10 border border-[#ccff00]/40 px-2 py-0.5 text-[9px] font-bold text-[#ccff00]">
                                HIGH VOLUME
                              </span>
                            ) : (
                              <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] text-neutral-400">
                                ACTIVE
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-[#252a31] pt-4 font-mono text-xs text-neutral-500">
        <Link href="/spin" className="hover:text-[#ccff00] transition flex items-center gap-1">
          <span>Go to Public Visitor Spin Wheel</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/admin/lucky-draw" className="hover:text-[#ccff00] transition flex items-center gap-1">
          <span>Go to Admin Prize Pool HUD</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
