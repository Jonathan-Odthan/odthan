// Procedure securisee de creation du premier SUPER_ADMIN.
// Usage : npm run create-super-admin
// Le mot de passe est lu de facon interactive (jamais passe en argument
// de ligne de commande, pour eviter qu'il reste dans l'historique shell).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline/promises";
import { stdin, stdout } from "process";

const prisma = new PrismaClient();

async function prompt(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  if (!hidden) {
    const answer = await rl.question(question);
    rl.close();
    return answer.trim();
  }

  // Saisie masquee simple pour le mot de passe.
  return new Promise((resolve) => {
    stdout.write(question);
    const onData = (char: Buffer) => {
      const c = char.toString("utf8");
      if (c === "\n" || c === "\r" || c === "\u0004") {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        stdout.write("\n");
        rl.close();
        resolve(buffer);
      } else if (c === "\u0003") {
        process.exit(1);
      } else if (c === "\u007f") {
        buffer = buffer.slice(0, -1);
      } else {
        buffer += c;
      }
    };
    let buffer = "";
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

async function main() {
  console.log("=== Creation du premier SUPER_ADMIN — Odthan Admin Center ===\n");

  const email = await prompt("Email : ");
  const firstName = await prompt("Prenom : ");
  const lastName = await prompt("Nom : ");
  const password = await prompt("Mot de passe (8 caracteres min, saisie masquee) : ", true);

  if (!email.includes("@") || password.length < 8) {
    console.error("Email ou mot de passe invalide.");
    process.exit(1);
  }

  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    console.error("Un utilisateur avec cet email existe deja.");
    process.exit(1);
  }

  const role = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  if (!role) {
    console.error("Le role SUPER_ADMIN n'existe pas encore. Lancez d'abord `npm run db:seed`.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.profile.create({
    data: { email, firstName, lastName, passwordHash, roleId: role.id, status: "ACTIVE" },
  });

  console.log(`\nSUPER_ADMIN cree avec succes : ${user.email}`);
  console.log("Vous pouvez maintenant vous connecter sur /login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
