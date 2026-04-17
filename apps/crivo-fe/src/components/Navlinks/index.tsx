"use client";

import { useCallback } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavlinksProps = {
  href: string;
  label: string;
  active?: boolean;
};

export const Navlinks = ({ href, label, active }: NavlinksProps) => {
  const pathname = usePathname();
  const isAnchor = href.startsWith("#");
  const isActive = active ?? (!isAnchor && pathname === href);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isAnchor) {
        e.preventDefault();
        const target = document.querySelector(href);
        target?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [href, isAnchor],
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`relative flex items-center text-sm font-bold transition-colors duration-200 group ${
        isActive ? "text-white" : "text-white/60"
      } hover:text-white`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
      <span
        className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-white transition-all duration-300 ease-out ${
          isActive ? "w-full opacity-100" : "w-0 opacity-0"
        } group-hover:w-full group-hover:opacity-70`}
      />
    </Link>
  );
};
