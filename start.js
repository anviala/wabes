import { spawn } from "child_process";
import { log } from "./lib/logger.js";

(function start() {
  const anviala = spawn(process.argv0, ["index.js", ...process.argv.slice(2)], {
    stdio: ["inherit", "inherit", "inherit", "ipc"]
  });

  anviala.on("message", (msg) => {
    if (msg === "restart") {
      log.warn("Bot dimulai ulang...");
      anviala.kill();
      anviala.once("close", start);
    }
  });

  anviala.on("exit", (code) => {
    if (code !== 0) {
      log.info(`Bot berhenti dengan kode ${code}. Mencoba mulai ulang...`);
      start();
    }
  });

  anviala.on("error", (err) => {
    log.info(`Gagal menjalankan bot: ${err.message || err}`);
  });
})();