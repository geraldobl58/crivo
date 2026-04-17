import { SectionHero } from "@/components/SectionHero";
import { Title } from "@/components/Title";
import { SectionMiddle } from "@/components/SectionMiddle";
import { SectionBottom } from "@/components/SectionBottom";
import { SectionCta } from "@/components/SectionCta";
import { SectionPrice } from "@/components/SectionPrice";

const MarketingPage = () => {
  return (
    <div>
      <SectionHero
        id="hero"
        eyebrow="Tudo o que sua empresa precisa para crescer"
        description="Elimine a burocracia com nosso sistema operacional financeiro inteligente. Automatize NFe, DAS e impostos enquanto você se concentra no crescimento do seu negócio."
      />
      <Title
        id="inteligencia-automacao"
        title="Inteligência & Automação"
        description="Nossa plataforma de automação financeira é a solução definitiva para empresas que buscam eficiência, precisão e crescimento. Com recursos avançados de IA, integração perfeita e uma interface intuitiva, oferecemos tudo o que sua empresa precisa para prosperar no mundo digital."
      />
      <SectionMiddle />
      <Title
        id="solucoes"
        title="Burocracia invisível"
        description="A burocracia brasileira é um pesadelo. Nós a tornamos invisível. Nossa plataforma automatiza a extração de dados, categorização e validação de documentos fiscais, eliminando tarefas manuais e garantindo conformidade total. Com IA treinada em milhões de documentos brasileiros, oferecemos precisão de 99,9% e insights instantâneos para que você possa focar no crescimento do seu negócio, enquanto nós cuidamos da burocracia."
      />
      <SectionBottom />
      <Title
        id="precos"
        title="Preços simples e transparentes"
        description="Nossa plataforma oferece preços claros e acessíveis, sem surpresas. Com planos flexíveis e transparência total, você sabe exatamente pelo que está pagando, permitindo que sua empresa cresça de forma sustentável e previsível."
      />
      <SectionPrice />
      <SectionCta id="testar-plataforma" />
    </div>
  );
};

export default MarketingPage;
