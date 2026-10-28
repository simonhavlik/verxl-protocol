// IMAP SSL client using Cloudflare raw TCP sockets (cloudflare:sockets)
// Fetches recent incoming emails for automated@verxl.com from imap.seznam.cz:993
import { connect } from "cloudflare:sockets";

interface InboundEmail {
  uid: string;
  from: string;
  subject: string;
  date: string;
  body: string;
}

export async function fetchRecentEmailsFromSeznam(
  filterFromEmail?: string
): Promise<InboundEmail[]> {
  const emails: InboundEmail[] = [];

  try {
    const socket = connect(
      { hostname: "imap.seznam.cz", port: 993 },
      { secureTransport: "on", allowHalfOpen: false }
    );

    const writer = socket.writable.getWriter();
    const reader = socket.readable.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let buffer = "";

    const readLine = async (): Promise<string> => {
      while (!buffer.includes("\r\n")) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }
      const idx = buffer.indexOf("\r\n");
      if (idx !== -1) {
        const line = buffer.substring(0, idx);
        buffer = buffer.substring(idx + 2);
        return line;
      }
      const rem = buffer;
      buffer = "";
      return rem;
    };

    const sendCmd = async (tag: string, cmd: string): Promise<string[]> => {
      await writer.write(encoder.encode(`${tag} ${cmd}\r\n`));
      const lines: string[] = [];
      while (true) {
        const line = await readLine();
        lines.push(line);
        if (line.startsWith(`${tag} OK`) || line.startsWith(`${tag} NO`) || line.startsWith(`${tag} BAD`)) {
          break;
        }
      }
      return lines;
    };

    // 1. Initial Greeting
    await readLine();

    // 2. Login
    await sendCmd("t1", "LOGIN automated@verxl.com ***REMOVED***");

    // 3. Select INBOX
    const selectLines = await sendCmd("t2", "SELECT INBOX");
    let existsCount = 0;
    for (const l of selectLines) {
      const match = l.match(/\*\s+(\d+)\s+EXISTS/i);
      if (match) existsCount = parseInt(match[1], 10);
    }

    if (existsCount > 0) {
      // Fetch headers of the last min(existsCount, 15) messages
      const startSeq = Math.max(1, existsCount - 15);
      const fetchLines = await sendCmd(
        "t3",
        `FETCH ${startSeq}:${existsCount} (UID ENVELOPE BODY[TEXT])`
      );

      // Parse envelope responses
      let currentMsg: Partial<InboundEmail> = {};
      let inBody = false;
      let bodyAcc = "";

      for (const line of fetchLines) {
        if (line.includes("FETCH (UID")) {
          const uidMatch = line.match(/UID\s+(\d+)/i);
          const fromMatch = line.match(/envelope\s+\([^)]*?([^\s"()<>]+\@[^\s"()<>]+\.[^\s"()<>]+)/i) || line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          const subjMatch = line.match(/"([^"]+)"/);

          if (currentMsg.from && currentMsg.subject) {
            emails.push({
              uid: currentMsg.uid || Math.random().toString(),
              from: currentMsg.from,
              subject: currentMsg.subject,
              date: currentMsg.date || new Date().toISOString(),
              body: bodyAcc.trim() || "(Empty message content)",
            });
          }

          currentMsg = {
            uid: uidMatch ? uidMatch[1] : undefined,
            from: fromMatch ? fromMatch[1].toLowerCase() : "unknown@provider.com",
            subject: subjMatch ? subjMatch[1] : "Message to Verxl Agent",
            date: new Date().toISOString(),
          };
          bodyAcc = "";
          inBody = true;
        } else if (line.startsWith("t3 OK")) {
          if (currentMsg.from && currentMsg.subject) {
            emails.push({
              uid: currentMsg.uid || Math.random().toString(),
              from: currentMsg.from,
              subject: currentMsg.subject,
              date: currentMsg.date || new Date().toISOString(),
              body: bodyAcc.trim() || "(Empty message content)",
            });
          }
          break;
        } else if (inBody) {
          bodyAcc += line + "\n";
        }
      }
    }

    // 4. Logout
    await sendCmd("t4", "LOGOUT");
    try {
      writer.releaseLock();
      reader.releaseLock();
      await socket.close();
    } catch {}
  } catch (err) {
    console.warn("IMAP sync note:", err);
  }

  if (filterFromEmail) {
    const fLower = filterFromEmail.toLowerCase();
    return emails.filter((e) => e.from.includes(fLower));
  }
  return emails;
}
