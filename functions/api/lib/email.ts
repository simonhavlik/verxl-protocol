// Verxl transactional email shell.
// Same language as the site: ink, mint, hairlines, square geometry, no images.
// Table-based and inline-styled for email clients.

export interface VerxlEmailOptions {
  preheader: string;
  eyebrow: string;
  title1: string;
  title2: string;
  intro: string;
  code?: string;
  bodyHtml?: string;
  footerNote?: string;
}

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "Menlo, Consolas, 'Courier New', monospace";
const INK = "#070A0F";
const SURFACE = "#0B1117";
const CODE_BG = "#080C12";
const HAIRLINE = "#1C262C";
const MINT = "#B8F6DD";
const STEEL = "#8FA39B";
const SOFT = "#8B989E";
const MUTED = "#65737B";
const BONE = "#F3F6F5";

export function renderVerxlEmail({ preheader, eyebrow, title1, title2, intro, code, bodyHtml, footerNote }: VerxlEmailOptions): string {
  const codeBlock = code
    ? `
            <tr>
              <td style="padding: 0 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CODE_BG};border:1px solid rgba(184,246,221,0.32);">
                  <tr>
                    <td align="center" style="padding:18px 12px;font-family:${MONO};font-size:30px;line-height:1.1;letter-spacing:7px;color:${MINT};mso-line-height-rule:exactly;">
                      ${esc(code)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
    : "";

  const bodyBlock = bodyHtml
    ? `
            <tr>
              <td style="padding: 18px 24px 0 24px;font-family:${FONT};font-size:13px;line-height:1.65;color:${SOFT};">
                ${bodyHtml}
              </td>
            </tr>`
    : "";

  const footerNoteBlock = footerNote
    ? `
            <tr>
              <td style="padding: 20px 24px 0 24px;">
                <div style="border-top:1px solid ${HAIRLINE};padding-top:14px;font-family:${MONO};font-size:9px;line-height:1.6;color:${MUTED};">
                  ${esc(footerNote)}
                </div>
              </td>
            </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Verxl Protocol</title>
</head>
<body style="margin:0;padding:0;background:${INK};-webkit-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${esc(preheader)}&#8199;&#65279;&#8199;&#65279;&#8199;&#65279;&#8199;&#65279;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${INK}" style="background:${INK};">
    <tr>
      <td align="center" style="padding:32px 16px 40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:${SURFACE};border:1px solid ${HAIRLINE};border-collapse:collapse;">
          <tr>
            <td style="height:2px;background:${MINT};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:20px 24px 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:30px;height:30px;border:1px solid ${MINT};text-align:center;vertical-align:middle;font-family:${FONT};font-size:15px;font-weight:700;color:${MINT};">V</td>
                        <td style="padding-left:9px;font-family:${FONT};font-size:15px;font-weight:600;color:${BONE};letter-spacing:-0.2px;">Verxl</td>
                        <td style="padding-left:7px;padding-top:2px;font-family:${MONO};font-size:6.5px;letter-spacing:1.4px;color:${MUTED};">PROTOCOL</td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="font-family:${MONO};font-size:7px;letter-spacing:1.4px;color:${MINT};">SEPOLIA TEST RUN</td>
                </tr>
              </table>
              <div style="border-top:1px solid ${HAIRLINE};margin-top:18px;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 0 24px;">
              <div style="font-family:${MONO};font-size:8px;letter-spacing:1.6px;color:${MINT};">
                &#9632;&nbsp; ${esc(eyebrow)}
              </div>
              <h1 style="margin:14px 0 0 0;font-family:${FONT};font-size:30px;line-height:1.04;font-weight:500;letter-spacing:-1.2px;color:${BONE};mso-line-height-rule:exactly;">
                ${esc(title1)}<br><span style="color:${STEEL};">${esc(title2)}</span>
              </h1>
              <p style="margin:14px 0 0 0;font-family:${FONT};font-size:13px;line-height:1.65;color:${SOFT};">
                ${esc(intro)}
              </p>
            </td>
          </tr>

          ${codeBlock}
          ${bodyBlock}
          ${footerNoteBlock}

          <tr>
            <td style="padding:22px 24px 20px 24px;">
              <div style="border-top:1px solid ${HAIRLINE};padding-top:12px;font-family:${MONO};font-size:9px;line-height:1.7;color:${MUTED};">
                Verxl Protocol · Prague · Sepolia test run<br>
                This is a demonstration; not mainnet.<br>
                <span style="color:${STEEL};">me@simonhavlik.com</span> · <span style="color:${STEEL};">verxl.com</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
