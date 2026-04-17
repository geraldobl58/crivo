import type { ComponentProps } from "react";

type LinkProps = ComponentProps<"a"> & { href: string };

const NextLink = ({ href, children, ...props }: LinkProps) => (
  <a href={href} {...props}>
    {children}
  </a>
);

export default NextLink;
