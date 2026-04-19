export const formatPrice = (cents: number) => {
  if (cents === 0) return "Grátis";
  if (cents < 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
};
