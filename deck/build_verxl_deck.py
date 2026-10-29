from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.dml import MSO_LINE_DASH_STYLE
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION, XL_TICK_MARK
from pptx.chart.data import CategoryChartData
import os
import math

INK = RGBColor(0x07, 0x0A, 0x0F)
CARD = RGBColor(0x0B, 0x11, 0x17)
CARD2 = RGBColor(0x0D, 0x14, 0x1B)
LINE = RGBColor(0x1C, 0x26, 0x2C)
LINE2 = RGBColor(0x27, 0x34, 0x3A)
MINT = RGBColor(0xB8, 0xF6, 0xDD)
MINT_DIM = RGBColor(0x7F, 0xAE, 0x9D)
STEEL = RGBColor(0x8F, 0xA3, 0x9B)
MUTED = RGBColor(0x65, 0x73, 0x7B)
SOFT = RGBColor(0x8B, 0x98, 0x9E)
WHITE = RGBColor(0xF3, 0xF6, 0xF5)
ROSE = RGBColor(0xD9, 0x9A, 0x9A)

TITLE = "Helvetica Neue"
BODY = "Helvetica Neue"
MONO = "Menlo"
SW, SH = 13.333, 7.5
BASE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BASE, "assets")
TOTAL = 14

prs = Presentation()
prs.slide_width = Inches(SW)
prs.slide_height = Inches(SH)
prs.core_properties.title = "Verxl Protocol — Inference that settles"
prs.core_properties.author = "Verxl Protocol / VŠE Praha"
prs.core_properties.subject = "Private, fast and affordable inference clearing. Sepolia demonstration."
prs.core_properties.language = "en-GB"


def bg(slide):
    r = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(SW), Inches(SH))
    r.fill.solid(); r.fill.fore_color.rgb = INK; r.line.fill.background()
    return r


def rect(slide, x, y, w, h, fill=None, line=None, lw=0.75):
    r = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None:
        r.fill.background()
    else:
        r.fill.solid(); r.fill.fore_color.rgb = fill
    if line is None:
        r.line.fill.background()
    else:
        r.line.color.rgb = line; r.line.width = Pt(lw)
    return r


def hline(slide, x, y, w, color=LINE, h=0.012):
    r = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    r.fill.solid(); r.fill.fore_color.rgb = color; r.line.fill.background()
    return r


def vline(slide, x, y, h, color=LINE, w=0.012):
    r = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    r.fill.solid(); r.fill.fore_color.rgb = color; r.line.fill.background()
    return r


def dot(slide, x, y, d, fill=MINT, line=None):
    c = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    if fill is None:
        c.fill.background()
    else:
        c.fill.solid(); c.fill.fore_color.rgb = fill
    if line is None:
        c.line.fill.background()
    else:
        c.line.color.rgb = line; c.line.width = Pt(0.9)
    return c


def line(slide, x1, y1, x2, y2, color=LINE, lw=0.8, dash=None):
    ln = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    ln.line.color.rgb = color; ln.line.width = Pt(lw)
    if dash:
        ln.line.dash_style = dash
    return ln


def txt(slide, x, y, w, h, text, size=12, color=WHITE, font=BODY, bold=False,
        align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.18, after=0,
        italic=False, margins=(0, 0, 0, 0), caps=False):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left, tf.margin_right, tf.margin_top, tf.margin_bottom = [Inches(m) for m in margins]
    tf.vertical_anchor = anchor
    lines = str(text).split("\n")
    for i, body in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.line_spacing = spacing
        p.space_before = Pt(0); p.space_after = Pt(after)
        r = p.add_run(); r.text = body.upper() if caps else body
        r.font.name = font; r.font.size = Pt(size); r.font.bold = bold; r.font.italic = italic
        r.font.color.rgb = color
    return tb


def title(slide, line1, line2=None, y=1.0, size=42, spacing=0.94, width=12.0):
    tb = slide.shapes.add_textbox(Inches(0.65), Inches(y), Inches(width), Inches(1.75))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.TOP
    for i, (body, color) in enumerate([(line1, WHITE), (line2, STEEL)]):
        if body is None:
            continue
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.line_spacing = spacing; p.space_before = Pt(0); p.space_after = Pt(0)
        r = p.add_run(); r.text = body
        r.font.name = TITLE; r.font.size = Pt(size); r.font.color.rgb = color
    return tb


def eyebrow(slide, text, x=0.65, y=1.0, color=MINT):
    dot(slide, x, y + 0.055, 0.055, color)
    txt(slide, x + 0.14, y, 6.5, 0.2, text, 8, MUTED, MONO, caps=True)


def chrome(slide, section, page):
    hline(slide, 0.65, 0.62, 12.03, LINE)
    txt(slide, 0.65, 0.40, 7.0, 0.18, f"VERXL  /  {section}", 7.5, MUTED, MONO, caps=True)
    txt(slide, 7.0, 0.40, 5.68, 0.18, "VŠE PRAHA  ·  SEPOLIA TEST RUN", 7.5, MUTED, MONO, align=PP_ALIGN.RIGHT, caps=True)
    hline(slide, 0.65, 7.02, 12.03, LINE)
    txt(slide, 0.65, 7.12, 5.0, 0.16, "VERXL PROTOCOL  /  PRIVATE  ·  FAST  ·  AFFORDABLE", 6.5, MUTED, MONO, caps=True)
    txt(slide, 9.3, 7.12, 3.38, 0.16, f"{page:02d}  /  {TOTAL:02d}", 7, MUTED, MONO, align=PP_ALIGN.RIGHT)


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def label(slide, x, y, w, text, color=MUTED, size=7.2):
    txt(slide, x, y, w, 0.18, text, size, color, MONO, caps=True)


def metric(slide, x, y, w, value, unit, caption, color=WHITE):
    txt(slide, x, y, w, 0.45, value + unit, 26, color, TITLE, spacing=0.95)
    txt(slide, x, y + 0.45, w, 0.2, caption, 7, MUTED, MONO, caps=True)


def add_image(slide, path, x, y, w, h, border=True):
    pic = slide.shapes.add_picture(path, Inches(x), Inches(y), Inches(w), Inches(h))
    if border:
        rect(slide, x, y, w, h, None, LINE, 0.7)
    return pic


# ---------------------------------------------------------------- 01 COVER
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
# mark
line(s, 0.65, 0.46, 0.79, 0.68, MINT, 2.2)
line(s, 0.79, 0.68, 0.93, 0.46, MINT, 2.2)
txt(s, 1.02, 0.42, 2.0, 0.28, "Verxl", 15, WHITE, TITLE, bold=True)
txt(s, 2.05, 0.44, 3.0, 0.2, "PROTOCOL", 7, MUTED, MONO, caps=True)
txt(s, 8.6, 0.42, 4.08, 0.22, "VŠE PRAHA  ·  APPLIED BLOCKCHAIN  ·  2026", 7.2, MUTED, MONO, align=PP_ALIGN.RIGHT, caps=True)
hline(s, 0.65, 7.02, 12.03, LINE)
txt(s, 0.65, 7.12, 5.0, 0.16, "SEPOLIA TEST RUN  /  NOT MAINNET", 6.8, MINT_DIM, MONO, caps=True)
txt(s, 9.6, 7.12, 3.08, 0.16, "01  /  14", 7, MUTED, MONO, align=PP_ALIGN.RIGHT)

txt(s, 0.65, 1.95, 9.1, 0.25, "PRIVATE  ·  FAST  ·  AFFORDABLE INFERENCE CLEARING", 8, MINT, MONO, caps=True)
txt(s, 0.65, 2.35, 9.4, 1.25, "Inference", 66, WHITE, TITLE, spacing=0.9)
txt(s, 0.65, 3.32, 9.4, 1.25, "that settles.", 66, STEEL, TITLE, spacing=0.9)
txt(s, 0.65, 4.72, 6.2, 0.7,
    "A private, fast and affordable API and chat layer for AI.\nNot a model lab. Not a cloud. Not a data broker.",
    14.5, SOFT, BODY, spacing=1.35)

# cover spine
sx = 10.62
vline(s, sx, 1.55, 4.65, LINE2, 0.014)
for i, (name, sub, yy, active) in enumerate([
    ("CLIENT", "browser", 1.62, False),
    ("EU EDGE", "Cloudflare", 2.78, False),
    ("PRAGUE", "bare metal", 3.94, True),
    ("ARBITRUM", "USDC settlement", 5.10, False),
]):
    if active:
        dot(s, sx - 0.11, yy - 0.02, 0.22, MINT)
        dot(s, sx - 0.055, yy + 0.035, 0.11, INK)
    else:
        dot(s, sx - 0.075, yy + 0.02, 0.15, INK, LINE2)
    txt(s, sx + 0.22, yy - 0.06, 1.9, 0.2, name, 7.5, WHITE if active else SOFT, MONO, caps=True)
    txt(s, sx + 0.22, yy + 0.12, 2.2, 0.18, sub, 7, MUTED, MONO)
txt(s, sx - 0.02, 5.95, 2.4, 0.45, "50 bps", 24, MINT, TITLE, spacing=0.9)
txt(s, sx - 0.02, 6.40, 2.4, 0.18, "PROTOCOL TAKE", 6.5, MUTED, MONO, caps=True)
notes(s, """This deck is the short version of the Verxl project. The one sentence: Verxl is a private, fast and affordable clearing layer for AI inference, built as an applied blockchain project at VŠE Praha. It is not a model lab, not a cloud and not a data broker. The demonstration runs on Ethereum Sepolia. The fee is 50 bps; providers keep 99.5% in USDC on Arbitrum. The deck is written so it can be read without a speaker: each slide carries its own argument and the notes carry the detail, the method and the caveats. The final slide has the contact and the source repository.""")

# ---------------------------------------------------------------- 02 TRADE-OFF
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "01  /  THE TRADE-OFF", 2)
eyebrow(s, "The market")
title(s, "Private. Fast. Affordable.", "The market says pick two.", y=1.25, size=40)
txt(s, 0.65, 3.18, 5.55, 1.55,
    "Aggregators bundle inference with 840–1,040 bps of fee drag. Privacy is a policy, not an architecture. Speed is a queue. The user pays for all three and is allowed to choose one.",
    13.2, SOFT, BODY, spacing=1.38, after=6)
txt(s, 0.65, 4.95, 5.55, 0.85,
    "Verxl starts from the opposite direction: keep the plaintext in the browser, keep the compute in Prague, and settle the fee on-chain. The three properties become one design problem.",
    12.2, MUTED, BODY, spacing=1.35)
# right rows
rows = [
    ("PRIVATE", "a policy, not an architecture"),
    ("FAST", "a queue, not bare metal"),
    ("AFFORDABLE", "840–1,040 bps, not 50"),
]
for i, (a, b) in enumerate(rows):
    yy = 3.18 + i * 0.86
    hline(s, 6.55, yy, 6.12, LINE)
    txt(s, 6.55, yy + 0.12, 2.0, 0.22, a, 8, MINT_DIM, MONO, caps=True)
    txt(s, 8.55, yy + 0.10, 4.12, 0.25, b, 12, SOFT, BODY, align=PP_ALIGN.RIGHT)
hline(s, 6.55, 5.72, 6.12, LINE)
hline(s, 0.65, 6.08, 12.03, LINE)
metric(s, 0.65, 6.20, 3.6, "840–1,040", " bps", "Incumbent fee drag")
metric(s, 4.25, 6.20, 3.6, "50", " bps", "Verxl protocol take", MINT)
metric(s, 7.85, 6.20, 4.0, "99.5", "%", "Paid to providers", MINT)
notes(s, """The inference market has a familiar shape. Access is bundled with a data policy, a cloud bill and a margin. The public aggregator range used on the Verxl site is 840–1,040 bps of fee drag; 950 bps is the midpoint used in the fee calculator. That is not a claim about every vendor; it is the range the project uses as the incumbent benchmark. Privacy is usually a promise in a policy document, not a property of the data model. Speed is usually a queue behind a control plane. The slide's argument is that these are not three separate products. They are one architecture: where the plaintext lives, where the compute lives, and where the fee settles.""")

# ---------------------------------------------------------------- 03 THESIS
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "02  /  THE THESIS", 3)
eyebrow(s, "The clearing layer")
title(s, "The model is not the product.", "The clearing is.", y=1.25, size=42)
cols = [
    ("01", "ACCESS", "One endpoint. Three models.",
     "An OpenAI-compatible API in front of a small, fixed catalogue. No new SDK, no rewrite, no GPU lock-in.",
     "POST /v1/chat/completions"),
    ("02", "PRIVACY", "Ciphertext at rest.",
     "Chat messages are encrypted in the browser with a wallet-derived key. The database stores ciphertext and metadata, never the message text.",
     "AES-256-GCM  ·  wallet key"),
    ("03", "SETTLEMENT", "USDC on Arbitrum.",
     "The protocol takes 50 bps of compute. Providers keep 99.5%, paid in USDC. The fee is a parameter, not a token.",
     "99.5%  ·  50 bps"),
]
for i, (n, kick, head, body, data) in enumerate(cols):
    x = 0.65 + i * 4.08
    hline(s, x, 3.12, 3.78, LINE)
    txt(s, x, 3.26, 0.3, 0.18, n, 7, MUTED, MONO)
    txt(s, x + 0.38, 3.26, 3.3, 0.18, kick, 7, MINT_DIM, MONO, caps=True)
    txt(s, x, 3.58, 3.55, 0.55, head, 18, WHITE, TITLE, spacing=1.0)
    txt(s, x, 4.25, 3.45, 1.15, body, 11.3, SOFT, BODY, spacing=1.35)
    txt(s, x, 5.52, 3.45, 0.2, data, 8, MINT_DIM, MONO)
hline(s, 0.65, 6.10, 12.03, LINE)
txt(s, 0.65, 6.26, 12.0, 0.3, "One host.  Three models.  One fee.  One boundary.", 15, STEEL, TITLE)
notes(s, """The thesis is deliberately narrow. Verxl does not train a model and does not rent a cloud. It owns the path between a request and a paid answer. Access is an OpenAI-compatible endpoint over three models: Qwen 3.5 4B on the Prague bare-metal host, and DeepSeek V4.1 Flash and MiMo 2.6 Flash through official bridges. Privacy is client-side: a wallet signature derives a key, AES-256-GCM encrypts the chat before it leaves the browser, and Postgres stores ciphertext. Settlement is 50 bps of compute, with 99.5% to the provider, in USDC on Arbitrum. Sepolia is the demonstration chain. The product is the clearing path, not the model weights.""")

# ---------------------------------------------------------------- 04 ARCHITECTURE
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "03  /  ARCHITECTURE", 4)
eyebrow(s, "The route")
title(s, "Where a request clears.", None, y=1.20, size=42)
add_image(s, os.path.join(ASSETS, "map.png"), 0.65, 2.22, 7.45, 4.28, True)
txt(s, 0.65, 6.62, 7.45, 0.2, "Illustrative topology. Not a coverage map, an SLA or a latency guarantee.", 7, MUTED, MONO)
# steps
sx2 = 8.86
vline(s, sx2, 2.30, 3.62, LINE2, 0.014)
steps = [
    ("01", "CLIENT", "Browser  ·  plaintext"),
    ("02", "EU EDGE", "Cloudflare  ·  ciphertext"),
    ("03", "PRAGUE", "Bare metal  ·  compute"),
    ("04", "ARBITRUM", "USDC  ·  settlement"),
]
for i, (n, a, b) in enumerate(steps):
    yy = 2.27 + i * 0.92
    active = a == "PRAGUE"
    dot(s, sx2 - (0.06 if active else 0.045), yy + 0.04, 0.12 if active else 0.09, MINT if active else INK, None if active else LINE2)
    txt(s, sx2 + 0.24, yy - 0.03, 0.3, 0.18, n, 7, MUTED, MONO)
    txt(s, sx2 + 0.55, yy - 0.05, 2.0, 0.2, a, 8, MINT if active else SOFT, MONO, caps=True)
    txt(s, sx2 + 0.55, yy + 0.16, 3.0, 0.18, b, 8, SOFT, BODY)
hline(s, 8.86, 6.02, 3.82, LINE)
txt(s, 8.86, 6.22, 3.82, 0.38, "The edge routes; Prague computes; Arbitrum settles.", 9, MUTED, BODY, spacing=1.25)
notes(s, """This is the whole system in one picture. A request leaves the browser and hits the Cloudflare edge, which routes it; the Qwen host is a single bare-metal machine in Prague. The edge is not a queue and there is no GPU fleet behind it. Settlement happens separately on Arbitrum in USDC. The map is illustrative: the client, edge and compute markers show the path, not a coverage commitment. The browser keeps the plaintext and the key; the edge sees ciphertext; Prague sees the prompt it needs to compute; the chain sees the payment. The relevant caveat is on the slide: this is not an SLA and not a coverage map.""")

# ---------------------------------------------------------------- 05 PRIVACY
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "04  /  PRIVACY", 5)
eyebrow(s, "The boundary")
title(s, "Ciphertext, by default.", None, y=1.20, size=42)
flow = [("01", "personal_sign", "wallet signature"), ("02", "HKDF-SHA256", "derive key"), ("03", "AES-256-GCM", "encrypt in browser")]
for i, (n, a, b) in enumerate(flow):
    x = 0.65 + i * 3.28
    rect(s, x, 2.30, 2.55, 0.88, CARD, LINE)
    hline(s, x, 2.30, 2.55, MINT_DIM, 0.02)
    txt(s, x + 0.16, 2.40, 2.2, 0.18, n + "  /  " + a, 9, WHITE, MONO)
    txt(s, x + 0.16, 2.61, 2.2, 0.18, b, 7.5, MUTED, MONO)
    if i < 2:
        line(s, x + 2.55, 2.74, x + 3.20, 2.74, MINT_DIM, 0.9)
        line(s, x + 3.20, 2.74, x + 3.13, 2.69, MINT_DIM, 0.9)
        line(s, x + 3.20, 2.74, x + 3.13, 2.79, MINT_DIM, 0.9)

txt(s, 0.65, 3.55, 0.45, 0.18, "STORED", 7, MINT_DIM, MONO)
hline(s, 0.65, 3.78, 5.45, LINE)
for i, item in enumerate(["Ciphertext envelope", "Wallet key id", "Timestamps  ·  usage records"]):
    txt(s, 0.65, 3.90 + i * 0.36, 5.3, 0.22, item, 11, SOFT, BODY)
    hline(s, 0.65, 4.16 + i * 0.36, 5.45, LINE)
txt(s, 6.62, 3.55, 0.6, 0.18, "NOT STORED", 7, MINT_DIM, MONO)
hline(s, 6.62, 3.78, 3.55, LINE)
for i, item in enumerate(["Message text", "Conversation titles", "System prompt"]):
    txt(s, 6.62, 3.90 + i * 0.36, 3.4, 0.22, item, 11, SOFT, BODY)
    hline(s, 6.62, 4.16 + i * 0.36, 3.55, LINE)
txt(s, 10.55, 2.10, 2.2, 0.85, "0", 72, MINT, TITLE, spacing=0.8)
txt(s, 10.55, 3.00, 2.1, 0.35, "PLAINTEXT\nAT REST", 7, MUTED, MONO, spacing=1.2, caps=True)
hline(s, 0.65, 5.05, 12.03, LINE)
privacy_points = [
    ("NO PLAINTEXT LOGS", "Ciphertext at rest; no message text or titles."),
    ("NO API-KEY HISTORY", "A Verxl key opens usage, not past chats."),
    ("ANONYMOUS UPSTREAM", "Verxl-held credentials; the provider gets the request, not your key."),
]
for i, (a, b) in enumerate(privacy_points):
    x = 0.65 + i * 4.08
    txt(s, x, 5.20, 3.7, 0.18, f"0{i+1}  /  {a}", 7, MINT_DIM, MONO)
    txt(s, x, 5.42, 3.55, 0.55, b, 8.8, SOFT, BODY, spacing=1.3)
txt(s, 0.65, 6.35, 12.0, 0.35, "The operator still sees account metadata, wallet address and usage. Bridge providers log per policy. Another wallet cannot decrypt the envelopes.", 8.5, MUTED, BODY, spacing=1.3)
notes(s, """The privacy claim is architectural, and it has three parts. First, no plaintext logs: the browser signs with the wallet, derives a key with HKDF-SHA256, encrypts the chat with AES-256-GCM before it leaves the tab, and Postgres stores only the ciphertext envelope, a wallet key id, timestamps and usage records. It does not receive message text, titles or a system prompt. Second, no API-key history: a Verxl API key opens usage and billing; it cannot decrypt a chat or read past conversations, because the chat key never leaves the browser. Third, anonymous upstream: the model provider receives the request under Verxl's credential, not the user's Verxl account key. The honest boundary is on the slide: the operator still sees account metadata, wallet address, usage and envelope size; bridge providers log according to their own policy. Chat is ciphertext-only. The source is the public chatCrypto.ts and conversations API.""")

# ---------------------------------------------------------------- 06 CHAT VS DEFAULTS
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "05  /  CHAT VS DEFAULTS", 6)
eyebrow(s, "The alternative")
title(s, "Chat vs the defaults.", "The Pareto alternative.", y=1.12, size=42)
claims = [
    ("01", "NO PLAINTEXT LOGS", "Ciphertext in the browser; no message text in the database. A Verxl API key cannot open history. Upstream calls use Verxl-held credentials."),
    ("02", "PARETO PRICING", "DeepSeek V4.1 Flash: 74.0 at $0.181 per successful task — the value frontier. Gemini 4 Argon is 11.5× the cost."),
    ("03", "ONE KEY", "One Verxl API. Today: three routes. The approved registry and official bridges per roadmap expand the catalogue."),
    ("04", "MUCH CHEAPER", "Claude Fable 5.1: $6.904; GPT-6 Astra: $4.548; Gemini 4 Argon: $2.073; the Verxl route: $0.181. 50 bps included."),
]
for i, (n, h, b) in enumerate(claims):
    x = 0.65 + i * 3.08
    txt(s, x, 2.55, 0.25, 0.18, n, 7, MUTED, MONO)
    txt(s, x + 0.31, 2.55, 2.6, 0.18, h, 7, MINT_DIM, MONO)
    txt(s, x, 2.78, 2.85, 0.75, b, 8.4, SOFT, BODY, spacing=1.28)

tcols = [0.65, 3.20, 5.15, 6.45, 8.15, 10.35]
theaders = ["MODEL", "ROUTE", "LIVEBENCH", "COST / SUCCESS", "CHAT LOGS", "FRONTIER"]
for x, h in zip(tcols, theaders):
    txt(s, x, 3.65, 2.1, 0.18, h, 6.5, MUTED, MONO, caps=True)
hline(s, 0.65, 3.85, 12.03, LINE2)
rows = [
    ("Claude Fable 5.1", "Anthropic", "85.7", "$6.904", "Provider policy", "Top", False),
    ("GPT-6 Astra", "OpenAI", "85.6", "$4.548", "Provider policy", "—", False),
    ("Gemini 4 Argon", "Google", "79.3", "$2.073", "Provider policy", "—", False),
    ("GPT-6.1 Sol", "OpenAI", "84.1", "$0.761", "Provider policy", "Value", False),
    ("DeepSeek V4.1 Flash", "Verxl bridge", "74.0", "$0.181", "Ciphertext only", "Value", True),
    ("MiMo V2.6 Pro", "Verxl bridge", "68.5", "$0.183", "Ciphertext only", "—", True),
]
for i, (model, route, score, cost, logs, frontier, verxl) in enumerate(rows):
    yy = 3.98 + i * 0.32
    if verxl:
        txt(s, 0.49, yy + 0.08, 0.07, 0.12, "•", 8, MINT, BODY)
    txt(s, 0.65, yy, 2.45, 0.22, model, 8.8, MINT if verxl else WHITE, BODY)
    txt(s, 3.20, yy, 1.8, 0.22, route, 8.2, MINT if verxl else SOFT, BODY)
    txt(s, 5.15, yy, 0.9, 0.22, score, 8.8, MINT if verxl else SOFT, MONO)
    txt(s, 6.45, yy, 1.4, 0.22, cost, 8.8, MINT if verxl else SOFT, MONO)
    txt(s, 8.15, yy, 1.95, 0.22, logs, 7.6, MINT if verxl else MUTED, MONO)
    txt(s, 10.35, yy, 1.6, 0.22, frontier, 7.4, MINT if frontier != "—" else MUTED, MONO)
    hline(s, 0.65, yy + 0.24, 12.03, LINE)
txt(s, 0.65, 6.08, 12.0, 0.55, "LiveBench 2.0 · 25 Oct 2026 · Abacus.AI. Cost per successful task, not a Verxl price guarantee. Verxl adds 50 bps. API bridge requests follow upstream policy; Chat is ciphertext-only. Qwen 3.5 4B is the resident host and is not in this table.", 7, MUTED, BODY, spacing=1.35)
notes(s, """This is the comparison slide, and it has to be read with its boundaries. The four claims: one, no plaintext logs — Verxl Chat is ciphertext in the browser, the database has no message text, and a Verxl API key cannot open history; upstream calls use Verxl-held credentials, so the model provider receives the request, not the user's Verxl account key. Two, Pareto pricing: on LiveBench 2.0, DeepSeek V4.1 Flash scores 74.0 at $0.181 per successful task and sits on the value frontier; Gemini 4 Argon scores 79.3 at $2.073, 11.5 times the cost; Claude Fable 5.1 scores 85.7 at $6.904, 38 times. Three, one key: the current demo routes three models; the approved provider registry and official bridges per the roadmap expand the catalogue; this is not a claim that every mainstream model is live today. Four, much cheaper: the flagship costs are on the table; the Verxl route is $0.181; the protocol fee is 50 bps. The table is LiveBench 2.0 data, cost per successful task, not a Verxl quote. API bridge requests follow upstream provider policy; only Chat is ciphertext-only. Qwen 3.5 4B is the resident host and is not in this LiveBench table.""")
# ---------------------------------------------------------------- 06 EFFICIENCY FRONTIER
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "06  /  EFFICIENCY FRONTIER", 7)
eyebrow(s, "The frontier")
title(s, "Cheap is not worse.", "The efficiency frontier.", y=1.10, size=40)

chart_x, chart_y, chart_w, chart_h = 0.65, 2.45, 7.7, 4.05
rect(s, chart_x, chart_y, chart_w, chart_h, CARD, LINE)
txt(s, 0.82, 2.59, 4.9, 0.18, "LIVEBENCH OVERALL vs COST PER SUCCESSFUL TASK", 6.5, MUTED, MONO)
px0, px1 = 1.35, 8.00
py0, py1 = 2.95, 6.15
def cx(c): return px0 + (math.log10(c) + 1) / 2 * (px1 - px0)
def cy(v): return py1 - (v - 60) / 28 * (py1 - py0)

# grid + axes
for v in [60, 65, 70, 75, 80, 85]:
    yy = cy(v)
    hline(s, px0, yy, px1 - px0, LINE)
    txt(s, px0 - 0.34, yy - 0.06, 0.30, 0.16, str(v), 6.3, MUTED, MONO, align=PP_ALIGN.RIGHT)
for c in [0.1, 0.2, 0.5, 1, 2, 5, 10]:
    xx = cx(c)
    vline(s, xx, py0, py1 - py0, LINE)
    label = f"${c:g}"
    txt(s, xx - 0.27, py1 + 0.08, 0.54, 0.16, label, 6.2, MUTED, MONO, align=PP_ALIGN.CENTER)
txt(s, px0, py1 + 0.28, 5.0, 0.18, "COST PER SUCCESSFUL TASK (LOG)", 6.2, MUTED, MONO)
txt(s, 0.82, py0 - 0.28, 1.2, 0.16, "QUALITY", 6.2, MUTED, MONO)

points = [
    ("GPT-6 Luna", 0.133, 64.6, True, False, -0.62, 0.10, PP_ALIGN.LEFT),
    ("MiniMax M3.1 Flash", 0.153, 66.9, True, False, -0.10, 0.16, PP_ALIGN.LEFT),
    ("DeepSeek V4.1 Flash", 0.181, 74.0, True, True, 0.10, -0.30, PP_ALIGN.LEFT),
    ("MiMo V2.6 Pro", 0.183, 68.5, False, True, 0.10, 0.13, PP_ALIGN.LEFT),
    ("GPT-6.1 Terra", 0.665, 77.8, True, False, 0.10, 0.12, PP_ALIGN.LEFT),
    ("GPT-6.1 Sol", 0.761, 84.1, True, False, 0.10, -0.27, PP_ALIGN.LEFT),
    ("Gemini 4 Argon", 2.073, 79.3, False, False, 0.10, -0.24, PP_ALIGN.LEFT),
    ("Claude Opus 5.5", 4.291, 85.1, True, False, -1.28, -0.22, PP_ALIGN.LEFT),
    ("GPT-6 Astra", 4.548, 85.6, True, False, 0.10, 0.11, PP_ALIGN.LEFT),
    ("Claude Fable 5.1", 6.904, 85.7, True, False, -1.30, -0.30, PP_ALIGN.LEFT),
]
# frontier line through the non-dominated points, ordered by cost
frontier = sorted([p for p in points if p[3]], key=lambda p: p[1])
for a, b in zip(frontier, frontier[1:]):
    line(s, cx(a[1]), cy(a[2]), cx(b[1]), cy(b[2]), MINT, 1.1, MSO_LINE_DASH_STYLE.DASH)
for name, cost, score, is_frontier, is_verxl, dx, dy, al in points:
    xx, yy = cx(cost), cy(score)
    if is_verxl:
        dot(s, xx - 0.045, yy - 0.045, 0.09, MINT if is_frontier else INK, None if is_frontier else MINT)
        color = MINT
    elif is_frontier:
        dot(s, xx - 0.04, yy - 0.04, 0.08, STEEL)
        color = STEEL
    else:
        dot(s, xx - 0.035, yy - 0.035, 0.07, INK, STEEL)
        color = MUTED
    txt(s, xx + dx, yy + dy, 2.1, 0.16, name, 6.3, color, MONO)
txt(s, 3.55, 3.42, 2.0, 0.18, "VALUE FRONTIER", 6.3, MINT_DIM, MONO)

# right callout
hline(s, 8.75, 2.62, 3.92, LINE)
txt(s, 8.75, 2.76, 3.92, 0.18, "THE EFFICIENT POINT", 7, MINT_DIM, MONO)
txt(s, 8.75, 3.00, 2.4, 0.55, "74.0", 34, MINT, TITLE, spacing=0.9)
txt(s, 8.75, 3.53, 3.85, 0.2, "DEEPSEEK V4.1 FLASH  ·  $0.181 / TASK", 7, WHITE, MONO)
hline(s, 8.75, 3.80, 3.92, LINE)
for i, (a, b) in enumerate([
    ("11.5×", "the cost of Gemini 4 Argon"),
    ("38×", "the cost of Claude Fable 5.1"),
    ("4.2×", "cheaper than GPT-6.1 Sol"),
]):
    yy = 3.96 + i * 0.42
    txt(s, 8.75, yy, 0.8, 0.2, a, 11, MINT, MONO)
    txt(s, 9.55, yy + 0.01, 3.05, 0.18, b, 7.8, SOFT, BODY)
txt(s, 8.75, 5.36, 3.9, 0.7, "At the efficient point, cheap is not a compromise. The frontier is the best score at each cost.", 9.2, SOFT, BODY, spacing=1.3)
txt(s, 8.75, 6.15, 3.9, 0.4, "Verxl adds 50 bps. Cost per successful task is a benchmark unit, not a quote.", 6.8, MUTED, BODY, spacing=1.3)
txt(s, 0.65, 6.72, 12.0, 0.4, "LiveBench 2.0 · 25 Oct 2026 · Abacus.AI. Log cost axis. Not an SLA. Qwen 3.5 4B is the resident host and is not in this benchmark table.", 6.8, MUTED, MONO)
notes(s, """This is the efficiency frontier from the LiveBench 2.0 Overall data, plotted on a log cost axis. The frontier is the best overall score at each cost. The filled points are the non-dominated frontier; the hollow points are dominated — they cost more for the same or lower score. The Verxl route is DeepSeek V4.1 Flash at 74.0 and $0.181 per successful task, on the frontier; MiMo V2.6 Pro is also a Verxl route, at 68.5 and $0.183, but it is dominated by DeepSeek. The mainstream flagships sit at the top right: Gemini 4 Argon 79.3/$2.073, GPT-6 Astra 85.6/$4.548, Claude Fable 5.1 85.7/$6.904. The efficient point is not the highest score; it is the best score per cost, and the deck says that plainly. The ratios are cost ratios from the table: Gemini is 11.5 times the Verxl route; Claude Fable is 38 times; GPT-6.1 Sol is 4.2 times. The chart uses the Overall LiveBench data, not a Verxl benchmark; the Verxl 50 bps is additional; the table and source are on the previous slide and this footer. Qwen 3.5 4B is the resident host and is not in this LiveBench table.""")
# ---------------------------------------------------------------- 06 ROUTING
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "07  /  ROUTING", 8)
eyebrow(s, "The catalogue")
title(s, "Three models. One contract.", None, y=1.20, size=42)
cols = [0.65, 4.15, 7.10, 8.75]
headers = ["MODEL", "HOST", "CONTEXT", "P50 TTFT"]
for x, h in zip(cols, headers):
    txt(s, x, 2.05, 2.4, 0.18, h, 7, MUTED, MONO, caps=True)
hline(s, 0.65, 2.28, 8.75, LINE2)
rows = [
    ("Qwen 3.5 4B Uncensored", "Prague bare metal", "32K", "38 ms", True),
    ("DeepSeek V4.1 Flash", "Official bridge", "1M", "92 ms", False),
    ("MiMo 2.6 Flash", "Official bridge", "1M", "85 ms", False),
]
for i, (model, host, ctx, ttft, resident) in enumerate(rows):
    yy = 2.47 + i * 0.82
    txt(s, 0.65, yy, 3.35, 0.26, model, 12, WHITE, BODY)
    txt(s, 4.15, yy + 0.03, 2.6, 0.22, host, 9.5, SOFT, BODY)
    txt(s, 7.10, yy + 0.03, 0.9, 0.22, ctx, 9.5, SOFT, MONO)
    txt(s, 8.75, yy, 1.2, 0.26, ttft, 12, MINT, MONO)
    if resident:
        dot(s, 0.48, yy + 0.10, 0.06, MINT)
    hline(s, 0.65, yy + 0.50, 8.75, LINE)

rect(s, 9.65, 2.02, 3.02, 3.28, CARD, LINE)
txt(s, 9.85, 2.18, 2.7, 0.18, "CANARY  /  SEED=42", 7, MINT_DIM, MONO)
txt(s, 9.85, 2.46, 2.65, 0.45, "99.8%", 30, WHITE, TITLE, spacing=0.9)
txt(s, 9.85, 2.96, 2.65, 0.2, "ORACLE FIDELITY", 6.5, MUTED, MONO, caps=True)
hline(s, 9.85, 3.28, 2.62, LINE)
for i, (a, b) in enumerate([("CADENCE", "30 min"), ("VECTOR", "deterministic"), ("FAILURE", "automatic fallback")]):
    txt(s, 9.85, 3.42 + i * 0.42, 1.2, 0.2, a, 6.5, MUTED, MONO)
    txt(s, 11.15, 3.42 + i * 0.42, 1.4, 0.2, b, 8, SOFT, BODY, align=PP_ALIGN.RIGHT)

hline(s, 0.65, 5.35, 8.75, LINE)
txt(s, 0.65, 5.52, 8.7, 0.7, "No GPU fleet. No lock-in. One resident host and two official bridges; the route is the contract.", 12, SOFT, BODY, spacing=1.3)
txt(s, 0.65, 6.35, 8.75, 0.2, "TTFT measured on the Sepolia demonstration. Not an SLA.", 7, MUTED, MONO)
notes(s, """The catalogue is intentionally small. Qwen 3.5 4B Uncensored is the resident model on the Prague bare-metal host: 32K context, the lowest measured TTFT, and the only host Verxl operates. DeepSeek V4.1 Flash and MiMo 2.6 Flash are reached through official bridges: 1M context each, higher TTFT, no GPU fleet. The canary is the quality control: a deterministic probe with seed 42 runs every 30 minutes, checks fidelity and falls back automatically. The 99.8% figure is the oracle fidelity on the demo telemetry. The caveat matters: these are Sepolia numbers, not an SLA, and the bridge paths are not the same as the bare-metal host.""")

# ---------------------------------------------------------------- 07 ECONOMICS
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "08  /  UNIT ECONOMICS", 9)
eyebrow(s, "The fee")
title(s, "50 bps. Not 950.", None, y=1.20, size=44)
txt(s, 0.65, 1.95, 6.6, 0.18, "PROTOCOL TAKE  /  BASIS POINTS", 7, MUTED, MONO)
# comparison bars (native editable shapes)
bx0, bw, bh = 2.15, 5.55, 0.52
# aggregator
txt(s, 0.65, 2.66, 1.35, 0.2, "AGGREGATOR", 7, MUTED, MONO, caps=True)
rect(s, bx0, 2.63, bw * 950 / 1000, bh, RGBColor(0x2B, 0x38, 0x3C), None)
txt(s, 6.68, 2.72, 0.8, 0.25, "950 bps", 9, WHITE, MONO)
# verxl
txt(s, 0.65, 3.53, 1.35, 0.2, "VERXL", 7, MINT_DIM, MONO, caps=True)
rect(s, bx0, 3.50, max(bw * 50 / 1000, 0.10), bh, MINT, None)
txt(s, bx0 + 0.40, 3.59, 0.8, 0.25, "50 bps", 9, MINT, MONO)
# scale
hline(s, bx0, 4.28, bw, LINE)
for x, t, al in [(bx0, "0", PP_ALIGN.LEFT), (bx0 + bw / 2, "500", PP_ALIGN.CENTER), (bx0 + bw, "1,000", PP_ALIGN.RIGHT)]:
    vline(s, x, 4.28, 0.07, LINE)
    tx = x - 0.40 if al == PP_ALIGN.RIGHT else x - 0.25
    tw = 0.40 if al == PP_ALIGN.RIGHT else 0.50
    txt(s, tx, 4.08, tw, 0.18, t, 6.5, MUTED, MONO, align=al)
txt(s, 0.65, 4.70, 6.5, 0.25, "Take rate on the same compute bill.", 9, MUTED, BODY)

txt(s, 7.85, 1.95, 2.8, 0.55, "94.7%", 42, MINT, TITLE, spacing=0.9)
txt(s, 7.85, 2.55, 2.0, 0.2, "LOWER FEE", 6.5, MUTED, MONO, caps=True)
hline(s, 7.85, 2.85, 4.82, LINE)
txt(s, 7.85, 3.02, 4.6, 0.2, "EVERY $1,000 OF COMPUTE", 7, MUTED, MONO)
for i, (a, b, col) in enumerate([
    ("Verxl fee", "$0.50", WHITE),
    ("Aggregator fee", "$9.50", SOFT),
    ("Provider keeps", "99.5%", MINT),
]):
    yy = 3.30 + i * 0.52
    txt(s, 7.85, yy, 2.8, 0.22, a, 9.5, MUTED, BODY)
    txt(s, 10.30, yy - 0.03, 2.35, 0.3, b, 15, col, TITLE, align=PP_ALIGN.RIGHT)
    hline(s, 7.85, yy + 0.35, 4.82, LINE)
txt(s, 7.85, 4.98, 4.75, 0.55, "The same compute bill. 18× lower take.", 11, SOFT, BODY, spacing=1.3)
txt(s, 0.65, 6.05, 8.8, 0.2, "50 bps = 0.50%. Incumbent midpoint 950 bps from the project's market sample.", 7, MUTED, MONO)
txt(s, 0.65, 6.30, 9.8, 0.35, "Protocol parameters, not a price promise. Fees are set in USDC; the chart is the comparison, not a forecast.", 8.5, MUTED, BODY)
notes(s, """The fee is the simplest part of the pitch and the easiest to misread. Verxl takes 50 bps, or 0.50%, of the compute bill. For every $1,000 of compute, the protocol fee is $0.50; an incumbent at 950 bps would take $9.50, so the fee is 94.7% lower. The provider keeps 99.5% of compute. The chart compares the take rates, not a total cost of ownership: models, bridges and infrastructure are separate. The 840–1,040 bps range is the project's market sample; 950 is the midpoint. These are protocol parameters on Sepolia, not a public price list and not a forecast. The deck deliberately avoids inventing a monthly token bill; the unit is $1,000 of compute.""")

# ---------------------------------------------------------------- 08 PRODUCT
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "09  /  PRODUCT", 10)
eyebrow(s, "The surfaces")
title(s, "An API, a chat, a receipt.", None, y=1.20, size=42)
blocks = [
    ("01  /  API", "OpenAI-compatible", "One endpoint, three models. Drop-in clients; Bearer key; streaming SSE.", "POST /v1/chat/completions"),
    ("02  /  CHAT", "Encrypted in the browser", "Wallet-derived key. Search, charts and file attachments without sending plaintext to storage.", "AES-256-GCM  ·  search  ·  charts"),
    ("03  /  RECEIPT", "Every request settles", "TTFT, tokens, route, protocol fee and provider payout in one receipt.", "route  ·  tokens  ·  fee"),
]
for i, (k, h, body, data) in enumerate(blocks):
    x = 0.65 + i * 4.08
    hline(s, x, 2.10, 3.78, LINE)
    txt(s, x, 2.22, 3.5, 0.2, k, 7, MINT_DIM, MONO, caps=True)
    txt(s, x, 2.50, 3.5, 0.28, h, 17, WHITE, TITLE, spacing=1.0)
    txt(s, x, 2.95, 3.55, 0.8, body, 10.5, SOFT, BODY, spacing=1.35)
    txt(s, x, 3.90, 3.55, 0.2, data, 7.5, MUTED, MONO)
# code block
rect(s, 0.65, 4.45, 6.2, 1.35, CARD, LINE)
txt(s, 0.85, 4.58, 5.8, 1.1,
    "POST /v1/chat/completions\nAuthorization: Bearer vrx_...\n{ \"model\": \"qwen3.5-4b-uncensored-32k\" }",
    8.5, MINT_DIM, MONO, spacing=1.35)
txt(s, 7.20, 4.55, 5.4, 0.25, "No rewrite. No new SDK.", 15, WHITE, TITLE)
txt(s, 7.20, 4.93, 5.4, 0.75,
    "The same request shape as the OpenAI API. The difference is what happens after the request: the route, the receipt and the settlement.",
    10.5, SOFT, BODY, spacing=1.35)
txt(s, 0.65, 6.05, 11.9, 0.2, "Demo surfaces: Playground, Chat, API key console and MCP registry. Search and charts are model-dependent.", 7, MUTED, MONO)
notes(s, """There are three surfaces and one contract. The API is OpenAI-compatible: the same request shape, Bearer auth and SSE streaming; the models are Qwen, DeepSeek and MiMo. Chat is the consumer surface: encrypted in the browser, with search, chart rendering and file attachments. The receipt is the accounting surface: TTFT, tokens, route, protocol fee and provider payout. The product claim is not the UI; it is that the same path produces the same receipt. The caveat is that the demo surfaces are Sepolia; search and charts are model-dependent; MCP registry browsing is present, execution is next.""")

# ---------------------------------------------------------------- 09 EVIDENCE
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "10  /  EVIDENCE", 11)
eyebrow(s, "The telemetry")
title(s, "Measured, not promised.", None, y=1.20, size=42)
metrics = [("38", " ms", "P50 TTFT"), ("99.8", "%", "Oracle fidelity"), ("3", "", "Models"), ("50", " bps", "Protocol take")]
for i, (v, u, cap) in enumerate(metrics):
    x = 0.65 + i * 3.03
    txt(s, x, 2.10, 2.4, 0.55, v + u, 30, MINT if i < 3 else WHITE, TITLE, spacing=0.9)
    txt(s, x, 2.68, 2.6, 0.2, cap, 6.5, MUTED, MONO, caps=True)
    if i > 0:
        vline(s, x - 0.22, 2.12, 0.65, LINE)
hline(s, 0.65, 3.02, 12.03, LINE)
cols = [0.65, 2.10, 5.90, 7.70, 9.35]
for x, h in zip(cols, ["PROBE", "TARGET", "TTFT", "FIDELITY", "VERDICT"]):
    txt(s, x, 3.20, 2.0, 0.18, h, 7, MUTED, MONO, caps=True)
hline(s, 0.65, 3.42, 12.03, LINE)
rows = [
    ("audit-run-902", "Prague bare metal", "38 ms", "99.8%", "PASSED"),
    ("audit-run-901", "Xiaomi Cloud", "85 ms", "99.6%", "PASSED"),
    ("audit-run-900", "DeepSeek Official", "92 ms", "99.5%", "PASSED"),
]
for i, row in enumerate(rows):
    yy = 3.58 + i * 0.52
    for x, val, col in zip(cols, row, [WHITE, SOFT, SOFT, MINT, MINT]):
        txt(s, x, yy, 1.9, 0.22, val, 9, col, MONO if x in (0.65, 5.90, 7.70) else BODY)
    hline(s, 0.65, yy + 0.36, 12.03, LINE)
txt(s, 0.65, 5.45, 7.6, 0.4, "seed=42  ·  30-minute cadence  ·  deterministic probe", 9, MUTED, MONO)
txt(s, 0.65, 5.85, 8.0, 0.7, "Sepolia telemetry sampled over the demonstration window. A canary pass is evidence, not a guarantee; the numbers carry their method and their limit.", 9.5, SOFT, BODY, spacing=1.3)
rect(s, 9.45, 5.50, 3.23, 1.08, CARD, LINE)
txt(s, 9.65, 5.63, 2.85, 0.2, "LIVE PLAYGROUND", 6.5, MINT_DIM, MONO)
txt(s, 9.65, 5.85, 2.9, 0.55, "Run a request. Read the receipt.", 11, WHITE, TITLE, spacing=1.1)
notes(s, """The evidence slide is the counterweight to the vision. The four numbers come from the live console and the oracle: 38 ms P50 TTFT on the Prague host, 99.8% oracle fidelity, three models and 50 bps. The probe table is representative of the canary output: seed 42, a deterministic probe every 30 minutes, a verdict per target. The canary checks quality and falls back automatically; it is not a guarantee. Everything is Sepolia, sampled over the demonstration window. The slide deliberately puts the method and the limits next to the numbers. The product can be inspected at the live Playground; the same data appears in the console and the public repository.""")

# ---------------------------------------------------------------- 10 HORIZON
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "11  /  HORIZON", 12)
eyebrow(s, "The scope")
title(s, "A horizon you can audit.", None, y=1.20, size=42)
columns = [
    ("NOW", "DEPLOYED", "01", ["OpenAI-compatible API", "Encrypted Chat", "Live Playground", "Three-model catalogue", "Sepolia clearing"]),
    ("NEXT", "IN PROGRESS", "02", ["MCP connections", "External contract audit", "More inference providers", "Mobile pass"]),
    ("NOT YET", "OUT OF SCOPE", "03", ["Mainnet settlement", "Enterprise SLA", "Global coverage", "A token"]),
]
for i, (h, status, n, items) in enumerate(columns):
    x = 0.65 + i * 4.08
    hline(s, x, 2.10, 3.78, LINE2 if i == 0 else LINE)
    txt(s, x, 2.24, 0.3, 0.18, n, 7, MUTED, MONO)
    txt(s, x + 0.38, 2.24, 2.8, 0.22, h, 9, MINT if i == 0 else SOFT, MONO)
    txt(s, x + 0.38, 2.52, 3.2, 0.2, status, 6.5, MUTED, MONO)
    for j, item in enumerate(items):
        yy = 3.02 + j * 0.46
        txt(s, x, yy, 0.18, 0.2, "—", 8, MINT_DIM if i == 0 else LINE2, MONO)
        txt(s, x + 0.28, yy - 0.01, 3.3, 0.24, item, 11.5, WHITE if i == 0 else SOFT, BODY)
        hline(s, x, yy + 0.30, 3.78, LINE)
txt(s, 0.65, 5.95, 8.0, 0.45, "Dates are not promises. The left column is deployed; the middle is work; the right is a deliberate no.", 9, MUTED, BODY)
notes(s, """The horizon is a boundary, not a roadmap theatre. The left column is live on Sepolia: the API, the encrypted Chat, the Playground, the three-model catalogue and clearing. The middle column is the work in progress: MCP connections, an external contract audit, more providers and a mobile pass. The right column is explicitly out of scope: mainnet settlement, an enterprise SLA, global coverage and a token. The right column is as important as the left one: it says what the project will not pretend to be. No dates are attached; the test is what is deployed, not what is announced. The site's Vision page carries the same horizon with the caveats.""")

# ---------------------------------------------------------------- 11 TEAM
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s); chrome(s, "12  /  TEAM", 13)
eyebrow(s, "The creators")
title(s, "Small team. Narrow thesis.", None, y=1.20, size=40)
team = [
    ("simon.jpg", "Simon Havlík", "Founder / Lead Architect", "Protocol, product, infrastructure."),
    ("daniel.jpg", "Daniel Kolárovský", "Head of Verification / SLA", "Canary probes, SLA, process."),
    ("miroslava.jpg", "Miroslava Valová", "Head of Compliance / Research", "MiCA/GDPR, research, governance."),
]
for i, (img, name, role, line1) in enumerate(team):
    x = 0.65 + i * 4.08
    add_image(s, os.path.join(ASSETS, img), x, 1.95, 2.72, 3.40, True)
    txt(s, x, 5.55, 3.55, 0.28, name, 16, WHITE, TITLE)
    txt(s, x, 5.92, 3.55, 0.2, role, 7, MINT_DIM, MONO, caps=True)
    txt(s, x, 6.18, 3.55, 0.2, line1, 8.5, MUTED, BODY)
txt(s, 0.65, 6.72, 12.03, 0.2, "VŠE PRAHA  ·  APPLIED BLOCKCHAIN PROJECT  ·  PRAGUE", 6.5, MUTED, MONO)
notes(s, """Verxl is a three-person applied blockchain project at VŠE Praha. Simon Havlík is the founder and lead architect: the edge router, the clearing switch, the Prague Qwen host and the encrypted Chat. Daniel Kolárovský leads verification: canary probes, SLA measurement and the process checks behind each release. Miroslava Valová leads compliance and research: regulatory scope, MiCA/GDPR, market research and institutional governance. The team is deliberately small; the scope is deliberately narrow. The deck does not overstate headcount or claim a company behind the project. The public repository is the record.""")

# ---------------------------------------------------------------- 12 CLOSE
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
line(s, 0.65, 0.46, 0.79, 0.68, MINT, 2.2)
line(s, 0.79, 0.68, 0.93, 0.46, MINT, 2.2)
txt(s, 1.02, 0.42, 2.0, 0.28, "Verxl", 15, WHITE, TITLE, bold=True)
txt(s, 2.05, 0.44, 3.0, 0.2, "PROTOCOL", 7, MUTED, MONO, caps=True)
txt(s, 8.6, 0.42, 4.08, 0.22, "VŠE PRAHA  ·  APPLIED BLOCKCHAIN  ·  2026", 7.2, MUTED, MONO, align=PP_ALIGN.RIGHT, caps=True)
hline(s, 0.65, 7.02, 12.03, LINE)
txt(s, 0.65, 7.12, 5.0, 0.16, "SEPOLIA TEST RUN  /  NOT MAINNET", 6.8, MINT_DIM, MONO, caps=True)
txt(s, 9.6, 7.12, 3.08, 0.16, "14  /  14", 7, MUTED, MONO, align=PP_ALIGN.RIGHT)
txt(s, 0.65, 1.45, 12.0, 0.25, "THE NEXT REQUEST", 8, MINT, MONO, caps=True)
txt(s, 0.65, 1.90, 12.0, 0.8, "Build on what clears.", 58, WHITE, TITLE, spacing=0.95)
txt(s, 0.65, 3.10, 5.9, 0.7, "Start with one request. Read the receipt, the latency and the settlement path before you commit to anything larger.", 14, SOFT, BODY, spacing=1.4)
hline(s, 0.65, 4.25, 6.5, LINE)
for i, (a, b) in enumerate([("EMAIL", "me@simonhavlik.com"), ("SOURCE", "github.com/simonhavlik/verxl-protocol"), ("SITE", "verxl.com")]):
    yy = 4.45 + i * 0.55
    txt(s, 0.65, yy, 1.3, 0.2, a, 6.5, MUTED, MONO)
    txt(s, 2.10, yy - 0.03, 5.0, 0.26, b, 12, WHITE, BODY)
    hline(s, 0.65, yy + 0.35, 6.5, LINE)
txt(s, 8.5, 3.20, 4.2, 2.4, "SEPOLIA\nDEMONSTRATION\nNOT A MAINNET\nPRODUCTION SYSTEM", 8, MUTED, MONO, spacing=1.6, caps=True)
txt(s, 8.5, 6.25, 4.2, 0.3, "VŠE PRAHA  ·  2026", 7, MINT_DIM, MONO, caps=True)
notes(s, """This is the close. The invitation is not to buy a token; it is to run one request and inspect what comes back: the receipt, the latency and the settlement path. The project is a Sepolia demonstration, not a mainnet production system. The email is the direct contact; the source repository is the record; the site is the live demo. The next step in the product is MCP connections, an external audit and more providers, not a token or a mainnet launch. If the reader takes one line from the deck, it is this: private, fast and affordable are not a marketing triangle; they are an architecture, and the clearing path is the product.""")

out = os.path.join(BASE, "Verxl_Protocol_Deck.pptx")
prs.save(out)
print(out)
print("slides:", len(prs.slides))
