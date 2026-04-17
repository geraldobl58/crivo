import { FaChartPie } from "react-icons/fa";
import { IoHardwareChip } from "react-icons/io5";

import { Card } from "../Card";
import { FeatureList } from "../FeatureList";

const OCR_FEATURES = [
  "99.9% accuracy on NFe/NFCe",
  "Automatic categorization precisa",
  "Fraud detection built-in",
];

const ANALYTICS_FEATURES = [
  "Dashboard customizável",
  "Alertas inteligentes",
  "Exportação fácil de dados",
];

export const SectionMiddle = () => {
  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 px-4 pb-20">
      <Card
        icon={<IoHardwareChip className="text-indigo-300" size={26} />}
        title="Extração de dados por IA (OCR)"
        description="Envie uma foto de qualquer recibo. Nosso modelo OCR especializado, treinado em milhões de notas fiscais brasileiras, extrai CNPJ, valor, data e itens em milissegundos."
        content={<FeatureList items={OCR_FEATURES} />}
      />
      <Card
        icon={<FaChartPie className="text-orange-400" size={26} />}
        title="Real time analytics & insights"
        description="Obtenha insights instantâneos sobre seus dados financeiros com nosso painel de análise em tempo real. Acompanhe despesas, monitore o fluxo de caixa e identifique tendências para tomar decisões de negócios mais assertivas."
        content={<FeatureList items={ANALYTICS_FEATURES} />}
      />
    </section>
  );
};
