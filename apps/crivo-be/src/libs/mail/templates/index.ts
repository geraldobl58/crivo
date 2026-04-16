function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crivo</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1e40af;padding:24px 32px;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:2px;">CRIVO</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e4e4e7;color:#71717a;font-size:12px;">
              <p style="margin:0;">Este email foi enviado automaticamente pelo Crivo. Não responda diretamente.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;padding:12px 24px;background-color:#1e40af;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;margin:16px 0;">${text}</a>`;
}

export function welcomeTemplate(input: {
  companyName: string;
  planType: string;
  frontendUrl: string;
}): string {
  return baseLayout(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#18181b;">Bem-vindo ao Crivo!</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
      Sua empresa <strong>${input.companyName}</strong> foi criada com sucesso no plano <strong>${input.planType}</strong>.
    </p>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
      Próximos passos:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#3f3f46;font-size:15px;line-height:1.8;">
      <li>Acesse o dashboard para configurar sua conta</li>
      <li>Convide membros da equipe</li>
      <li>Complete o setup da empresa</li>
    </ul>
    ${button('Acessar Dashboard', `${input.frontendUrl}/dashboard`)}
  `);
}

export function paymentSucceededTemplate(input: {
  companyName: string;
  formattedAmount: string;
  invoiceId: string;
}): string {
  return baseLayout(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#18181b;">Pagamento confirmado ✓</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
      Recebemos o pagamento de <strong>${input.formattedAmount}</strong> referente à assinatura da empresa <strong>${input.companyName}</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;background-color:#f4f4f5;border-radius:6px;padding:16px;width:100%;">
      <tr>
        <td style="padding:8px 16px;color:#71717a;font-size:13px;">Fatura</td>
        <td style="padding:8px 16px;color:#18181b;font-size:13px;font-weight:600;">${input.invoiceId}</td>
      </tr>
      <tr>
        <td style="padding:8px 16px;color:#71717a;font-size:13px;">Valor</td>
        <td style="padding:8px 16px;color:#18181b;font-size:13px;font-weight:600;">${input.formattedAmount}</td>
      </tr>
    </table>
    <p style="margin:0;color:#71717a;font-size:13px;">Obrigado por ser cliente Crivo!</p>
  `);
}

export function paymentFailedTemplate(input: {
  companyName: string;
  formattedAmount: string;
  portalUrl?: string;
}): string {
  const portalButton = input.portalUrl
    ? button('Atualizar método de pagamento', input.portalUrl)
    : '';

  return baseLayout(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#dc2626;">Problema com seu pagamento</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
      Não conseguimos processar o pagamento de <strong>${input.formattedAmount}</strong> para a empresa <strong>${input.companyName}</strong>.
    </p>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
      Atualize seu método de pagamento para evitar a suspensão do serviço.
    </p>
    ${portalButton}
    <p style="margin:16px 0 0;color:#71717a;font-size:13px;">Se precisar de ajuda, entre em contato com nosso suporte.</p>
  `);
}

export function subscriptionCanceledTemplate(input: {
  companyName: string;
}): string {
  return baseLayout(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#18181b;">Assinatura cancelada</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
      A assinatura da empresa <strong>${input.companyName}</strong> foi cancelada.
    </p>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
      Seus dados serão mantidos por 30 dias. Para reativar, basta acessar o dashboard e escolher um novo plano.
    </p>
    <p style="margin:0;color:#71717a;font-size:13px;">Sentiremos sua falta! Se mudar de ideia, estamos aqui.</p>
  `);
}

export function trialExpiringTemplate(input: {
  companyName: string;
  daysLeft: number;
  frontendUrl: string;
}): string {
  return baseLayout(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#f59e0b;">Seu trial está acabando</h2>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
      O período de teste da empresa <strong>${input.companyName}</strong> expira em <strong>${input.daysLeft} dia${input.daysLeft > 1 ? 's' : ''}</strong>.
    </p>
    <p style="margin:0 0 12px;color:#3f3f46;font-size:15px;line-height:1.6;">
      Para continuar usando o Crivo sem interrupção, escolha um plano agora:
    </p>
    ${button('Ver planos', `${input.frontendUrl}/plans`)}
  `);
}
