import { NavlinksProps } from "@/components/Navlinks";

export const DEFAULT_ROUTES: NavlinksProps[] = [
  { href: "#hero", label: "Home" },
  { href: "#inteligencia-automacao", label: "Inteligência" },
  { href: "#solucoes", label: "Soluções" },
  { href: "#precos", label: "Preços" },
  { href: "#testar-plataforma", label: "Testar Plataforma" },
];

export type FooterLink = { href: string; label: string };
export type FooterColumn = { heading: string; links: FooterLink[] };

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Produto",
    links: [
      { href: "/features", label: "Funcionalidades" },
      { href: "/integrations", label: "Integrações" },
      { href: "/pricing", label: "Preços" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    heading: "Recursos",
    links: [
      { href: "/docs", label: "Documentação" },
      { href: "/blog", label: "Blog" },
      { href: "/tax-guide", label: "Guia Fiscal (BR)" },
      { href: "/help", label: "Central de Ajuda" },
    ],
  },
  {
    heading: "Empresa",
    links: [
      { href: "/about", label: "Sobre" },
      { href: "/careers", label: "Carreiras" },
      { href: "/privacy", label: "Privacidade" },
      { href: "/terms", label: "Termos" },
    ],
  },
];
