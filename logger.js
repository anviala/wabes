const color = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  fg: {
    white: "\x1b[97m",
    gray: "\x1b[90m",
    blue: "\x1b[94m",
    green: "\x1b[92m",
    yellow: "\x1b[93m",
    red: "\x1b[91m"
  }
};

const centerText = (text, width = 9) => {
  const len = text.length;
  const padTotal = width - len;
  const padStart = Math.floor(padTotal / 2);
  const padEnd = padTotal - padStart;
  return " ".repeat(padStart) + text + " ".repeat(padEnd);
};

const highlightNumbers = (text) => {
  return String(text).replace(/\d+(\.\d+)?/g, (match) => {
    return `${color.bold}${color.fg.gray}${match}${color.reset}${color.fg.white}`;
  });
};

const formatLog = (label, message, labelColor) => {
  const paddedLabel = centerText(label.toUpperCase(), 9);
  const labelText = `${labelColor}${color.bold}[${paddedLabel}]${color.reset}`;
  const formattedMessage =
    typeof message === "string"
      ? `${color.fg.white}${highlightNumbers(message)}${color.reset}`
      : message;

  console.log(`${labelText} ${formattedMessage}`);
};

export const log = {
  info:    (msg) => formatLog("INFO",    msg, color.fg.blue),
  success: (msg) => formatLog("SUCCESS", msg, color.fg.green),
  warn:    (msg) => formatLog("WARNING", msg, color.fg.yellow),
  error:   (msg) => formatLog("ERROR",   msg, color.fg.red),
};