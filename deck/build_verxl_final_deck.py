#!/usr/bin/env python3
"""Final Verxl term-project proposal. Eight slides, VŠE FIR white-mint system."""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_MARKER_STYLE, XL_LABEL_POSITION
from pptx.oxml.ns import qn

ASSETS = os.path.join(os.path.dirname(__file__), "assets")
OUT = os.path.join(os.path.dirname(__file__), "Verxl_Term_Project_Proposal.pptx")

INK = RGBColor(0x0B, 0x11, 0x17)
DEEP = RGBColor(0x1E, 0x5B, 0x45)
SAGE = RGBColor(0x52, 0x7D, 0x6B)
MINT = RGBColor(0xB8, 0xF6, 0xDD)
PALE = RGBColor(0xEA, 0xF7, 0xF1)
LINE = RGBColor(0xDC, 0xEB, 0xE3)
GRAY = RGBColor(0x5F, 0x6F, 0x68)
SOFT = RGBColor(0x8B, 0x98, 0x9E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
OFF = RGBColor(0xF7, 0xFB, 0xF9)
ROSE = RGBColor(0xB3, 0x6B, 0x6B)
FONT = "Helvetica Neue"
MONO = "Menlo"
SPECTRUM = [MINT, RGBColor(0x7F, 0xAE, 0x9D), SAGE, DEEP, ROSE]

W, H = 13.333, 7.5
prs = Presentation()
prs.slide_width = Inches(W)
prs.slide_height = Inches(H)
BLANK = prs.slide_layouts[6]

def slide():
    s = prs.slides.add_slide(BLANK)
    bg = s.background.fill
    bg.solid(); bg.fore_color.rgb = WHITE
    return s

def tb(s, x, y, w, h, text, size=11, color=INK, font=FONT, bold=False, italic=False,
       align=PP_ALIGN.LEFT, spacing=1.2, caps=False, margin=0):
    shape = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = shape.text_frame
    tf.clear(); tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(margin)
    tf.vertical_anchor = MSO_ANCHOR.TOP
    p = tf.paragraphs[0]
    p.alignment = align
    p.line_spacing = spacing
    p.space_before = Pt(0); p.space_after = Pt(0)
    r = p.add_run(); r.text = text.upper() if caps else text
    r.font.name = font; r.font.size = Pt(size); r.font.bold = bold; r.font.italic = italic
    r.font.color.rgb = color
    return shape

def runs(s, x, y, w, h, parts, spacing=0.95):
    shape = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = shape.text_frame; tf.clear(); tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.LEFT; p.line_spacing = spacing
    for text, size, color, bold, font in parts:
        r = p.add_run(); r.text = text
        r.font.name = font; r.font.size = Pt(size); r.font.bold = bold
        r.font.color.rgb = color
    return shape

def lines(s, x, y, w, h, items, size=10, color=GRAY, spacing=1.25, font=FONT):
    shape = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = shape.text_frame; tf.clear(); tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.TOP
    first = True
    for text, col, bold, sz, fnt in items:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = PP_ALIGN.LEFT; p.line_spacing = spacing
        p.space_before = Pt(0); p.space_after = Pt(3)
        r = p.add_run(); r.text = text
        r.font.name = fnt; r.font.size = Pt(sz); r.font.bold = bold
        r.font.color.rgb = col
    return shape

def flat(sh):
    style = sh._element.find(qn("p:style"))
    if style is not None:
        sh._element.remove(style)

def rect(s, x, y, w, h, fill=None, line=None, lw=0.8):
    sh = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.shadow.inherit = False
    flat(sh)
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line is None: sh.line.fill.background()
    else: sh.line.color.rgb = line; sh.line.width = Pt(lw)
    return sh

def line(s, x1, y1, x2, y2, color=LINE, width=0.8):
    sh = s.shapes.add_connector(1, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    flat(sh)
    sh.line.color.rgb = color; sh.line.width = Pt(width)

def circle(s, x, y, d, fill=MINT, line_c=None, lw=0.8):
    sh = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    sh.shadow.inherit = False
    flat(sh)
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line_c is None: sh.line.fill.background()
    else: sh.line.color.rgb = line_c; sh.line.width = Pt(lw)
    return sh

def spectrum(s, x, y, w, h=0.045):
    widths = [0.28, 0.18, 0.20, 0.14, 0.20]
    cx = x
    for col, frac in zip(SPECTRUM, widths):
        rect(s, cx, y, w * frac, h, col)
        cx += w * frac

def notes(s, text):
    s.notes_slide.notes_text_frame.text = text

def logo(s, x=0.65, y=6.94, w=1.38):
    s.shapes.add_picture(os.path.join(ASSETS, "vse-logo.png"), Inches(x), Inches(y), width=Inches(w))

def source(s, text, y=6.52):
    tb(s, 0.65, y, 11.9, 0.3, text, 6.7, SOFT, FONT, spacing=1.1)

def footer(s, page, section="TERM PROJECT PROPOSAL", show_logo=True):
    if show_logo: logo(s)
    tb(s, 2.22, 7.03, 7.2, 0.18, f"VERXL PROTOCOL  ·  {section}", 6.8, SOFT, MONO, caps=True, spacing=1)
    tb(s, 10.9, 7.03, 1.78, 0.18, f"{page:02d} / 08", 6.8, SOFT, MONO, align=PP_ALIGN.RIGHT, spacing=1)

def question(s, q, size=28):
    tb(s, 0.65, 0.55, 12.15, 0.9, q, size, INK, FONT, bold=True, spacing=0.98)
    line(s, 0.65, 1.22, 12.68, 1.22, LINE, 0.8)

def card(s, x, y, w, h, label, big, note, accent=DEEP, big_size=24):
    rect(s, x, y, w, h, OFF, LINE, 0.8)
    spectrum(s, x, y, w, 0.04)
    tb(s, x + 0.16, y + 0.16, w - 0.32, 0.18, label, 6.3, SAGE, MONO, caps=True, spacing=1)
    tb(s, x + 0.16, y + 0.38, w - 0.32, 0.48, big, big_size, accent, FONT, bold=True, spacing=0.9)
    tb(s, x + 0.16, y + 0.95, w - 0.32, 0.62, note, 8.2, GRAY, FONT, spacing=1.25)

def goal_block(s, x, y, w, h, label, title, body, accent=DEEP):
    rect(s, x, y, w, h, OFF, LINE, 0.8)
    spectrum(s, x, y, w, 0.04)
    tb(s, x + 0.16, y + 0.13, w - 0.3, 0.16, label, 5.8, SAGE, MONO, caps=True, spacing=1)
    tb(s, x + 0.16, y + 0.32, w - 0.3, 0.24, title, 9.4, accent, FONT, bold=True, spacing=1)
    tb(s, x + 0.16, y + 0.60, w - 0.3, 0.55, body, 7.0, GRAY, FONT, spacing=1.2)

def kpi(s, x, y, w, h, label, value, sub=""):
    rect(s, x, y, w, h, WHITE, LINE, 0.7)
    rect(s, x, y, 0.035, h, MINT)
    tb(s, x + 0.12, y + 0.09, w - 0.2, 0.14, label, 5.4, SAGE, MONO, caps=True, spacing=1)
    tb(s, x + 0.12, y + 0.25, w - 0.2, 0.28, value, 12.2, DEEP, FONT, bold=True, spacing=0.95)
    if sub:
        tb(s, x + 0.12, y + 0.57, w - 0.2, 0.2, sub, 5.8, GRAY, FONT, spacing=1.1)

def financial_chart(s, x, y, w, h):
    data = CategoryChartData()
    data.categories = ("$1k", "$2.5k", "$5k", "$7.5k", "$10k", "$15k")
    data.add_series("Funded customers required", (541, 216, 108, 72, 54, 36))
    gf = s.shapes.add_chart(XL_CHART_TYPE.LINE_MARKERS, Inches(x), Inches(y), Inches(w), Inches(h), data)
    ch = gf.chart
    ch.font.name = FONT; ch.font.size = Pt(6.5); ch.font.color.rgb = GRAY
    ch.has_title = False
    ch.has_legend = True
    ch.legend.position = XL_LEGEND_POSITION.BOTTOM
    ch.legend.include_in_layout = False
    ch.legend.font.size = Pt(6.2); ch.legend.font.name = FONT
    va = ch.value_axis
    va.has_major_gridlines = True
    va.major_gridlines.format.line.color.rgb = LINE
    va.major_gridlines.format.line.width = Pt(0.5)
    va.tick_labels.font.size = Pt(6.0); va.tick_labels.font.name = MONO
    va.tick_labels.number_format = '#,##0'; va.tick_labels.number_format_is_linked = False
    va.minimum_scale = 0; va.maximum_scale = 600; va.major_unit = 100
    va.format.line.color.rgb = LINE
    ca = ch.category_axis
    ca.tick_labels.font.size = Pt(7); ca.tick_labels.font.name = MONO
    ca.format.line.color.rgb = LINE
    series = ch.series[0]
    series.smooth = False
    series.format.line.color.rgb = DEEP
    series.format.line.width = Pt(2.2)
    series.marker.style = XL_MARKER_STYLE.CIRCLE
    series.marker.size = 5
    series.marker.format.fill.solid(); series.marker.format.fill.fore_color.rgb = DEEP
    series.marker.format.line.color.rgb = WHITE
    series.data_labels.show_value = True
    series.data_labels.font.name = MONO
    series.data_labels.font.size = Pt(7)
    series.data_labels.font.bold = True
    series.data_labels.font.color.rgb = INK
    series.data_labels.position = XL_LABEL_POSITION.ABOVE

# =====================================================================
# 1. COVER
# =====================================================================
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-cover.png"), 0, 0, width=Inches(W), height=Inches(H))
logo(s, 0.65, 0.38, 2.95)
rect(s, 0.65, 1.25, 0.07, 0.07, MINT)
tb(s, 0.80, 1.17, 5.4, 0.22, "TERM PROJECT PROPOSAL  /  VŠE PRAHA", 7.4, DEEP, MONO, caps=True, spacing=1)
runs(s, 0.65, 1.42, 7.4, 1.12, [
    ("verxl", 64, INK, True, FONT),
    (".com", 38, SAGE, True, FONT),
], spacing=0.9)
tb(s, 0.65, 2.62, 6.8, 0.38, "A clearing layer for AI inference", 17.2, DEEP, FONT, spacing=1.1)
tb(s, 0.65, 3.05, 6.8, 0.24, "Route · encrypt · verify · settle", 9.1, SAGE, FONT, caps=True, spacing=1.2)

# Search card: Google query "verxl"
sx, sy, sw, sh = 0.65, 3.42, 6.35, 1.30
rect(s, sx, sy, sw, sh, WHITE, LINE, 0.9)
spectrum(s, sx, sy, sw, 0.05)
tb(s, sx + 0.22, sy + 0.15, 2.2, 0.18, "GOOGLE / SEARCH", 6.2, SAGE, MONO, caps=True, spacing=1)
# magnifier
circle(s, sx + 0.23, sy + 0.44, 0.14, None, DEEP, 1.1)
line(s, sx + 0.35, sy + 0.57, sx + 0.44, sy + 0.66, DEEP, 1.1)
tb(s, sx + 0.58, sy + 0.35, 4.8, 0.42, "verxl", 25, INK, FONT, spacing=1.0)
line(s, sx + 0.58, sy + 0.82, sx + sw - 0.2, sy + 0.82, LINE, 0.7)
tb(s, sx + 0.58, sy + 0.92, 3.8, 0.2, "verxl.com", 9.2, DEEP, MONO, spacing=1)
tb(s, sx + 4.55, sy + 0.92, 1.5, 0.2, "OPEN  ↗", 6.4, DEEP, MONO, align=PP_ALIGN.RIGHT, spacing=1)

# 4 value claims under the search card
claims = [("0.5%", "clearing fee"), ("AES-256-GCM", "encrypted chat"), ("OPEN SOURCE", "public GitHub"), ("PAY-PER-USE", "no subscription")]
for i, (big, small) in enumerate(claims):
    x = 0.65 + i * 1.63
    tb(s, x, 4.92, 1.55, 0.22, big, 7.2, DEEP, MONO, caps=True, spacing=1)
    tb(s, x, 5.12, 1.55, 0.18, small, 7.0, GRAY, FONT, spacing=1.1)

# team / course
runs(s, 0.65, 5.56, 7.0, 0.28, [
    ("Šimon Havlík", 9.2, INK, True, FONT),
    ("  ·  Daniel Kolárovský  ·  Miroslava Valová", 9.2, INK, False, FONT),
])
tb(s, 0.65, 5.86, 7.0, 0.2, "Faculty of International Relations  ·  2SE307 Bitcoin and blockchain", 8.1, GRAY, FONT, spacing=1.15)
tb(s, 0.65, 6.10, 7.0, 0.2, "15 December 2026  ·  live Sepolia pilot", 7.9, SAGE, MONO, spacing=1.1)

# QR panel
qx, qy, qw, qh = 8.28, 1.28, 4.4, 3.38
rect(s, qx, qy, qw, qh, WHITE, LINE, 0.9)
spectrum(s, qx, qy, qw, 0.05)
tb(s, qx + 0.2, qy + 0.16, 2.8, 0.18, "SCAN TO OPEN", 6.2, SAGE, MONO, caps=True, spacing=1)
s.shapes.add_picture(os.path.join(ASSETS, "qr-verxl.png"), Inches(qx + 0.2), Inches(qy + 0.38), width=Inches(1.72), height=Inches(1.72))
tb(s, qx + 2.08, qy + 0.42, 2.05, 0.4, "verxl.com", 17.5, INK, FONT, bold=True, spacing=1)
tb(s, qx + 2.08, qy + 0.86, 2.1, 0.36, "Live Sepolia pilot.", 8.2, GRAY, FONT, spacing=1.2)
tb(s, qx + 2.08, qy + 1.20, 2.1, 0.36, "Open the Chat, API, Registry and Playground.", 7.6, SAGE, FONT, spacing=1.2)
line(s, qx + 0.2, qy + 2.27, qx + qw - 0.2, qy + 2.27, LINE, 0.7)
tb(s, qx + 0.2, qy + 2.40, 1.8, 0.18, "TEST BUILDS", 6.2, SAGE, MONO, caps=True, spacing=1)
tb(s, qx + 0.2, qy + 2.62, 3.9, 0.5, "macOS  ·  Linux  ·  Windows  ·  Android", 8.0, INK, FONT, spacing=1.2)

# Corner test note
nx, ny, nw, nh = 8.28, 4.92, 4.4, 1.22
rect(s, nx, ny, nw, nh, PALE, MINT, 1.0)
tb(s, nx + 0.18, ny + 0.14, 2.8, 0.18, "HELP US TEST", 7.0, DEEP, MONO, caps=True, spacing=1)
tb(s, nx + 0.18, ny + 0.35, 4.0, 0.24, "Our apps for macOS / Linux / Windows / Android.", 8.4, INK, FONT, spacing=1.2)
tb(s, nx + 0.18, ny + 0.72, 4.0, 0.22, "verxl.com/products  ·  no app store required", 7.2, SAGE, MONO, spacing=1.1)
footer(s, 1, "VŠE PRAHA", False)
notes(s, "Cover. Verxl.com is the product, not a slide about a company. The QR code opens https://verxl.com. The search field is a visual cue: search 'verxl' and the live pilot is the first result. The corner note invites evaluators to test the macOS, Linux, Windows and Android builds from verxl.com/products. The cover is factual: the project is a Sepolia pilot, not a production company.")

# =====================================================================
# 2. PROBLEM
# =====================================================================
s = slide()
question(s, "What problem does your project solve?", 29)
runs(s, 0.65, 1.38, 12.2, 0.45, [
    ("OpenRouter charges ", 15.5, INK, False, FONT),
    ("5%", 15.5, ROSE, True, FONT),
    (" on usage. Verxl charges ", 15.5, INK, False, FONT),
    ("0.5%", 15.5, DEEP, True, FONT),
    (".", 15.5, INK, False, FONT),
], spacing=1.1)
tb(s, 0.65, 1.78, 11.9, 0.3, "Same model, same provider price: 4.5 percentage points lower fee; about 4.3% lower total bill.", 9.6, GRAY, FONT, spacing=1.25)

# comparison panel
px, py, pw, ph = 0.65, 2.35, 6.05, 3.42
rect(s, px, py, pw, ph, OFF, LINE, 0.8)
spectrum(s, px, py, pw, 0.05)
tb(s, px + 0.22, py + 0.20, 4.0, 0.18, "FEE ON EVERY TOKEN", 6.4, SAGE, MONO, caps=True, spacing=1)
runs(s, px + 0.22, py + 0.42, 5.6, 0.62, [
    ("5.0%", 28, ROSE, True, FONT),
    ("  →  ", 18, SAGE, False, FONT),
    ("0.5%", 28, DEEP, True, FONT),
], spacing=0.9)
tb(s, px + 0.22, py + 1.03, 5.6, 0.22, "10× lower fee. 4.5 points lower. No subscription.", 8.6, DEEP, FONT, spacing=1.2)
# bars
bar_x, bar_y, bar_w = px + 0.22, py + 1.45, 3.95
tb(s, bar_x, bar_y - 0.16, 1.1, 0.16, "OpenRouter", 6.4, ROSE, MONO, spacing=1)
rect(s, bar_x + 1.12, bar_y - 0.13, bar_w, 0.16, RGBColor(0xF7, 0xE9, 0xE9), None)
rect(s, bar_x + 1.12, bar_y - 0.13, bar_w, 0.16, ROSE)
tb(s, bar_x + 1.12 + bar_w + 0.06, bar_y - 0.16, 0.55, 0.16, "5.0%", 7.2, ROSE, MONO, align=PP_ALIGN.RIGHT, spacing=1)
tb(s, bar_x, bar_y + 0.18, 1.1, 0.16, "Verxl", 6.4, DEEP, MONO, spacing=1)
rect(s, bar_x + 1.12, bar_y + 0.21, bar_w, 0.16, PALE, None)
rect(s, bar_x + 1.12, bar_y + 0.21, bar_w * 0.1, 0.16, DEEP)
tb(s, bar_x + 1.12 + bar_w + 0.06, bar_y + 0.18, 0.55, 0.16, "0.5%", 7.2, DEEP, MONO, align=PP_ALIGN.RIGHT, spacing=1)
line(s, px + 0.22, py + 2.35, px + pw - 0.22, py + 2.35, LINE, 0.7)
tb(s, px + 0.22, py + 2.50, 5.6, 0.32, "At identical provider token prices, a 5% vs 0.5% fee saves ≈4.3% of the total bill. The fee itself is 10× lower.", 8.2, GRAY, FONT, spacing=1.3)
tb(s, px + 0.22, py + 3.02, 5.6, 0.18, "Like-for-like: same model, same provider token price.", 6.8, SOFT, FONT, italic=True, spacing=1.1)

# four claim cards
claims = [
    ("ANONYMOUS / WALLET-ONLY", "No name or email required for Chat. The wallet address is the only identifier."),
    ("OPEN SOURCE", "Router, contracts and client at github.com/simonhavlik/verxl-protocol."),
    ("BOUNDED UNCENSORED", "Uncensored models <20B. Frontier work to aligned providers."),
    ("PRIVATE + PAYG", "AES-256-GCM Chat. Pay for use; no subscription."),
]
for i, (head, body) in enumerate(claims):
    col, row = i % 2, i // 2
    x = 6.95 + col * 2.95
    y = 2.35 + row * 1.70
    rect(s, x, y, 2.82, 1.56, WHITE, LINE, 0.8)
    rect(s, x, y, 0.035, 1.56, MINT)
    tb(s, x + 0.16, y + 0.16, 2.5, 0.18, head, 6.2, SAGE, MONO, caps=True, spacing=1)
    tb(s, x + 0.16, y + 0.42, 2.5, 0.85, body, 8.6, GRAY, FONT, spacing=1.3)
source(s, "OpenRouter publishes a 5% usage fee (5.5% on card top-ups). Verxl charges 0.5%. Fee difference: 5.0% − 0.5% = 4.5 percentage points. At equal provider token prices the total-bill reduction is ≈4.3%. Wallet-only access; hosting and providers still process network metadata.")
footer(s, 2, "PROBLEM")
notes(s, "The problem is access pricing and access policy, not model quality. OpenRouter takes 5% of every token; Verxl takes 0.5%. That is a 4.5 percentage-point lower fee and about a 4.3% lower total bill at identical provider prices. Verxl's difference is wallet-first pseudonymous access, public source, bounded uncensored access under 20B, and an encrypted pay-per-use Chat with no subscription.")

# =====================================================================
# 3. AUDIENCE
# =====================================================================
s = slide()
question(s, "Who is the target audience?", 29)
tb(s, 0.65, 1.38, 6.2, 0.3, "Technical teams with a visible inference bill.", 10.5, SAGE, FONT, spacing=1.15)
rows = [
    ("01 / PRODUCT TEAMS", "AI startups and product teams (1–50 engineers) running multiple models. Inference is a visible line item."),
    ("02 / PRIVACY-SENSITIVE", "Legal, health and finance teams that cannot send plaintext to a single vendor."),
    ("03 / PROVIDERS", "Independent GPU or API capacity without distribution. Reviewed before listing."),
    ("04 / CRYPTO-NATIVE", "Wallet-first users who want a pseudonymous, pay-as-you-go alternative to OpenRouter."),
]
y = 2.00
for label, body in rows:
    tb(s, 0.65, y, 1.7, 0.2, label, 6.4, DEEP, MONO, caps=True, spacing=1)
    tb(s, 2.28, y - 0.02, 4.25, 0.72, body, 9.1, GRAY, FONT, spacing=1.25)
    line(s, 0.65, y + 0.76, 6.45, y + 0.76, LINE, 0.7)
    y += 0.95
s.shapes.add_picture(os.path.join(ASSETS, "map-light.png"), Inches(7.0), Inches(1.95), width=Inches(5.66), height=Inches(3.18))
rect(s, 7.0, 5.22, 5.66, 0.015, LINE)
tb(s, 7.0, 5.32, 5.66, 0.36, "CURRENT PILOT  /  3 routes · 1 Prague host · 2 official bridges", 6.4, SAGE, MONO, caps=True, spacing=1)
tb(s, 0.65, 6.35, 6.1, 0.26, "An initial target, not a TAM estimate.", 6.8, SOFT, FONT, italic=True)
footer(s, 3, "TARGET AUDIENCE")
notes(s, "The first segment is deliberately narrow: technical buyers who already pay for inference and can see the bill. Privacy-sensitive teams are the second. Independent providers get distribution. Wallet-first crypto users are a natural fourth segment because the product is already wallet-native. The map is illustrative of the route, not coverage or latency.")

# =====================================================================
# 4. TEAM
# =====================================================================
s = slide()
question(s, "What are our roles?", 29)
tb(s, 0.65, 1.38, 12.0, 0.3, "Three members cover the protocol, verification and compliance.", 10.5, SAGE, FONT, spacing=1.15)
team = [
 ("simon.jpg", "faculty-economics.png", "Šimon Havlík", "FOUNDER / LEAD ARCHITECT", "Protocol, product and infrastructure: edge router, clearing switch, Prague Qwen host, encrypted Chat."),
 ("daniel.jpg", "faculty-international-relations.jpg", "Daniel Kolárovský", "HEAD OF VERIFICATION / SLA", "Canary probes, SLA measurement and the process checks behind each release."),
 ("miroslava.jpg", "bratislava-business-university.jpg", "Miroslava Valová", "HEAD OF COMPLIANCE / RESEARCH", "MiCA/GDPR scope, market research, partner diligence and institutional governance."),
]
for i, (img, logo_img, name, role, bio) in enumerate(team):
    x = 0.65 + i * 4.0
    line(s, x, 1.82, x + 3.58, 1.82, MINT, 1.2)
    s.shapes.add_picture(os.path.join(ASSETS, img), Inches(x + 0.32), Inches(1.90), width=Inches(2.70), height=Inches(3.375))
    s.shapes.add_picture(os.path.join(ASSETS, logo_img), Inches(x + 0.32), Inches(5.31), height=Inches(0.52))
    if i == 2:
        tb(s, x + 1.16, 5.42, 1.72, 0.2, "UNIVERSITY OF ECONOMICS\nIN BRATISLAVA", 5.2, SAGE, MONO, caps=True, spacing=1.05)
    tb(s, x + 0.32, 5.90, 2.90, 0.28, name, 11.4, INK, FONT, bold=True, spacing=1)
    tb(s, x + 0.32, 6.19, 2.90, 0.2, role, 6.2, DEEP, MONO, caps=True, spacing=1)
    tb(s, x + 0.32, 6.43, 2.90, 0.5, bio, 7.2, GRAY, FONT, spacing=1.16)
footer(s, 4, "TEAM")
notes(s, "Three people. Simon Havlík is the founder and lead architect: edge router, clearing switch, Prague Qwen host and encrypted Chat. Daniel Kolárovský leads verification: canary probes, SLA measurement and process checks. Miroslava Valová leads compliance and research: MiCA/GDPR, market research and institutional governance. The portraits are at their native aspect ratio.")

# =====================================================================
# 5. GOAL
# =====================================================================
s = slide()
question(s, "What is the goal of the project?", 29)
tb(s, 0.65, 1.38, 12.0, 0.28, "Route, encrypt, verify and settle inference across approved providers.", 10.5, SAGE, FONT, spacing=1.15)
tb(s, 0.65, 1.76, 6.05, 0.78, "We do not train models. Verxl clears access to approved providers and meters the output. The pilot runs three routes: Qwen 3.5 4B in Prague; DeepSeek V4.1 Flash and MiMo 2.6 Flash through official bridges.", 8.8, GRAY, FONT, spacing=1.28)
funcs = [
 ("01 / ROUTE", "OpenAI-compatible /v1/chat/completions; streaming; three routes."),
 ("02 / REGISTRY", "Provider application, review, approved routes and live catalogue."),
 ("03 / ENCRYPT", "Chat key from wallet; AES-256-GCM; ciphertext only."),
 ("04 / VERIFY", "Seed-42 canary; 99.8% fidelity; automatic fallback."),
 ("05 / SETTLE", "USDC on Arbitrum; 50 bps; providers keep 99.5%."),
 ("06 / METER", "Keys, usage and billing; an API key cannot open chat."),
]
for i, (label, body) in enumerate(funcs):
    col, row = i % 2, i // 2
    x = 0.65 + col * 3.05
    y = 2.78 + row * 1.10
    tb(s, x, y, 2.75, 0.18, label, 6.3, DEEP, MONO, caps=True, spacing=1)
    tb(s, x, y + 0.22, 2.75, 0.65, body, 7.8, GRAY, FONT, spacing=1.25)
    if col == 0: line(s, 0.65, y + 0.92, 3.35, y + 0.92, LINE, 0.6)

ax, ay, aw = 6.85, 2.12, 5.85
line(s, ax, ay, ax + aw, ay, MINT, 1.2)
tb(s, ax, ay + 0.15, aw - 0.3, 0.2, "CLEARING PATH  /  CURRENT PILOT", 6.3, SAGE, MONO, caps=True, spacing=1)
def box(x, y, w, h, title, sub, fill=WHITE, line_c=LINE):
    rect(s, x, y, w, h, fill, line_c, 0.8)
    tb(s, x + 0.1, y + 0.1, w - 0.2, 0.2, title, 6.2, INK, MONO, caps=True, spacing=1)
    tb(s, x + 0.1, y + 0.32, w - 0.2, 0.4, sub, 6.4, GRAY, FONT, spacing=1.15)
def arrow(x1, y1, x2, y2):
    sh = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(x1), Inches(y1), Inches(x2 - x1), Inches(0.13))
    sh.shadow.inherit = False; flat(sh); sh.fill.solid(); sh.fill.fore_color.rgb = MINT; sh.line.fill.background()
def down_arrow(x, y, h):
    sh = s.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, Inches(x), Inches(y), Inches(0.13), Inches(h))
    sh.shadow.inherit = False; flat(sh); sh.fill.solid(); sh.fill.fore_color.rgb = MINT; sh.line.fill.background()
box(7.02, 2.52, 1.55, 0.8, "BROWSER", "client")
box(8.92, 2.52, 1.52, 0.8, "EDGE", "Cloudflare")
box(10.82, 2.52, 1.55, 0.8, "PRAGUE", "Qwen 3.5 4B")
box(10.82, 3.62, 1.55, 0.8, "BRIDGES", "DeepSeek · MiMo")
box(7.02, 4.05, 1.55, 0.8, "POSTGRES", "ciphertext")
box(8.92, 4.05, 1.52, 0.8, "ORACLE", "seed 42")
box(8.92, 5.18, 1.52, 0.72, "ARBITRUM", "USDC · 50 bps")
arrow(8.57, 2.86, 8.90, 2.86)
arrow(10.44, 2.86, 10.80, 2.86)
arrow(10.44, 3.25, 10.80, 3.86)
down_arrow(9.62, 3.34, 0.69)
down_arrow(9.62, 4.87, 0.29)
down_arrow(7.72, 3.34, 0.69)
tb(s, 8.60, 2.98, 0.5, 0.13, "request", 5.0, SAGE, MONO)
tb(s, 10.43, 2.98, 0.45, 0.13, "route", 5.0, SAGE, MONO)
tb(s, 7.80, 3.48, 0.75, 0.13, "ciphertext", 5.0, SAGE, MONO)
tb(s, 9.72, 3.48, 0.45, 0.13, "probe", 5.0, SAGE, MONO)
tb(s, 9.72, 4.95, 0.5, 0.13, "receipt", 5.0, SAGE, MONO)
line(s, 10.44, 3.22, 10.80, 3.84, SAGE, 0.8)
tb(s, 0.65, 6.08, 6.0, 0.26, "ACCESS  /  approved providers · uncensored routes <20B · frontier work to safety-aligned providers", 6.2, SAGE, MONO, spacing=1.1)
tb(s, 0.65, 6.34, 6.0, 0.2, "Current pilot: 3 routes; 1 Prague host; 2 official bridges.", 6.6, SOFT, FONT, italic=True)
footer(s, 5, "GOAL & FUNCTIONS")
notes(s, "The product has six functions: route, registry, encryption, verification, settlement and metering. The pitch is a clearing layer, not a model. The architecture is the current Sepolia pilot. Access policy is explicit: approved providers only, uncensored routes under 20B, frontier work to safety-aligned providers.")

# =====================================================================
# 6. EVALUATION
# =====================================================================
s = slide()
question(s, "How will you evaluate if the project was successful?", 26)
tb(s, 0.65, 1.32, 12.15, 0.22, "Short term: legal + product. Mid term: paid design partners, measure actual CAC and usage. Long term: break-even threshold. Two-thirds of this page is the financial test.", 8.0, SAGE, FONT, spacing=1.15)
goal_block(s, 0.65, 1.68, 3.92, 1.15, "01 / SHORT TERM", "MiCA + finished product", "MiCA perimeter opinion; non-custodial, no CASP claim. GDPR + AI Act, DPA/SCC, complaints. Product tested before any ads.")
goal_block(s, 4.73, 1.68, 3.92, 1.15, "02 / MID TERM", "Design partners, no paid ads", "Onboard first paid design partners. Measure actual deposit, monthly usage and CAC. Do not extrapolate a funnel from zero.")
goal_block(s, 8.81, 1.68, 3.92, 1.15, "03 / LONG TERM", "Break-even is a threshold", "CZK 45k/mo fixed cost at 80% margin and 0.5% take requires CZK 11.25M monthly GMV: 36–541 funded customers.")
tb(s, 0.65, 2.98, 7.4, 0.18, "FINANCIAL SUCCESS  /  BREAK-EVEN REQUIREMENT, NOT A FORECAST", 6.2, DEEP, MONO, caps=True, spacing=1)
tb(s, 0.65, 3.18, 7.4, 0.18, "Funded customers required to cover CZK 45k/mo at 0.5% take and 80% margin", 7.2, SAGE, FONT, spacing=1.1)
financial_chart(s, 0.65, 3.40, 7.35, 2.70)
kpis = [
    ("CZECH FIXED COST", "CZK 45k/mo", "≈$2,163 at 20.8 CZK/USD"),
    ("BREAK-EVEN GMV", "CZK 11.25M/mo", "≈$541k/mo"),
    ("AT $5K / CUSTOMER", "108 funded", "CZK 104k/mo usage"),
    ("AT $15K / CUSTOMER", "36 funded", "CZK 312k/mo usage"),
    ("GROSS MARGIN", "80%", "0.5% take × 80%"),
    ("PAID ADS", "$0", "until measured LTV/CAC >3×"),
]
for i, (label, value, sub) in enumerate(kpis):
    col, row = i % 2, i // 2
    kpi(s, 8.15 + col * 2.18, 3.18 + row * 0.97, 2.10, 0.88, label, value, sub)
tb(s, 0.65, 6.18, 7.4, 0.22, "Break-even GMV = CZK 45k / (0.5% × 80%) = CZK 11.25M/mo. Czech cost: contractor 25k + legal/accounting 8k + software 5k + office 7k. No paid ads until measured.", 5.8, DEEP, FONT, spacing=1.1)
source(s, "Math: CZK 45,000 / (0.005 × 0.80) = CZK 11.25M monthly GMV; customers = CZK 11.25M / monthly usage per customer. Czech cost: SalaryExpert 2026, 33.8% employer contributions; CNB CZK/USD ≈20.8. Gross margin 80% vs SaaS Capital 2025 median 77% / top 85%. Cloudflare Workers $0.30/M requests, $0.02/M CPU-ms; Pages static/bandwidth free. OpenRouter FAQ 5% usage. No ad funnel is projected from zero.", 6.42)
footer(s, 6, "EVALUATION")
notes(s, "Five-minute cut. Short term: resolve MiCA/legal and finish/test product. Mid term: onboard paid design partners; measure actual deposit, monthly usage and CAC; do not invent an ad funnel from zero. Long term: break-even is a threshold, not a forecast. Czech fixed cost CZK 45k/mo; at 0.5% take and 80% gross margin, required monthly GMV = 45,000 / (0.005 x 0.80) = CZK 11.25M. At $5k/customer/month (CZK 104k), 108 funded customers; at $15k/customer/month (CZK 312k), 36. The chart is a break-even sensitivity, not a projection. No paid ads until measured LTV/CAC >3x. Czech cost base: part-time contractor CZK 25k + legal/accounting CZK 8k + software/domains CZK 5k + office/other CZK 7k. Full-time Czech developer average gross CZK 439k/year plus 33.8% employer contributions; later. No external round; founder unpaid. Sources: https://www.salaryexpert.com/salary/job/developer/czech-republic ; https://rivermate.com/guides/czech-republic/taxes ; https://www.kurzy.cz/cnb/ekonomika/SFXS1M1USD/ ; https://www.saas-capital.com/blog-posts/what-should-a-saas-income-statement-look-like/ ; https://developers.cloudflare.com/workers/platform/pricing/ ; https://openrouter.ai/docs/faq")

# 7. DEADLINE
# =====================================================================
# 7. DEADLINE
# =====================================================================
s = slide()
question(s, "What is the expected timeframe of the project?", 28)
tb(s, 0.65, 1.38, 12.0, 0.28, "Submission 15 December 2026; final 13 January 2027.", 10.5, SAGE, FONT, spacing=1.15)
tb(s, 0.65, 1.74, 11.9, 0.55, "The deck is submitted on 15 December 2026. From 16 December to 13 January 2027 the public repository and this deck are revised against feedback. The final version is due 13 January 2027.", 8.8, GRAY, FONT, spacing=1.28)
phases = [
 ("01  /  15 DEC 2026", "Submission", "This deck is delivered; the live Sepolia pilot is linked."),
 ("02  /  16 DEC 2026 – 13 JAN 2027", "Improvement window", "Feedback, deck edits and repository checks; no new scope."),
 ("03  /  13 JAN 2027", "Final deadline", "Final deck and repository."),
]
for i, (label, title, body) in enumerate(phases):
    yy = 2.45 + i * 1.16
    tb(s, 0.65, yy, 2.55, 0.18, label, 6.2, DEEP, MONO, caps=True, spacing=1)
    tb(s, 3.18, yy - 0.02, 3.3, 0.28, title, 11.6, INK, FONT, bold=True, spacing=1)
    tb(s, 3.18, yy + 0.26, 3.25, 0.52, body, 7.8, GRAY, FONT, spacing=1.22)
    line(s, 0.65, yy + 0.91, 6.45, yy + 0.91, LINE, 0.7)
tx, ty, tw = 7.0, 2.12, 5.7
line(s, tx, ty, tx + tw, ty, MINT, 1.2)
tb(s, tx, ty + 0.14, tw, 0.2, "DELIVERY WINDOW  /  THIS PRESENTATION", 6.2, SAGE, MONO, caps=True, spacing=1)
tb(s, tx, ty + 0.52, 1.6, 0.3, "15 DEC 2026", 15.5, DEEP, FONT, bold=True, spacing=0.95)
tb(s, tx + 4.0, ty + 0.52, 1.7, 0.3, "13 JAN 2027", 15.5, DEEP, FONT, bold=True, spacing=0.95)
tb(s, tx, ty + 0.86, 1.6, 0.18, "SUBMISSION", 5.8, SAGE, MONO, caps=True, spacing=1)
tb(s, tx + 4.0, ty + 0.86, 1.7, 0.18, "FINAL", 5.8, SAGE, MONO, caps=True, spacing=1)
rect(s, tx, ty + 1.28, tw, 0.16, PALE)
rect(s, tx, ty + 1.28, tw, 0.16, MINT)
circle(s, tx - 0.06, ty + 1.25, 0.22, DEEP, DEEP, 0.6)
circle(s, tx + tw - 0.16, ty + 1.25, 0.22, DEEP, DEEP, 0.6)
tb(s, tx + 1.65, ty + 1.55, 2.4, 0.18, "4-WEEK IMPROVEMENT WINDOW", 6.0, DEEP, MONO, caps=True, spacing=1)
tb(s, tx + 1.65, ty + 1.76, 2.4, 0.18, "28 days · feedback only", 6.0, SAGE, FONT)
line(s, tx, ty + 2.48, tx + tw, ty + 2.48, LINE, 0.7)
tb(s, tx, ty + 2.62, tw, 0.55, "Only this presentation is in scope. Dated rollout, mainnet and SLA are outside this deliverable.", 7.4, GRAY, FONT, spacing=1.2)
footer(s, 7, "DEADLINE")
notes(s, "Submission 15 December 2026; final 13 January 2027. The improvement window is four weeks for feedback, deck edits and repository checks, not new scope. No dated product rollout, mainnet or SLA is claimed.")

# =====================================================================
# 8. CLOSING
# =====================================================================
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-fade.png"), 0, 0, width=Inches(W), height=Inches(H))
logo(s, 0.65, 0.52, 3.0)
tb(s, 0.65, 1.58, 7.2, 0.8, "Thank you.", 44, INK, FONT, bold=True, spacing=0.95)
tb(s, 0.65, 2.48, 7.0, 0.4, "Questions and feedback.", 18, DEEP, FONT, spacing=1.1)
line(s, 0.65, 3.05, 2.1, 3.05, DEEP, 1.1)
tb(s, 0.65, 3.28, 6.2, 0.3, "Verxl Protocol  ·  a clearing layer for AI inference", 10.0, GRAY, FONT, spacing=1.15)
tb(s, 0.65, 3.74, 6.2, 0.26, "verxl.com  ·  me@simonhavlik.com", 9.2, DEEP, MONO, spacing=1.1)
tb(s, 0.65, 4.20, 6.2, 0.26, "Šimon Havlík  ·  Daniel Kolárovský  ·  Miroslava Valová", 8.4, GRAY, FONT, spacing=1.1)
tb(s, 0.65, 4.56, 6.2, 0.26, "VŠE Praha  ·  2SE307 Bitcoin and blockchain  ·  15 December 2026", 7.8, SAGE, FONT, spacing=1.1)
tb(s, 0.65, 5.22, 6.2, 0.3, "Scan the code to open the live pilot.", 8.5, SAGE, FONT, spacing=1.1)
# QR panel right
qx, qy, qw, qh = 8.35, 1.55, 4.2, 3.55
rect(s, qx, qy, qw, qh, WHITE, LINE, 0.9)
spectrum(s, qx, qy, qw, 0.05)
s.shapes.add_picture(os.path.join(ASSETS, "qr-verxl.png"), Inches(qx + 0.25), Inches(qy + 0.30), width=Inches(2.2), height=Inches(2.2))
tb(s, qx + 2.65, qy + 0.42, 1.4, 0.2, "VERXL.COM", 6.4, DEEP, MONO, caps=True, spacing=1)
tb(s, qx + 2.65, qy + 0.68, 1.35, 0.5, "Live\nSepolia\npilot", 12.5, INK, FONT, bold=True, spacing=1.0)
tb(s, qx + 0.25, qy + 2.72, 3.7, 0.3, "Chat · Playground · Registry · API", 7.4, SAGE, FONT, spacing=1.1)
tb(s, qx + 0.25, qy + 3.00, 3.7, 0.2, "macOS · Linux · Windows · Android", 7.0, GRAY, MONO, spacing=1)
footer(s, 8, "VŠE PRAHA", False)
notes(s, "Closing. verxl.com is live on Sepolia. The QR opens the site. The contact is me@simonhavlik.com. The final deck is due 13 January 2027.")

prs.save(OUT)
print(OUT)
print("slides:", len(prs.slides))
