export type CardVariant = "default" | "highlighted" | "danger";

export type BadgeVariant = "default" | "success" | "danger";

export type CardProps = {
  icon?: React.ReactNode;
  topRightIcon?: React.ReactNode;
  title: string;
  description?: string;
  price?: string;
  priceSuffix?: string;
  content?: React.ReactNode;
  badge?: string;
  badgeVariant?: BadgeVariant;
  badgeIcon?: React.ReactNode;
  topBadge?: string;
  footer?: React.ReactNode;
  variant?: CardVariant;
};

const variantStyles: Record<CardVariant, string> = {
  default: "border-gray-800 hover:border-indigo-500",
  highlighted: "border-indigo-500 bg-indigo-950/10",
  danger: "border-rose-900 hover:border-rose-700",
};

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: "text-indigo-400 bg-indigo-900/40",
  success: "text-blue-400 bg-blue-900/40",
  danger: "text-rose-400 bg-rose-900/40",
};

export const Card = ({
  icon,
  topRightIcon,
  title,
  description,
  price,
  priceSuffix,
  badge,
  badgeVariant = "default",
  badgeIcon,
  topBadge,
  footer,
  content,
  variant = "default",
}: CardProps) => {
  return (
    <div className="relative flex flex-col w-full">
      {topBadge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-block bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
            {topBadge}
          </span>
        </div>
      )}
      <div
        className={`relative flex flex-col flex-1 bg-[#0e0e10] border rounded-xl shadow-lg p-6 gap-4 transition-colors overflow-hidden ${variantStyles[variant]}`}
      >
        {topRightIcon && (
          <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
            {topRightIcon}
          </div>
        )}
        {badge && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${badgeVariantStyles[badgeVariant]}`}
          >
            {badgeIcon && <span className="shrink-0">{badgeIcon}</span>}
            {badge}
          </span>
        )}
        {icon && (
          <div className="bg-gray-800 w-12 h-12 rounded-md flex items-center justify-center border border-gray-700">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
        </div>
        {price && (
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold tracking-tight">
              {price}
            </span>
            {priceSuffix && (
              <span className="text-base text-gray-400">{priceSuffix}</span>
            )}
          </div>
        )}
        {content && <div>{content}</div>}
        {footer && <div className="mt-auto pt-4">{footer}</div>}
      </div>
    </div>
  );
};
