require("dotenv").config();
const readline = require("readline");
const db = require("../lib/db");
const { hashPassword } = require("../lib/security");

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    if (!hidden) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
      return;
    }
    process.stdout.write(question);
    let buffer = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    const onData = (char) => {
      if (char === "\n" || char === "\r" || char === "\u0004") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(buffer);
      } else if (char === "\u0003") {
        process.exit(1);
      } else if (char === "\u007f") {
        buffer = buffer.slice(0, -1);
      } else {
        buffer += char;
      }
    };
    process.stdin.on("data", onData);
  });
}

async function main() {
  console.log("=== Creation du premier SUPER_ADMIN — Odthan Admin Center ===\n");
  const email = await ask("Email : ");
  const firstName = await ask("Prenom : ");
  const lastName = await ask("Nom : ");
  const password = await ask("Mot de passe (8 caracteres min, saisie masquee) : ", true);

  if (!email.includes("@") || password.length < 8) {
    console.error("Email ou mot de passe invalide.");
    process.exit(1);
  }

  const { rows: existing } = await db.query(`SELECT id FROM admin_profiles WHERE email = $1`, [email]);
  if (existing.length > 0) {
    console.error("Un utilisateur avec cet email existe deja.");
    process.exit(1);
  }

  const { rows: roleRows } = await db.query(`SELECT id FROM roles WHERE name = 'SUPER_ADMIN'`);
  if (roleRows.length === 0) {
    console.error("Le role SUPER_ADMIN n'existe pas encore. Lance d'abord `npm run seed`.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  await db.query(
    `INSERT INTO admin_profiles (first_name, last_name, email, password_hash, role_id, status)
     VALUES ($1,$2,$3,$4,$5,'ACTIVE')`,
    [firstName, lastName, email, passwordHash, roleRows[0].id]
  );

  console.log(`\nSUPER_ADMIN cree avec succes : ${email}`);
  console.log("Connecte-toi sur /admin/login.html");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
