import { Check } from "lucide-react";
import type { ReactNode } from "react";

type FeatureListItem = {
  name: string;
};

export type FeatureListProps = {
  items: FeatureListItem[] | string[];
  icon?: ReactNode;
  iconClassName?: string;
};

export const FeatureList = ({
  items,
  icon,
  iconClassName = "text-indigo-400",
}: FeatureListProps) => (
  <ul className="space-y-3">
    {items.map((item, index) => (
      <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
        <span className={`shrink-0 ${iconClassName}`}>
          {icon ?? <Check size={14} />}
        </span>
        {typeof item === "string" ? item : item.name}
      </li>
    ))}
  </ul>
);
