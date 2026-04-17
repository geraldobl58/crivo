import Link from "next/link";

import { Zap } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

import { FOOTER_COLUMNS } from "@/routes";
import type { FooterColumn } from "@/routes";

import { Logo } from "../Logo";

export type FooterLinksProps = {
  tagline?: string;
  columns?: FooterColumn[];
};

export const FooterLinks = ({
  tagline = "Finanças inteligentes para empresas brasileiras modernas.",
  columns = FOOTER_COLUMNS,
}: FooterLinksProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full">
      {/* Brand column */}
      <div className="space-y-4">
        <Logo icon={<Zap className="text-white" size={28} />} />
        <p className="text-sm text-white/60 leading-relaxed">{tagline}</p>
        <div className="flex items-center gap-4 pt-1">
          <Link
            href="https://twitter.com"
            aria-label="Twitter"
            className="text-white/50 hover:text-white transition-colors"
          >
            <FaXTwitter size={18} />
          </Link>
          <Link
            href="https://linkedin.com"
            aria-label="LinkedIn"
            className="text-white/50 hover:text-white transition-colors"
          >
            <FaLinkedin size={18} />
          </Link>
          <Link
            href="https://github.com"
            aria-label="GitHub"
            className="text-white/50 hover:text-white transition-colors"
          >
            <FaGithub size={18} />
          </Link>
        </div>
      </div>

      {/* Link columns */}
      {columns.map((col) => (
        <div key={col.heading}>
          <h3 className="text-white text-sm font-bold tracking-wide">
            {col.heading}
          </h3>
          <ul className="mt-4 space-y-3">
            {col.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
