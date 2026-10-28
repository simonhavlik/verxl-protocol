// SMTPS client using Cloudflare Workers raw TCP sockets (cloudflare:sockets)
// Port 465 SSL connection to smtp.seznam.cz
import { connect } from "cloudflare:sockets";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  smtpUser?: string;
  smtpPass?: string;
  smtpHost?: string;
  smtpPort?: number;
}

async function readUntilDelimiter(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  buffer: { text: string }
): Promise<string> {
  const decoder = new TextDecoder();
  while (!buffer.text.includes("\r\n")) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer.text += decoder.decode(value, { stream: true });
  }
  const idx = buffer.text.indexOf("\r\n");
  if (idx !== -1) {
    const line = buffer.text.substring(0, idx);
    buffer.text = buffer.text.substring(idx + 2);
    return line;
  }
  const remaining = buffer.text;
  buffer.text = "";
  return remaining;
}

async function readSmtpResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  buffer: { text: string }
): Promise<{ code: number; raw: string }> {
  let full = "";
  let lastCode = 0;
  while (true) {
    const line = await readUntilDelimiter(reader, buffer);
    full += line + "\n";
    if (line.length >= 3) {
      const code = parseInt(line.substring(0, 3), 10);
      lastCode = code;
      const sep = line.charAt(3);
      if (sep === " " || sep === "") {
        break;
      }
    } else {
      break;
    }
  }
  return { code: lastCode, raw: full };
}

async function writeSmtpCommand(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  command: string
): Promise<void> {
  const encoder = new TextEncoder();
  await writer.write(encoder.encode(command + "\r\n"));
}

export async function sendEmailDirect({
  to,
  subject,
  html,
  from = "automated@verxl.com",
  smtpUser = "automated@verxl.com",
  smtpPass = "",
  smtpHost = "smtp.seznam.cz",
  smtpPort = 465,
}: SendMailOptions): Promise<{ success: boolean; log: string }> {
  if (!smtpPass) {
    return { success: false, log: "SMTP password is not configured." };
  }

  const buffer = { text: "" };
  let sessionLog = "";

  try {
    const socket = connect(
      { hostname: smtpHost, port: smtpPort },
      { secureTransport: "on", allowHalfOpen: false }
    );

    const writer = socket.writable.getWriter();
    const reader = socket.readable.getReader();

    // 1. Initial Greeting (220)
    const greeting = await readSmtpResponse(reader, buffer);
    sessionLog += `GREET: ${greeting.code}\n`;
    if (greeting.code !== 220) {
      throw new Error(`Invalid greeting: ${greeting.raw}`);
    }

    // 2. EHLO
    await writeSmtpCommand(writer, "EHLO verxl.com");
    const ehlo = await readSmtpResponse(reader, buffer);
    sessionLog += `EHLO: ${ehlo.code}\n`;
    if (ehlo.code !== 250) {
      throw new Error(`EHLO failed: ${ehlo.raw}`);
    }

    // 3. AUTH LOGIN
    await writeSmtpCommand(writer, "AUTH LOGIN");
    const authPrompt1 = await readSmtpResponse(reader, buffer);
    if (authPrompt1.code !== 334) {
      throw new Error(`AUTH LOGIN rejected: ${authPrompt1.raw}`);
    }

    // 4. Send base64 username
    await writeSmtpCommand(writer, btoa(smtpUser));
    const authPrompt2 = await readSmtpResponse(reader, buffer);
    if (authPrompt2.code !== 334) {
      throw new Error(`Username rejected: ${authPrompt2.raw}`);
    }

    // 5. Send base64 password
    await writeSmtpCommand(writer, btoa(smtpPass));
    const authResult = await readSmtpResponse(reader, buffer);
    sessionLog += `AUTH: ${authResult.code}\n`;
    if (authResult.code !== 235) {
      throw new Error(`Auth failed: ${authResult.raw}`);
    }

    // 6. MAIL FROM
    await writeSmtpCommand(writer, `MAIL FROM:<${from}>`);
    const mailFrom = await readSmtpResponse(reader, buffer);
    if (mailFrom.code !== 250) {
      throw new Error(`MAIL FROM failed: ${mailFrom.raw}`);
    }

    // 7. RCPT TO
    await writeSmtpCommand(writer, `RCPT TO:<${to}>`);
    const rcptTo = await readSmtpResponse(reader, buffer);
    if (rcptTo.code !== 250) {
      throw new Error(`RCPT TO failed: ${rcptTo.raw}`);
    }

    // 8. DATA
    await writeSmtpCommand(writer, "DATA");
    const dataResp = await readSmtpResponse(reader, buffer);
    if (dataResp.code !== 354) {
      throw new Error(`DATA rejected: ${dataResp.raw}`);
    }

    // 9. Send headers and body
    const rawMessage = [
      `From: "Verxl Protocol" <${from}>`,
      `To: <${to}>`,
      `Subject: ${subject}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@verxl.com>`,
      `Auto-Submitted: auto-generated`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      html,
      `.`,
    ].join("\r\n");

    await writeSmtpCommand(writer, rawMessage);
    const sent = await readSmtpResponse(reader, buffer);
    sessionLog += `DATA_SENT: ${sent.code}\n`;
    if (sent.code !== 250) {
      throw new Error(`Send failed: ${sent.raw}`);
    }

    // 10. QUIT
    await writeSmtpCommand(writer, "QUIT");
    writer.releaseLock();
    reader.releaseLock();
    socket.close();

    return { success: true, log: sessionLog };
  } catch (err: any) {
    return { success: false, log: `${sessionLog} ERROR: ${err.message}` };
  }
}
