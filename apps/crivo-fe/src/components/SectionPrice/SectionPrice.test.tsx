import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SectionPrice } from ".";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

const mockPlans = [
  {
    id: "1",
    type: "BASIC",
    name: "Starter",
    description: "Plano inicial",
    priceMonthly: 19900,
    trialDays: 0,
    maxUsers: 1,
    maxCompany: 1,
    maxTransactions: 1,
    maxContacts: 1,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    features: ["OCR básico"],
  },
  {
    id: "2",
    type: "PROFESSIONAL",
    name: "Professional",
    description: "Plano profissional",
    priceMonthly: 39900,
    trialDays: 0,
    maxUsers: 3,
    maxCompany: 3,
    maxTransactions: -1,
    maxContacts: -1,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    features: [
      "OCR avançado com IA",
      "Cálculo automático de impostos",
      "Integração com WhatsApp",
    ],
  },
  {
    id: "3",
    type: "ENTERPRISE",
    name: "Enterprise",
    description: "Plano empresarial",
    priceMonthly: 0,
    trialDays: 0,
    maxUsers: -1,
    maxCompany: -1,
    maxTransactions: -1,
    maxContacts: -1,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    features: [
      "Tudo do Professional",
      "Integrações personalizadas",
      "Gerente de conta dedicado",
    ],
  },
];

beforeEach(() => {
  vi.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      items: mockPlans,
      page: 1,
      limit: 10,
      total: 3,
      totalPages: 1,
    }),
  } as Response);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SectionPrice", () => {
  it("renders three plan titles", async () => {
    render(<SectionPrice />);
    expect(await screen.findByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders the Starter price", async () => {
    render(<SectionPrice />);
    await screen.findByText("Starter");
    expect(screen.getByText("R$ 199")).toBeInTheDocument();
  });

  it("renders the Professional price", async () => {
    render(<SectionPrice />);
    await screen.findByText("Professional");
    expect(screen.getByText("R$ 399")).toBeInTheDocument();
  });

  it("renders the Enterprise price", async () => {
    render(<SectionPrice />);
    await screen.findByText("Enterprise");
    expect(screen.getByText("Sob consulta")).toBeInTheDocument();
  });

  it("renders the 'Mais Popular' top badge", async () => {
    render(<SectionPrice />);
    expect(await screen.findByText("Mais Popular")).toBeInTheDocument();
  });

  it("renders all CTA buttons", async () => {
    render(<SectionPrice />);
    await screen.findByText("Starter");
    expect(
      screen.getByRole("button", { name: /Começar com o Starter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Assinar o Professional/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Falar com Vendas/i }),
    ).toBeInTheDocument();
  });

  it("renders Starter feature items", async () => {
    render(<SectionPrice />);
    await screen.findByText("Starter");
    expect(screen.getByText(/Até 1 transação/i)).toBeInTheDocument();
    expect(screen.getByText(/OCR básico/i)).toBeInTheDocument();
  });

  it("renders Professional feature items", async () => {
    render(<SectionPrice />);
    await screen.findByText("Professional");
    expect(screen.getByText(/OCR avançado com IA/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Cálculo automático de impostos/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Integração com WhatsApp/i)).toBeInTheDocument();
  });

  it("renders Enterprise feature items", async () => {
    render(<SectionPrice />);
    await screen.findByText("Enterprise");
    expect(screen.getByText(/Tudo do Professional/i)).toBeInTheDocument();
    expect(screen.getByText(/Integrações personalizadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Gerente de conta dedicado/i)).toBeInTheDocument();
  });

  it("renders exactly three card headings", async () => {
    render(<SectionPrice />);
    await screen.findByText("Starter");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  });
});
