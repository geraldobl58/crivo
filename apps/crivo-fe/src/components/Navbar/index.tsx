import { DEFAULT_ROUTES } from "@/routes";

import type { NavlinksProps } from "../Navlinks";

import { Navlinks } from "../Navlinks";

export type NavbarProps = {
  routes?: NavlinksProps[];
  /** Href of the currently active section (for anchor links) */
  activeHref?: string;
};

export const Navbar = ({
  routes = DEFAULT_ROUTES,
  activeHref,
}: NavbarProps) => {
  return (
    <nav
      className="flex items-center justify-between gap-12"
      aria-label="Main navigation"
    >
      {routes.map((route) => (
        <Navlinks
          key={route.href}
          href={route.href}
          label={route.label}
          active={
            route.active ??
            (activeHref && route.href.startsWith("#")
              ? route.href === activeHref
              : undefined)
          }
        />
      ))}
    </nav>
  );
};
