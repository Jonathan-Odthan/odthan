/**
 * Intégration WhatsApp Business API.
 *
 * RÈGLE IMPORTANTE :
 * Si aucune clé n'est configurée, cette fonction NE SIMULE PAS d'envoi.
 * Elle journalise l'événement et retourne silencieusement, sans jamais
 * faire planter l'application.
 */
export async function sendWhatsAppMessage(params: {
  to: string;
  message: string;
  templateName?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.warn(
      `[notifications:whatsapp] Envoi ignoré (non configuré) → destinataire=${params.to}`
    );
    return { sent: false, reason: "WHATSAPP_NOT_CONFIGURED" };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.to,
        type: "text",
        text: { body: params.message },
      }),
    });

    if (!response.ok) {
      console.error(`[notifications:whatsapp] Échec API: ${response.status}`);
      return { sent: false, reason: `API_ERROR_${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[notifications:whatsapp] Erreur d'envoi", error);
    return { sent: false, reason: "NETWORK_ERROR" };
  }
}
