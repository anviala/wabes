import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import pino from "pino";
import readline from "readline";
import fs from "fs";
import { log } from "./lib/logger.js";

function question(text = "Masukkan input") {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(`\x1b[32;1m?\x1b[0m \x1b[1m${text}\x1b[0m `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

(async function start(usePairingCode = true) {
  const session = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    printQRInTerminal: !usePairingCode,
    auth: session.state,
    logger: pino({ level: "silent" }).child({ level: "silent" })
  });

  if (usePairingCode && !sock.user && !sock.authState.creds.registered) {
    const confirm = await question("Gunakan pairing code? [Y/n]: ");
    usePairingCode = confirm.toLowerCase() !== "n";
    if (!usePairingCode) return start(false);

    const waNumber = await question("Nomor WhatsApp Anda (tanpa +): ");
    const code = await sock.requestPairingCode(waNumber.replace(/\D/g, ""));
    log.info(`Kode pairing Anda: ${code}`);
  }

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const message = lastDisconnect?.error?.message || "Koneksi terputus.";
      log.error(`Terputus dari server: ${message}`);

      const { statusCode, error: err } = lastDisconnect?.error?.output?.payload || {};
      if (statusCode === 401 && err === "Unauthorized") {
        await fs.promises.rm("session", { recursive: true, force: true });
      }

      return start();
    }

    if (connection === "open") {
      const userNumber = sock.user.id.split(":")[0];
      log.success(`Berhasil terhubung sebagai ${userNumber}`);
    }
  });

  sock.ev.on("creds.update", session.saveCreds);
})();