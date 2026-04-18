"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import {
  Building2,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  ArrowRight,
  Play,
  Zap,
} from "lucide-react";

import { Container } from "@/app/(administrator)/components/Container";
import { TitleBar } from "@/app/(administrator)/components/TitleBar";

const STEPS = [
  {
    icon: <Building2 size={18} />,
    label: "Cadastre sua empresa",
    description: "Adicione CNPJ, nome e dados cadastrais.",
    href: "/secure/my-company",
  },
  {
    icon: <CreditCard size={18} />,
    label: "Crie uma conta bancária",
    description: "Vincule sua conta corrente ou poupança.",
    href: "/secure/accounts",
  },
  {
    icon: <Users size={18} />,
    label: "Adicione contatos",
    description: "Clientes e fornecedores para uso nas transações.",
    href: "/secure/contacts",
  },
  {
    icon: <FileText size={18} />,
    label: "Suba seu primeiro documento",
    description: "NFe, DAS ou qualquer documento fiscal.",
    href: "/secure/documents",
  },
  {
    icon: <BarChart3 size={18} />,
    label: "Registre uma transação",
    description: "Receita ou despesa para ver o dashboard em ação.",
    href: "/secure/transactions",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    sessionStorage.removeItem("plan_id");
    sessionStorage.removeItem("plan_name");
  }, []);

  return (
    <Container>
      <TitleBar
        title="Onboarding"
        description="Tudo o que você precisa saber para começar a usar o Crivo."
      />

      {/* Banner de boas-vindas */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          bgcolor: "primary.50",
          border: "1px solid",
          borderColor: "primary.200",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <Zap size={24} className="text-indigo-500" />
          <Box flex={1} minWidth={200}>
            <Typography variant="h6" fontWeight={700}>
              Bem-vindo ao Crivo!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Siga os passos abaixo para configurar sua conta e tirar o máximo
              da plataforma.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            endIcon={<ArrowRight size={14} />}
            onClick={() => router.replace("/secure/dashboard")}
          >
            Ir para o Dashboard
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mt: 3,
        }}
      >
        {/* Checklist de primeiros passos */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            ✅ Primeiros Passos
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Complete estas etapas para ter sua conta 100% configurada.
          </Typography>
          <List disablePadding>
            {STEPS.map((step, i) => (
              <Box key={i}>
                <ListItem
                  disablePadding
                  sx={{ py: 1 }}
                  secondaryAction={
                    <Link href={step.href} passHref>
                      <Button
                        size="small"
                        endIcon={<ArrowRight size={14} />}
                        variant="text"
                      >
                        Ir
                      </Button>
                    </Link>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                    {step.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {step.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    }
                  />
                </ListItem>
                {i < STEPS.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>

        {/* Coluna direita */}
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Placeholder de vídeo */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              🎬 Como usar o Crivo
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Em breve, um vídeo completo explicando como aproveitar ao máximo a
              plataforma.
            </Typography>
            <Box
              sx={{
                bgcolor: "grey.100",
                borderRadius: 2,
                height: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed",
                borderColor: "grey.300",
                gap: 1,
              }}
            >
              <Play size={40} className="text-gray-400" />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Vídeo em breve
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tutorial completo da plataforma
              </Typography>
            </Box>
          </Paper>

          {/* Ações rápidas */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              ⚡ Acesso Rápido
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {[
                { label: "Minhas Empresas", href: "/secure/my-company" },
                { label: "Transações", href: "/secure/transactions" },
                { label: "Documentos", href: "/secure/documents" },
                { label: "Dashboard", href: "/secure/dashboard" },
              ].map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowRight size={14} />}
                    sx={{ justifyContent: "space-between" }}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </Box>
          </Paper>

          <Alert severity="info" variant="outlined">
            <Typography variant="body2">
              Para expandir seus limites,{" "}
              <Link
                href="/secure/plans"
                style={{ color: "inherit", fontWeight: 600 }}
              >
                veja os planos disponíveis
              </Link>
              .
            </Typography>
          </Alert>
        </Box>
      </Box>
    </Container>
  );
}
