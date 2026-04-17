"use client";

import { motion } from "framer-motion";
import {
  FileCheck,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Receipt,
  Brain,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

type FloatingItem = {
  icon: React.ReactNode;
  label: string;
  x: string;
  y: string;
  delay: number;
  duration: number;
  className: string;
};

const FLOATING_ITEMS: FloatingItem[] = [
  {
    icon: <FileCheck size={18} className="text-indigo-400" />,
    label: "Documento aprovado",
    x: "8%",
    y: "18%",
    delay: 0,
    duration: 5,
    className: "bg-indigo-950/80 border-indigo-800/50 text-indigo-300",
  },
  {
    icon: <TrendingUp size={18} className="text-emerald-400" />,
    label: "+23% economia",
    x: "75%",
    y: "10%",
    delay: 0.8,
    duration: 6,
    className: "bg-emerald-950/80 border-emerald-800/50 text-emerald-300",
  },
  {
    icon: <ShieldCheck size={18} className="text-blue-400" />,
    label: "99,9% precisão",
    x: "5%",
    y: "65%",
    delay: 1.6,
    duration: 5.5,
    className: "bg-blue-950/80 border-blue-800/50 text-blue-300",
  },
  {
    icon: <FaWhatsapp size={18} className="text-green-400" />,
    label: "Notificação enviada",
    x: "78%",
    y: "70%",
    delay: 0.4,
    duration: 6.5,
    className: "bg-green-950/80 border-green-800/50 text-green-300",
  },
  {
    icon: <Brain size={18} className="text-purple-400" />,
    label: "IA processando",
    x: "18%",
    y: "42%",
    delay: 1.2,
    duration: 5.8,
    className: "bg-purple-950/80 border-purple-800/50 text-purple-300",
  },
  {
    icon: <Receipt size={18} className="text-amber-400" />,
    label: "Fatura analisada",
    x: "70%",
    y: "42%",
    delay: 2,
    duration: 5.2,
    className: "bg-amber-950/80 border-amber-800/50 text-amber-300",
  },
];

const ORBS = [
  {
    size: "w-64 h-64",
    color: "bg-indigo-600/20",
    x: "20%",
    y: "30%",
    duration: 8,
  },
  {
    size: "w-48 h-48",
    color: "bg-blue-600/15",
    x: "65%",
    y: "50%",
    duration: 10,
  },
  {
    size: "w-32 h-32",
    color: "bg-purple-600/15",
    x: "45%",
    y: "20%",
    duration: 7,
  },
];

const FloatingBadge = ({ item }: { item: FloatingItem }) => (
  <motion.div
    className={`absolute flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium backdrop-blur-md shadow-lg ${item.className}`}
    style={{ left: item.x, top: item.y }}
    initial={{ opacity: 0, scale: 0.6, y: 20 }}
    animate={{
      opacity: 1,
      scale: 1,
      y: [0, -12, 0, 8, 0],
    }}
    transition={{
      opacity: { delay: item.delay, duration: 0.6 },
      scale: { delay: item.delay, duration: 0.6 },
      y: {
        delay: item.delay + 0.6,
        duration: item.duration,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    {item.icon}
    <span className="whitespace-nowrap">{item.label}</span>
  </motion.div>
);

const CenterCard = () => (
  <motion.div
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 rounded-2xl border border-indigo-700/40 bg-indigo-950/60 backdrop-blur-xl p-5 shadow-2xl shadow-indigo-500/10"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
  >
    <div className="flex items-center gap-2 mb-3">
      <BarChart3 size={20} className="text-indigo-400" />
      <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">
        Resumo Financeiro
      </span>
    </div>

    <div className="text-2xl font-bold text-white mb-1">R$ 284.590</div>
    <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
      <TrendingUp size={14} />
      +18,4% este mês
    </div>

    <div className="mt-4 flex gap-1">
      {[40, 55, 35, 60, 75, 50, 85].map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm bg-indigo-500/60"
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.5, ease: "easeOut" }}
          style={{ maxHeight: 40 }}
        />
      ))}
    </div>
  </motion.div>
);

const GlowLine = () => (
  <motion.div
    className="absolute left-1/2 top-[15%] -translate-x-1/2 w-px h-[70%]"
    style={{
      background:
        "linear-gradient(to bottom, transparent, rgba(99,102,241,0.4), rgba(99,102,241,0.6), rgba(99,102,241,0.4), transparent)",
    }}
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{ opacity: 1, scaleY: 1 }}
    transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
  />
);

export const HeroAnimation = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto h-105 md:h-120 overflow-hidden">
      {/* Background gradient orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${orb.size} ${orb.color}`}
          style={{
            left: orb.x,
            top: orb.y,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Perspective grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      {/* Glow center line */}
      <GlowLine />

      {/* Center financial card */}
      <CenterCard />

      {/* Floating badges */}
      {FLOATING_ITEMS.map((item) => (
        <FloatingBadge key={item.label} item={item} />
      ))}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-(--background) to-transparent" />
    </div>
  );
};
