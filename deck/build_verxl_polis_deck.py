#!/usr/bin/env python3
"""Build the Verxl term project proposal in the VŠE FIR / Polis white-mint system."""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
from pptx.oxml.ns import qn

ASSETS = os.path.join(os.path.dirname(__file__), "assets")
OUT = os.path.join(os.path.dirname(__file__), "Verxl_Term_Project_Proposal.pptx")

INK   = RGBColor(0x0B, 0x11, 0x17)
DEEP  = RGBColor(0x1E, 0x5B, 0x45)
SAGE  = RGBColor(0x52, 0x7D, 0x6B)
MINT  = RGBColor(0xB8, 0xF6, 0xDD)
PALE  = RGBColor(0xEA, 0xF7, 0xF1)
LINE  = RGBColor(0xDC, 0xEB, 0xE3)
GRAY  = RGBColor(0x5F, 0x6F, 0x68)
SOFT  = RGBColor(0x8B, 0x98, 0x9E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
OFF   = RGBColor(0xF7, 0xFB, 0xF9)
ROSE  = RGBColor(0xB3, 0x6B, 0x6B)
FONT = "Helvetica Neue"
MONO = "Menlo"

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
    r = p.add_run()
    r.text = text.upper() if caps else text
    r.font.name = font; r.font.size = Pt(size); r.font.bold = bold; r.font.italic = italic
    r.font.color.rgb = color
    return shape

def lines(s, x, y, w, h, items, size=10, color=GRAY, spacing=1.25, font=FONT):
    """items = list of (text, color, bold, size, font)"""
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
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line; sh.line.width = Pt(lw)
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

def notes(s, text):
    s.notes_slide.notes_text_frame.text = text

def logo(s, x=0.65, y=6.94, w=1.38):
    s.shapes.add_picture(os.path.join(ASSETS, "vse-logo.png"), Inches(x), Inches(y), width=Inches(w))

def footer(s, page, section="TERM PROJECT PROPOSAL", show_logo=True):
    if show_logo:
        logo(s)
    tb(s, 2.22, 7.03, 7.2, 0.18, f"VERXL PROTOCOL  ·  {section}", 6.8, SOFT, MONO, caps=True, spacing=1)
    tb(s, 10.9, 7.03, 1.78, 0.18, f"{page:02d} / 14", 6.8, SOFT, MONO, align=PP_ALIGN.RIGHT, spacing=1)

def stat_col(s, x, label, big, note, big_color=DEEP, big_size=28):
    line(s, x, 2.96, x+2.78, 2.96, MINT, 1.2)
    tb(s, x, 3.13, 2.65, 0.18, label, 6.5, SAGE, MONO, caps=True, spacing=1)
    tb(s, x, 3.34, 2.65, 0.5, big, big_size, big_color, FONT, bold=True, spacing=0.9)
    tb(s, x, 3.96, 2.65, 0.72, note, 8.3, GRAY, FONT, spacing=1.28)

def eval_col(s, x, y, label, big, note, big_color=DEEP, big_size=23):
    line(s, x, y, x+2.78, y, MINT, 1.2)
    tb(s, x, y+0.17, 2.65, 0.18, label, 6.5, SAGE, MONO, caps=True, spacing=1)
    tb(s, x, y+0.38, 2.65, 0.5, big, big_size, big_color, FONT, bold=True, spacing=0.9)
    tb(s, x, y+0.98, 2.65, 0.7, note, 8.3, GRAY, FONT, spacing=1.28)

def source(s, text, y=6.52):
    tb(s, 0.65, y, 11.9, 0.24, text, 6.9, SOFT, FONT, spacing=1.1)

def question_header(s, question):
    rect(s, 0.65, 0.335, 0.065, 0.065, MINT)
    tb(s, 0.79, 0.285, 10.5, 0.2, question, 8.4, GRAY, FONT, caps=True, spacing=1)
    line(s, 0.65, 0.56, 12.68, 0.56, LINE, 0.8)

def answer_head(s, q, subtitle, body, title_size=25, body_y=1.78):
    tb(s, 0.65, 0.55, 12.2, 0.9, q, title_size, INK, FONT, bold=True, spacing=0.98)
    tb(s, 0.65, 1.42, 12.0, 0.28, subtitle, 10.5, SAGE, FONT, spacing=1.15)
    if body:
        tb(s, 0.65, body_y, 11.95, 0.92, body, 9.8, GRAY, FONT, spacing=1.32)

def card(s, x, y, w, h, label, big, note, big_color=DEEP, big_size=30):
    rect(s, x, y, w, h, OFF, LINE, 0.8)
    rect(s, x, y, w, 0.035, MINT)
    tb(s, x+0.15, y+0.16, w-0.3, 0.18, label, 6.5, SAGE, MONO, caps=True, spacing=1)
    tb(s, x+0.15, y+0.38, w-0.3, 0.55, big, big_size, big_color, FONT, bold=True, spacing=0.9)
    tb(s, x+0.15, y+1.02, w-0.3, 0.68, note, 8.3, GRAY, FONT, spacing=1.28)

# ---------------- 1. COVER ----------------
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-cover.png"), 0, 0, width=Inches(W), height=Inches(H))
logo(s, 0.65, 0.52, 3.55)
rect(s, 0.65, 1.78, 0.07, 0.07, MINT)
tb(s, 0.8, 1.70, 5.4, 0.22, "TERM PROJECT PROPOSAL  /  VŠE PRAHA", 7.6, DEEP, MONO, caps=True, spacing=1)
tb(s, 0.65, 2.03, 5.8, 1.55, "Verxl Protocol", 39, INK, FONT, bold=True, spacing=0.9)
tb(s, 0.65, 3.62, 5.4, 0.36, "A clearing layer for AI inference", 16.2, DEEP, FONT, spacing=1.1)
line(s, 0.65, 4.18, 2.08, 4.18, DEEP, 1.2)
tb(s, 0.65, 4.37, 5.3, 0.38, "Route · encrypt · verify · settle", 9.5, SAGE, FONT, caps=True, spacing=1.2)
lines(s, 0.65, 5.05, 5.2, 1.2, [
    ("Šimon Havlík  ·  Daniel Kolárovský  ·  Miroslava Valová", INK, False, 9.4, FONT),
    ("Faculty of International Relations  ·  2SE307 Bitcoin and blockchain", GRAY, False, 8.4, FONT),
    ("15 December 2026  ·  live Sepolia pilot at verxl.com", SAGE, False, 8.2, MONO),
], spacing=1.25)
footer(s, 1, "VŠE PRAHA", False)
notes(s, "Verxl Protocol is a clearing layer for AI inference: an OpenAI-compatible API and an encrypted Chat over approved providers. The product is live on Sepolia at verxl.com. This proposal follows the six questions in the VŠE FIR template: problem, target audience, team role, goal, evaluation and timeframe. The deck is factual: the pilot runs three routes; the market data is LiveBench 2.0; the deck does not claim mainnet or an SLA.")

# ---------------- 2. PROBLEM DIVIDER ----------------
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-fade.png"), 0, 0, width=Inches(W), height=Inches(H))
rect(s, 0.66, 1.20, 0.07, 0.07, MINT)
tb(s, 0.82, 1.12, 5.0, 0.2, "01 / PROBLEM", 8.2, DEEP, MONO, caps=True, spacing=1)
tb(s, 0.66, 1.50, 7.4, 1.8, "What problem does your project solve?", 33, INK, FONT, bold=True, spacing=0.96)
line(s, 0.66, 3.85, 2.35, 3.85, DEEP, 1.1)
tb(s, 0.66, 4.05, 6.5, 0.7, "One task can cost 38× more.", 12.2, DEEP, FONT, spacing=1.25)
tb(s, 0.66, 5.35, 1.0, 0.8, "01", 54, PALE, FONT, bold=True, spacing=0.8)
footer(s, 2, "PROBLEM")
notes(s, "The problem is not that frontier models are bad. The problem is that access is sold as a bundle: a model, a cloud, a data policy and an account. The buyer cannot see the efficient route, cannot carry one key across providers, and cannot verify what the operator stores. The next slide quantifies the price gap with LiveBench 2.0 data.")

# ---------------- 3. PROBLEM ANSWER ----------------
s = slide()
answer_head(s, "What problem does your project solve?",
            "The same task can cost 38× more at the frontier.",
            "Price opacity, fragmented access and privacy by policy. A buyer chooses a model, a cloud and a data policy in one purchase; the operator sees the prompt. Providers with capacity have no neutral distribution.",
            title_size=25)
stat_col(s, 0.65, "PRICE / FRONTIER", "38×", "Claude Fable 5.1 costs 38× DeepSeek V4.1 Flash per successful task on LiveBench 2.0.", ROSE, 28)
for sep in (3.70, 6.81, 9.92):
    line(s, sep, 2.96, sep, 5.82, LINE, 0.6)
line(s, 0.82, 4.92, 3.35, 4.92, LINE, 1.0); rect(s, 0.82, 4.92, 0.17, 0.16, ROSE)
tb(s, 0.82, 5.12, 2.55, 0.2, "1× DeepSeek  →  38× Claude", 7.1, GRAY, MONO)
tb(s, 0.82, 5.43, 2.6, 0.3, "Same task; 38× the frontier cost.", 6.8, SAGE, FONT, spacing=1.15)
stat_col(s, 3.76, "PRICE / GEMINI", "11.5×", "Gemini 4 Argon costs 11.5× DeepSeek. GPT-6.1 Sol is 4.2× DeepSeek.", DEEP, 28)
line(s, 3.93, 4.92, 6.46, 4.92, LINE, 1.0)
rect(s, 3.93, 4.92, 0.57, 0.16, DEEP)
tb(s, 3.93, 5.12, 2.55, 0.2, "11.5× Gemini  /  4.2× GPT-6.1 Sol", 7.1, GRAY, MONO)
tb(s, 3.93, 5.43, 2.6, 0.3, "The efficient route is 11.5× cheaper.", 6.8, SAGE, FONT, spacing=1.15)
stat_col(s, 6.87, "ACCESS / PILOT", "3", "Qwen 3.5 4B in Prague; DeepSeek V4.1 Flash and MiMo 2.6 Flash through official bridges.", DEEP, 30)
for i,(x,col) in enumerate([(7.12, DEEP), (7.72, SAGE), (8.32, MINT)]):
    circle(s, x, 4.96, 0.16, col, DEEP, 0.8)
    if i<2: line(s, x+0.16, 5.04, x+0.44, 5.04, SAGE, 0.8)
tb(s, 7.05, 5.16, 2.55, 0.2, "1 host  ·  2 official bridges", 7.1, GRAY, MONO)
tb(s, 7.05, 5.43, 2.6, 0.3, "Three routes; the registry can grow.", 6.8, SAGE, FONT, spacing=1.15)
stat_col(s, 9.98, "PRIVACY / CHAT", "0", "Plaintext messages stored by Chat. Ciphertext in Postgres; an API key cannot open history.", DEEP, 30)
rect(s, 10.13, 4.82, 0.78, 0.34, PALE, LINE); tb(s, 10.15, 4.90, 0.74, 0.16, "browser", 6.2, SAGE, MONO, align=PP_ALIGN.CENTER)
rect(s, 11.02, 4.82, 0.78, 0.34, PALE, LINE); tb(s, 11.04, 4.90, 0.74, 0.16, "postgres", 6.2, SAGE, MONO, align=PP_ALIGN.CENTER)
line(s, 10.91, 4.99, 11.01, 4.99, DEEP, 1.0)
tb(s, 10.13, 5.22, 2.6, 0.2, "ciphertext envelope", 6.8, GRAY, MONO)
tb(s, 10.13, 5.43, 2.6, 0.3, "Chat only; bridge requests follow provider policy.", 6.8, SAGE, FONT, spacing=1.15)
source(s, "LiveBench 2.0  ·  25 Oct 2026  ·  Abacus.AI  ·  cost per successful task. 38× = $6.904 / $0.181; 11.5× = $2.073 / $0.181; 4.2× = $0.761 / $0.181. Chat privacy is ciphertext-only; API bridge requests follow upstream provider policy.")
footer(s, 3, "PROBLEM")
notes(s, "LiveBench 2.0 Overall, 25 October 2026. DeepSeek V4.1 Flash: 74.0 at $0.181 per successful task. Claude Fable 5.1: 85.7 at $6.904 (38×). Gemini 4 Argon: 79.3 at $2.073 (11.5×). GPT-6.1 Sol: 84.1 at $0.761 (4.2×). The pilot runs Qwen 3.5 4B on Prague bare metal, plus DeepSeek V4.1 Flash and MiMo 2.6 Flash through official bridges. Chat stores ciphertext; the operator sees metadata. The claims are about Chat, not every API request.")

# ---------------- 4. TARGET DIVIDER ----------------
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-fade.png"), 0, 0, width=Inches(W), height=Inches(H))
rect(s, 0.66, 1.20, 0.07, 0.07, MINT)
tb(s, 0.82, 1.12, 5.0, 0.2, "02 / USERS", 8.2, DEEP, MONO, caps=True, spacing=1)
tb(s, 0.66, 1.50, 7.0, 1.8, "Who is the target audience?", 33, INK, FONT, bold=True, spacing=0.96)
line(s, 0.66, 3.85, 2.35, 3.85, DEEP, 1.1)
tb(s, 0.66, 4.05, 6.5, 0.7, "Technical teams with a visible inference bill.", 12.2, DEEP, FONT, spacing=1.25)
tb(s, 0.66, 5.35, 1.0, 0.8, "02", 54, PALE, FONT, bold=True, spacing=0.8)
footer(s, 4, "TARGET AUDIENCE")
notes(s, "The first segment is deliberately narrow: technical buyers who already pay for inference and can see the bill. It is not a TAM slide. The pilot can serve these users without a sales team.")

# ---------------- 5. TARGET ANSWER ----------------
s = slide()
tb(s, 0.65, 0.55, 12.0, 0.6, "Who is the target audience?", 25, INK, FONT, bold=True, spacing=0.98)
tb(s, 0.65, 1.22, 6.2, 0.3, "Technical teams with a visible inference bill.", 10.5, SAGE, FONT, spacing=1.15)
rows = [
 ("01 / PRODUCT TEAMS", "AI startups and product teams (1–50 engineers) running multiple models. Inference is a visible line item.", DEEP),
 ("02 / PRIVACY-SENSITIVE", "Legal, health and finance teams that cannot send plaintext to a single vendor.", DEEP),
 ("03 / PROVIDERS", "Independent GPU or API capacity without distribution. Reviewed before listing.", DEEP),
 ("04 / ACADEMIC", "Model comparison and reproducible inference. A secondary segment.", SAGE),
]
y = 1.95
for label, body, col in rows:
    tb(s, 0.65, y, 1.65, 0.2, label, 6.6, col, MONO, caps=True, spacing=1)
    tb(s, 2.25, y-0.02, 4.35, 0.72, body, 9.2, GRAY, FONT, spacing=1.25)
    line(s, 0.65, y+0.75, 6.45, y+0.75, LINE, 0.7)
    y += 0.93
s.shapes.add_picture(os.path.join(ASSETS, "map-light.png"), Inches(7.0), Inches(2.02), width=Inches(5.66), height=Inches(3.18))
rect(s, 7.0, 5.22, 5.66, 0.015, LINE)
tb(s, 7.0, 5.32, 5.66, 0.36, "CURRENT PILOT  /  3 routes · 1 Prague host · 2 official bridges", 6.6, SAGE, MONO, caps=True, spacing=1)
tb(s, 0.65, 6.18, 6.1, 0.26, "The segments are an initial target, not a TAM estimate.", 6.8, SOFT, FONT, italic=True)
footer(s, 5, "TARGET AUDIENCE")
notes(s, "Four segments: product teams with multi-model workloads; privacy-sensitive teams; independent providers; academic users. The map shows the live pilot route: client browser to Cloudflare edge to Prague bare metal; official bridges connect DeepSeek V4.1 Flash and MiMo 2.6 Flash. The map is illustrative of the route, not a coverage or latency guarantee.")

# ---------------- 6. ROLE DIVIDER ----------------
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-fade.png"), 0, 0, width=Inches(W), height=Inches(H))
rect(s, 0.66, 1.20, 0.07, 0.07, MINT)
tb(s, 0.82, 1.12, 5.0, 0.2, "03 / TEAM", 8.2, DEEP, MONO, caps=True, spacing=1)
tb(s, 0.66, 1.50, 7.0, 1.8, "What are our roles?", 33, INK, FONT, bold=True, spacing=0.96)
line(s, 0.66, 3.85, 2.35, 3.85, DEEP, 1.1)
tb(s, 0.66, 4.05, 6.5, 0.7, "Three members.", 12.2, DEEP, FONT, spacing=1.25)
tb(s, 0.66, 5.35, 1.0, 0.8, "03", 54, PALE, FONT, bold=True, spacing=0.8)
footer(s, 6, "TEAM")
notes(s, "Verxl is an applied blockchain project at VŠE Praha. The team is three people; the deck does not overstate headcount or claim a company behind the project.")

# ---------------- 7. TEAM ANSWER ----------------
s = slide()
tb(s, 0.65, 0.55, 12.0, 0.6, "What are our roles?", 25, INK, FONT, bold=True, spacing=0.98)
tb(s, 0.65, 1.22, 12.0, 0.3, "Three members cover the protocol, verification and compliance.", 10.5, SAGE, FONT, spacing=1.15)
team = [
 ("simon.jpg", "Šimon Havlík", "FOUNDER / LEAD ARCHITECT", "Protocol, product and infrastructure: edge router, clearing switch, Prague Qwen host, encrypted Chat."),
 ("daniel.jpg", "Daniel Kolárovský", "HEAD OF VERIFICATION / SLA", "Canary probes, SLA measurement and the process checks behind each release."),
 ("miroslava.jpg", "Miroslava Valová", "HEAD OF COMPLIANCE / RESEARCH", "MiCA/GDPR scope, market research, partner diligence and institutional governance."),
]
for i,(img,name,role,bio) in enumerate(team):
    x = 0.65 + i*4.0
    line(s, x, 1.70, x+3.58, 1.70, MINT, 1.2)
    s.shapes.add_picture(os.path.join(ASSETS, img), Inches(x+0.32), Inches(1.84), width=Inches(2.9), height=Inches(3.625))
    tb(s, x+0.32, 5.62, 2.9, 0.28, name, 11.4, INK, FONT, bold=True, spacing=1)
    tb(s, x+0.32, 5.93, 2.9, 0.2, role, 6.3, DEEP, MONO, caps=True, spacing=1)
    tb(s, x+0.32, 6.22, 2.9, 0.55, bio, 7.8, GRAY, FONT, spacing=1.2)
footer(s, 7, "TEAM")
notes(s, "Verxl is an applied blockchain project at VŠE Praha. The team is three people. Simon Havlík is the founder and lead architect: the edge router, clearing switch, Prague Qwen host and encrypted Chat. Daniel Kolárovský leads verification: canary probes, SLA measurement and process checks. Miroslava Valová leads compliance and research: MiCA/GDPR, market research and institutional governance. The portraits are shown at their native aspect ratio.")

# ---------------- 8. GOAL DIVIDER ----------------
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-fade.png"), 0, 0, width=Inches(W), height=Inches(H))
rect(s, 0.66, 1.20, 0.07, 0.07, MINT)
tb(s, 0.82, 1.12, 5.0, 0.2, "04 / GOAL", 8.2, DEEP, MONO, caps=True, spacing=1)
tb(s, 0.66, 1.50, 7.0, 1.8, "What is the goal of the project?", 33, INK, FONT, bold=True, spacing=0.96)
line(s, 0.66, 3.85, 2.35, 3.85, DEEP, 1.1)
tb(s, 0.66, 4.05, 6.5, 0.7, "Build the clearing layer: route, encrypt, verify, settle.", 12.2, DEEP, FONT, spacing=1.25)
tb(s, 0.66, 5.35, 1.0, 0.8, "04", 54, PALE, FONT, bold=True, spacing=0.8)
footer(s, 8, "GOAL & FUNCTIONS")
notes(s, "The goal is a working clearing layer, not another model. The functions are deliberately narrow and testable: routing, registry, encryption, verification, settlement and metering.")

# ---------------- 9. GOAL ANSWER ----------------
s = slide()
tb(s, 0.65, 0.55, 12.0, 0.6, "What is the goal of the project?", 25, INK, FONT, bold=True, spacing=0.98)
tb(s, 0.65, 1.22, 12.0, 0.28, "Route, encrypt, verify and settle inference across approved providers.", 10.5, SAGE, FONT, spacing=1.15)
tb(s, 0.65, 1.62, 6.05, 0.78, "We do not train models. Verxl clears access to approved providers and meters the output. The pilot runs three routes: Qwen 3.5 4B in Prague; DeepSeek V4.1 Flash and MiMo 2.6 Flash through official bridges.", 8.9, GRAY, FONT, spacing=1.28)
funcs = [
 ("01 / ROUTE", "OpenAI-compatible /v1/chat/completions; streaming; three routes."),
 ("02 / REGISTRY", "Provider application, review, approved routes and live catalogue."),
 ("03 / ENCRYPT", "Chat key from wallet; AES-256-GCM; ciphertext only."),
 ("04 / VERIFY", "Seed-42 canary; 99.8% fidelity; automatic fallback."),
 ("05 / SETTLE", "USDC on Arbitrum; 50 bps; providers keep 99.5%."),
 ("06 / METER", "Keys, usage and billing; an API key cannot open chat."),
]
for i,(label,body) in enumerate(funcs):
    col = i % 2; row = i // 2
    x = 0.65 + col*3.05; y = 2.72 + row*1.14
    tb(s, x, y, 2.75, 0.18, label, 6.3, DEEP, MONO, caps=True, spacing=1)
    tb(s, x, y+0.22, 2.75, 0.72, body, 7.9, GRAY, FONT, spacing=1.25)
    if col == 0: line(s, 0.65, y+0.97, 3.35, y+0.97, LINE, 0.6)
# architecture panel
ax, ay, aw, ah = 6.85, 2.12, 5.85, 4.1
line(s, ax, ay, ax+aw, ay, MINT, 1.2)
tb(s, ax, ay+0.15, aw-0.3, 0.2, "CLEARING PATH  /  CURRENT PILOT", 6.3, SAGE, MONO, caps=True, spacing=1)
def box(x,y,w,h,title,sub,fill=WHITE,line_c=LINE,title_color=INK):
    rect(s,x,y,w,h,fill,line_c,0.8)
    tb(s,x+0.1,y+0.1,w-0.2,0.2,title,6.2,title_color,MONO,caps=True,spacing=1)
    tb(s,x+0.1,y+0.32,w-0.2,0.4,sub,6.4,GRAY,FONT,spacing=1.15)
def arrow(x1,y1,x2,y2):
    sh=s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW,Inches(x1),Inches(y1),Inches(x2-x1),Inches(0.13))
    sh.shadow.inherit=False; flat(sh); sh.fill.solid(); sh.fill.fore_color.rgb=MINT; sh.line.fill.background()

def down_arrow(x,y,h):
    sh=s.shapes.add_shape(MSO_SHAPE.DOWN_ARROW,Inches(x),Inches(y),Inches(0.13),Inches(h))
    sh.shadow.inherit=False; flat(sh); sh.fill.solid(); sh.fill.fore_color.rgb=MINT; sh.line.fill.background()
box(7.02,2.52,1.55,0.8,"BROWSER","client")
box(8.92,2.52,1.52,0.8,"EDGE","Cloudflare")
box(10.82,2.52,1.55,0.8,"PRAGUE","Qwen 3.5 4B")
box(10.82,3.62,1.55,0.8,"BRIDGES","DeepSeek · MiMo")
box(7.02,4.05,1.55,0.8,"POSTGRES","ciphertext")
box(8.92,4.05,1.52,0.8,"ORACLE","seed 42")
box(8.92,5.18,1.52,0.72,"ARBITRUM","USDC · 50 bps")
arrow(8.57,2.86,8.90,2.86)
arrow(10.44,2.86,10.80,2.86)
arrow(10.44,3.25,10.80,3.86)
down_arrow(9.62,3.34,0.69)
down_arrow(9.62,4.87,0.29)
down_arrow(7.72,3.34,0.69)
tb(s, 8.60, 2.98, 0.5, 0.13, "request", 5.0, SAGE, MONO)
tb(s, 10.43, 2.98, 0.45, 0.13, "route", 5.0, SAGE, MONO)
tb(s, 7.80, 3.48, 0.75, 0.13, "ciphertext", 5.0, SAGE, MONO)
tb(s, 9.72, 3.48, 0.45, 0.13, "probe", 5.0, SAGE, MONO)
tb(s, 9.72, 4.95, 0.5, 0.13, "receipt", 5.0, SAGE, MONO)
line(s, 10.44, 3.22, 10.80, 3.84, SAGE, 0.8)
tb(s, 0.65, 6.12, 6.0, 0.26, "ACCESS POLICY  /  approved providers · uncensored routes <20B · frontier work to safety-aligned providers", 6.2, SAGE, MONO, spacing=1.1)
tb(s, 0.65, 6.38, 6.0, 0.2, "Current pilot: 3 routes; 1 Prague host; 2 official bridges.", 6.6, SOFT, FONT, italic=True)
footer(s, 9, "GOAL & FUNCTIONS")
notes(s, "The product has six functions. Route: an OpenAI-compatible streaming endpoint. Registry: providers apply, are reviewed and only approved routes are listed. Encrypt: the Chat key is derived from the wallet and AES-256-GCM encrypts the payload; Postgres stores ciphertext. Verify: a seed-42 canary runs every 30 minutes and falls back automatically. Settle: 50 bps of compute, 99.5% to the provider, paid in USDC on Arbitrum. Meter: API keys open usage and billing, not chat history. The access policy applies to every route: approved providers, uncensored models under 20B, frontier work to safety-aligned providers.")

# ---------------- 10. EVALUATION DIVIDER ----------------
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-fade.png"), 0, 0, width=Inches(W), height=Inches(H))
rect(s, 0.66, 1.20, 0.07, 0.07, MINT)
tb(s, 0.82, 1.12, 5.0, 0.2, "05 / EVIDENCE", 8.2, DEEP, MONO, caps=True, spacing=1)
tb(s, 0.66, 1.50, 8.2, 1.8, "How will you evaluate if the project was successful?", 31, INK, FONT, bold=True, spacing=0.96)
line(s, 0.66, 3.85, 2.35, 3.85, DEEP, 1.1)
tb(s, 0.66, 4.05, 6.8, 0.7, "Cost, latency, verification and privacy.", 12.2, DEEP, FONT, spacing=1.25)
tb(s, 0.66, 5.35, 1.0, 0.8, "05", 54, PALE, FONT, bold=True, spacing=0.8)
footer(s, 10, "EVALUATION")
notes(s, "The evaluation is an acceptance test, not a claim of an SLA. The pilot measurements are from Sepolia; the targets are for the term project. The four tests cover quality/cost, latency, verification and privacy/economics.")

# ---------------- 11. EVALUATION ANSWER ----------------
s = slide()
tb(s, 0.65, 0.55, 12.2, 0.9, "How will you evaluate if the project was successful?", 24, INK, FONT, bold=True, spacing=0.98)
tb(s, 0.65, 1.47, 12.0, 0.28, "Cost, latency, verification and privacy on the Sepolia pilot.", 10.2, SAGE, FONT, spacing=1.15)
tb(s, 0.65, 1.78, 11.9, 0.3, "The pilot passes when all four targets are met; no mainnet or SLA is claimed.", 8.8, GRAY, FONT, spacing=1.2)
# card 1 frontier
x=0.65; y=2.90; w=2.95; h=3.4
eval_col(s,x,y,"QUALITY / COST","74.0","LiveBench overall / cost per successful task. Frontier: 85.7 at $6.904 (38×).",DEEP,28)
rect(s,x,y,w,0.035,ROSE)
tb(s,x+1.2,y+0.52,w-1.3,0.24,"$0.181",9.6,DEEP,MONO,spacing=1)
# mini frontier
fx, fy, fw, fh = x+0.18, y+1.55, w-0.32, 1.12
line(s,fx,fy+fh,fx+fw,fy+fh,LINE,0.7); line(s,fx,fy,fx,fy+fh,LINE,0.7)
import math
def fxp(c): return fx + ((math.log10(c)+1)/2)*fw
def fyp(sc): return fy+fh - ((sc-60)/28)*fh
pts=[(0.181,74,'DEEP'),(6.904,85.7,'ROSE'),(2.073,79.3,'SOFT'),(0.183,68.5,'MINT')]
# frontier dashed
line(s,fxp(0.181),fyp(74),fxp(0.761),fyp(84.1),DEEP,0.8)
line(s,fxp(0.761),fyp(84.1),fxp(6.904),fyp(85.7),DEEP,0.8)
for cost,score,col in pts:
    c={'DEEP':DEEP,'ROSE':ROSE,'SOFT':SOFT,'MINT':MINT}[col]
    circle(s,fxp(cost)-0.035,fyp(score)-0.035,0.07,c,DEEP,0.6)
tb(s,fx+0.08,fy+fh-0.14,0.8,0.12,"$0.1",5.4,SOFT,MONO)
tb(s,fx+fw-0.3,fy+fh-0.14,0.3,0.12,"$10",5.4,SOFT,MONO,align=PP_ALIGN.RIGHT)
tb(s,fxp(0.181)+0.06,fyp(74)-0.06,0.75,0.12,"DeepSeek",5.6,DEEP,MONO)
tb(s,x+0.15,y+2.88,w-0.3,0.36,"Target: ≤$0.20 at ≥74.0.",6.8,DEEP,MONO,spacing=1.1)
for sep in (3.70, 6.81, 9.92):
    line(s, sep, 2.90, sep, 6.10, LINE, 0.6)
# card 2 latency
x=3.76
eval_col(s,x,y,"LATENCY","38 / 85 / 92","ms P50 TTFT: Qwen / MiMo / DeepSeek on the Sepolia pilot.",DEEP,23)
rect(s,x,y,w,0.035,MINT)
for i,(lab,val,col) in enumerate([("Qwen",38,DEEP),("MiMo",85,SAGE),("DeepSeek",92,DEEP)]):
    yy=y+1.62+i*0.34
    tb(s,x+0.15,yy,0.75,0.16,lab,6.6,GRAY,MONO)
    rect(s,x+0.92,yy+0.055,1.2,0.11,LINE)
    rect(s,x+0.92,yy+0.055,1.2*(val/100),0.11,col)
    tb(s,x+2.18,yy,0.6,0.16,f"{val}",6.6,DEEP,MONO,align=PP_ALIGN.RIGHT)
tb(s,x+0.15,y+2.88,w-0.3,0.36,"Target: ≤100ms P50; canary success ≥99.5%.",6.8,DEEP,MONO,spacing=1.1)
# card 3 fidelity
x=6.87
eval_col(s,x,y,"VERIFICATION","99.8%","Oracle fidelity on the demo telemetry. Seed 42; every 30 minutes; automatic fallback.",DEEP,26)
rect(s,x,y,w,0.035,DEEP)
# ring
cx,cy,d = x+1.42,y+2.05,0.86
circle(s,cx-d/2,cy-d/2,d,PALE,LINE,0.6)
circle(s,cx-d/2,cy-d/2,d,None,MINT,3.2)
tb(s,cx-0.42,cy-0.15,0.84,0.24,"99.8%",8.0,DEEP,MONO,bold=True,align=PP_ALIGN.CENTER)
tb(s,x+0.15,y+2.88,w-0.3,0.36,"Target: zero undetected downgrades.",6.8,DEEP,MONO,spacing=1.1)
# card 4 privacy/econ
x=9.98
eval_col(s,x,y,"PRIVACY / ECONOMICS","0 / 50 bps","Plaintext rows in Chat / protocol fee. API key cannot open chat; providers keep 99.5%.",DEEP,23)
rect(s,x,y,w,0.035,MINT)
for i,(lab) in enumerate(["browser","ciphertext","postgres"]):
    bx=x+0.16+i*0.87
    rect(s,bx,y+1.72,0.76,0.3,PALE,LINE,0.6)
    tb(s,bx+0.02,y+1.79,0.72,0.14,lab,5.4,SAGE,MONO,align=PP_ALIGN.CENTER)
    if i<2: line(s,bx+0.76,y+1.87,bx+0.86,y+1.87,DEEP,0.8)
tb(s,x+0.15,y+2.88,w-0.3,0.36,"Target: zero plaintext rows; 100% payout reconciliation.",6.8,DEEP,MONO,spacing=1.1)
source(s, "LiveBench 2.0 · 25 Oct 2026 · Abacus.AI · cost per successful task. Latency and oracle fidelity are Sepolia demo measurements, not an SLA. Targets are the term-project acceptance thresholds.", 6.48)
footer(s, 11, "EVALUATION")
notes(s, "Test 1: quality/cost. DeepSeek V4.1 Flash 74.0 at $0.181; frontier 85.7 at $6.904; the frontier costs 38× for +11.7 points. Target: the efficient route stays at or below $0.20 per successful task with a score of at least 74.0. Test 2: latency. Qwen 38ms, MiMo 85ms, DeepSeek 92ms P50 TTFT on the demo; target ≤100ms P50 and ≥99.5% canary success. Test 3: verification. 99.8% oracle fidelity on the demo telemetry; seed 42; every 30 minutes; automatic fallback; target zero undetected downgrades. Test 4: privacy/economics. Zero plaintext rows stored by Chat; API keys cannot open history; 50 bps; providers keep 99.5%; target 100% payout reconciliation. No mainnet or SLA claim.")

# ---------------- 12. DEADLINE DIVIDER ----------------
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-fade.png"), 0, 0, width=Inches(W), height=Inches(H))
rect(s, 0.66, 1.20, 0.07, 0.07, MINT)
tb(s, 0.82, 1.12, 5.0, 0.2, "06 / DEADLINE", 8.2, DEEP, MONO, caps=True, spacing=1)
tb(s, 0.66, 1.50, 8.2, 1.8, "What is the expected timeframe of the project?", 31, INK, FONT, bold=True, spacing=0.96)
line(s, 0.66, 3.85, 2.35, 3.85, DEEP, 1.1)
tb(s, 0.66, 4.05, 7.0, 0.7, "Submission 15 December 2026. Final 13 January 2027.", 12.2, DEEP, FONT, spacing=1.25)
tb(s, 0.66, 5.35, 1.0, 0.8, "06", 54, PALE, FONT, bold=True, spacing=0.8)
footer(s, 12, "DEADLINE")
notes(s, "The term project has two dates. The presentation is submitted on 15 December 2026. The improvement window runs from 15 December 2026 to the final deadline on 13 January 2027. This is the class deliverable; no other dated rollout is claimed.")

# ---------------- 13. DEADLINE ANSWER ----------------
s = slide()
tb(s, 0.65, 0.55, 12.0, 0.6, "What is the expected timeframe of the project?", 25, INK, FONT, bold=True, spacing=0.98)
tb(s, 0.65, 1.22, 12.0, 0.28, "Submission 15 December 2026; final 13 January 2027.", 10.5, SAGE, FONT, spacing=1.15)
tb(s, 0.65, 1.72, 11.9, 0.62, "The presentation is submitted on 15 December 2026. From 16 December to 13 January 2027, the deck and the public repository are revised against feedback. The final version is due 13 January 2027. This is the class deliverable; no other dated rollout is claimed.", 8.8, GRAY, FONT, spacing=1.28)
phases=[
 ("01  /  15 DEC 2026", "Submission", "This presentation is delivered; the live Sepolia demo is linked."),
 ("02  /  16 DEC 2026 – 13 JAN 2027", "Improvement window", "Feedback, deck edits and repository checks; no new scope."),
 ("03  /  13 JAN 2027", "Final deadline", "Final deck and repository."),
]
for i,(label,title,body) in enumerate(phases):
    y=2.35+i*1.18
    tb(s,0.65,y,2.55,0.18,label,6.2,DEEP,MONO,caps=True,spacing=1)
    tb(s,3.18,y-0.02,3.3,0.28,title,11.6,INK,FONT,bold=True,spacing=1)
    tb(s,3.18,y+0.26,3.25,0.55,body,7.9,GRAY,FONT,spacing=1.22)
    line(s,0.65,y+0.93,6.45,y+0.93,LINE,0.7)
# delivery window panel
tx,ty,tw=7.0,2.05,5.7
line(s,tx,ty,tx+tw,ty,MINT,1.2)
tb(s,tx,ty+0.14,tw,0.2,"DELIVERY WINDOW  /  THIS PRESENTATION",6.2,SAGE,MONO,caps=True,spacing=1)
tb(s,tx,ty+0.52,1.6,0.3,"15 DEC 2026",15.5,DEEP,FONT,bold=True,spacing=0.95)
tb(s,tx+4.0,ty+0.52,1.7,0.3,"13 JAN 2027",15.5,DEEP,FONT,bold=True,spacing=0.95)
tb(s,tx,ty+0.86,1.6,0.18,"SUBMISSION",5.8,SAGE,MONO,caps=True,spacing=1)
tb(s,tx+4.0,ty+0.86,1.7,0.18,"FINAL",5.8,SAGE,MONO,caps=True,spacing=1)
# window bar
rect(s,tx,ty+1.28,tw,0.16,PALE)
rect(s,tx,ty+1.28,tw,0.16,MINT)
circle(s,tx-0.06,ty+1.25,0.22,DEEP,DEEP,0.6)
circle(s,tx+tw-0.16,ty+1.25,0.22,DEEP,DEEP,0.6)
tb(s,tx+1.65,ty+1.55,2.4,0.18,"4-WEEK IMPROVEMENT WINDOW",6.0,DEEP,MONO,caps=True,spacing=1)
tb(s,tx+1.65,ty+1.76,2.4,0.18,"28 days · feedback only",6.0,SAGE,FONT)
line(s,tx,ty+2.48,tx+tw,ty+2.48,LINE,0.7)
tb(s,tx,ty+2.62,tw,0.55,"Only this presentation is in scope. Dated rollout, mainnet and SLA are outside this deliverable.",7.4,GRAY,FONT,spacing=1.2)
footer(s,13,"DEADLINE")
notes(s, "The class deadline is 15 December 2026. The final deadline is 13 January 2027; the improvement window is the four weeks between them, 29 days. The work in that window is feedback, deck edits and repository checks, not new scope. The deck does not claim a dated product rollout, mainnet launch or SLA.")

# ---------------- 14. CLOSING ----------------
s = slide()
s.shapes.add_picture(os.path.join(ASSETS, "map-light-fade.png"), 0, 0, width=Inches(W), height=Inches(H))
logo(s, 0.65, 0.52, 3.55)
tb(s, 0.65, 1.60, 7.2, 0.8, "Thank you.", 44, INK, FONT, bold=True, spacing=0.95)
tb(s, 0.65, 2.55, 7.0, 0.4, "Questions and feedback.", 18, DEEP, FONT, spacing=1.1)
line(s, 0.65, 3.12, 2.1, 3.12, DEEP, 1.1)
tb(s, 0.65, 3.35, 6.2, 0.3, "Verxl Protocol  ·  a clearing layer for AI inference", 10.0, GRAY, FONT, spacing=1.15)
tb(s, 0.65, 3.85, 6.2, 0.26, "verxl.com  ·  me@simonhavlik.com", 9.2, DEEP, MONO, spacing=1.1)
tb(s, 0.65, 4.35, 6.2, 0.26, "Šimon Havlík  ·  Daniel Kolárovský  ·  Miroslava Valová", 8.4, GRAY, FONT, spacing=1.1)
tb(s, 0.65, 4.72, 6.2, 0.26, "VŠE Praha  ·  2SE307 Bitcoin and blockchain  ·  15 December 2026", 7.8, SAGE, FONT, spacing=1.1)
footer(s,14,"VŠE PRAHA", False)
notes(s, "The live demo is at verxl.com; the public repository is the record. The next step is feedback on the pilot, the evaluation plan and the provider review process.")

prs.save(OUT)
print(OUT)
print("slides:", len(prs.slides))
