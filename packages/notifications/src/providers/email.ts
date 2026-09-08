/**
 * Envoi d'email transactionnel. Nécessite EMAIL_API_KEY.
 * Si absent, journalise et ne fait pas planter l'application.
 * Compatible avec un prestataire type Resend/SendGrid/Postmark —
 * adapter le corps de la requête au prestataire choisi.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM ?? "no-reply@odthan.com";

  if (!apiKey) {
    console.warn(`[notifications:email] Envoi ignoré (non configuré) → destinataire=${params.to}`);
    return { sent: false, reason: "EMAIL_NOT_CONFIGURED" };
  }

  try {
    // Exemple générique compatible Resend. Adapter l'URL/le body
    // si un autre prestataire est choisi.
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!response.ok) {
      console.error(`[notifications:email] Échec API: ${response.status}`);
      return { sent: false, reason: `API_ERROR_${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[notifications:email] Erreur d'envoi", error);
    return { sent: false, reason: "NETWORK_ERROR" };
  }
}
