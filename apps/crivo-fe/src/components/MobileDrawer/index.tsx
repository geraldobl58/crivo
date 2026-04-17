"use client";

import Link from "next/link";

import { X, Zap } from "lucide-react";

import { Logo } from "../Logo";
import { Navlinks } from "../Navlinks";
import type { NavlinksProps } from "../Navlinks";

export type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  routes: NavlinksProps[];
  loginLabel?: string;
  loginHref?: string;
};

export const MobileDrawer = ({
  open,
  onClose,
  routes,
  loginLabel = "Login",
  loginHref = "/login",
}: MobileDrawerProps) => {
  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="drawer-backdrop"
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-[#0a0a0a] border-r border-white/[0.06] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.06]">
          <Logo icon={<Zap className="text-white" size={28} />} />
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav links */}
        <nav
          className="flex flex-col gap-1 flex-1 px-4 py-6"
          aria-label="Mobile navigation"
        >
          {routes.map((route) => (
            <div key={route.href} onClick={onClose}>
              <Navlinks
                href={route.href}
                label={route.label}
                active={route.active}
              />
            </div>
          ))}
        </nav>

        {/* Login at the bottom */}
        <div className="px-4 py-6 border-t border-white/6">
          <Link
            href={loginHref}
            className="block text-sm font-bold text-white/60 hover:text-white transition-colors"
          >
            {loginLabel}
          </Link>
        </div>
      </div>
    </>
  );
};
