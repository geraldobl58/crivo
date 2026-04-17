"use client";

import { useEffect, useMemo, useState } from "react";

import { Menu, Zap } from "lucide-react";

import { useActiveSection } from "@/hooks/useActiveSection";
import { DEFAULT_ROUTES } from "@/routes";

import { signIn } from "next-auth/react";

import { Logo } from "../Logo";
import { MobileDrawer } from "../MobileDrawer";
import { Navbar } from "../Navbar";
import type { NavbarProps } from "../Navbar";

export type HeaderProps = {
  loginLabel?: string;
  loginHref?: string;
  routes?: NavbarProps["routes"];
};

export const Header = ({
  loginLabel = "Entrar na Plataforma",
  loginHref = "/dashboard",
  routes = DEFAULT_ROUTES,
}: HeaderProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Extract section IDs from anchor routes ("#solucoes" → "solucoes")
  const sectionIds = useMemo(
    () =>
      routes.filter((r) => r.href.startsWith("#")).map((r) => r.href.slice(1)),
    [routes],
  );

  const activeId = useActiveSection(sectionIds);
  const activeHref = activeId ? `#${activeId}` : undefined;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 z-20 w-full transition-all duration-300 ease-in-out ${
          scrolled
            ? "bg-black/70 backdrop-blur-md border-b border-white/8 shadow-[0_1px_24px_0_rgba(0,0,0,0.6)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <Logo icon={<Zap className="text-white" size={32} />} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-12">
            <Navbar routes={routes} activeHref={activeHref} />
            {/* <Link
              href={loginHref}
              className="text-sm font-bold p-2 rounded-sm bg-indigo-500 text-white/60 hover:text-white transition-colors"
            >
              {loginLabel}
            </Link> */}
            <button
              onClick={() =>
                signIn("keycloak", { callbackUrl: "/secure/dashboard" })
              }
              className="text-sm font-bold p-2 rounded-sm bg-indigo-500 text-white/60 hover:text-white transition-colors"
            >
              {loginLabel}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/70 hover:text-white transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        routes={routes}
        loginLabel={loginLabel}
        loginHref={loginHref}
      />
    </>
  );
};
