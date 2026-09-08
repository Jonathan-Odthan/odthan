import { prisma, NotificationType } from "@odthan/database";
import { sendEmail } from "./providers/email";
import { sendWhatsAppMessage } from "./providers/whatsapp";

export type NotificationEvent =
  | "NEW_BUSINESS_PROJECT"
  | "NEW_AUTO_LEAD"
  | "NEW_PAYMENT"
  | "NEW_COMMISSION"
  | "STATUS_CHANGE"
  | "NEW_DOCUMENT"
  | "NEW_MESSAGE";

interface NotifyParams {
  userId: string;
  event: NotificationEvent;
  title: string;
  body: string;
  channels?: NotificationType[]; // par défaut : IN_APP uniquement
  emailTo?: string;
  whatsappTo?: string;
}

/**
 * Point d'entrée unique pour toutes les notifications ODTHAN.
 * Enregistre toujours une notification IN_APP en base, et déclenche
 * en plus EMAIL / WHATSAPP si demandé et configuré.
 */
export async function notify(params: NotifyParams) {
  const channels = params.channels ?? ["IN_APP"];

  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: "IN_APP",
      title: params.title,
      body: params.body,
    },
  });

  if (channels.includes("EMAIL") && params.emailTo) {
    await sendEmail({ to: params.emailTo, subject: params.title, html: `<p>${params.body}</p>` });
  }

  if (channels.includes("WHATSAPP") && params.whatsappTo) {
    await sendWhatsAppMessage({ to: params.whatsappTo, message: `${params.title}\n${params.body}` });
  }
}
