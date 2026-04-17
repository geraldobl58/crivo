import { X, Check } from "lucide-react";
import { MdFolderOff, MdVerified } from "react-icons/md";

import { Card } from "../Card";
import { FeatureList } from "../FeatureList";

const OLD_WAY_ITEMS = [
  "Planilhas espalhadas por todo lado",
  "E-mails de NFe perdidos",
  "Prazos do DAS esquecidos",
  "Estresse constante",
];

const FLUXO_WAY_ITEMS = [
  "Dashboard centralizado",
  "NFes buscadas automaticamente",
  "Pagamentos de impostos automatizados",
  "Tranquilidade total",
];

export const SectionBottom = () => {
  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 px-4 pb-20">
      <Card
        variant="danger"
        badge="O Jeito Antigo"
        badgeVariant="danger"
        badgeIcon={<X size={12} />}
        topRightIcon={<MdFolderOff size={80} className="text-rose-700" />}
        title="Bagunçado e manual"
        content={
          <FeatureList
            items={OLD_WAY_ITEMS}
            icon={<X size={14} />}
            iconClassName="text-rose-400"
          />
        }
      />
      <Card
        variant="highlighted"
        badge="O Jeito Novo com o Crivo"
        badgeVariant="success"
        badgeIcon={<Check size={12} />}
        topRightIcon={<MdVerified size={80} className="text-indigo-500" />}
        title="Limpo e Automatizado"
        content={
          <FeatureList
            items={FLUXO_WAY_ITEMS}
            icon={<Check size={14} />}
            iconClassName="text-blue-400"
          />
        }
      />
    </section>
  );
};
