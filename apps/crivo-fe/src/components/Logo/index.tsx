import Link from "next/link";

type LogoProps = {
  icon?: React.ReactNode;
  title?: string;
  color?: string;
};

export const Logo = ({ icon, title, color = "text-white" }: LogoProps) => {
  return (
    <Link href="/" className="flex items-center gap-2">
      {icon && icon}
      <h1 className={`text-2xl font-extrabold uppercase ${color}`}>
        {title || "Crivo"}
      </h1>
    </Link>
  );
};
