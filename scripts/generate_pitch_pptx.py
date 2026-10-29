import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

SRC_PPTX = '/Users/simon/.gemini/antigravity/brain/37cc30cf-d21d-4363-a324-88400982cfc8/.user_uploaded/media_1793104777105_8c1b1953.pptx'
OUT_PPTX_REPO = '/Users/simon/dev/verxl-protocol/Verxl_Protocol_Pitch_Presentation.pptx'
OUT_PPTX_PUBLIC = '/Users/simon/dev/verxl-protocol/public/Verxl_Protocol_Pitch_Presentation.pptx'
OUT_PPTX_BRAIN = '/Users/simon/.gemini/antigravity/brain/37cc30cf-d21d-4363-a324-88400982cfc8/Verxl_Protocol_Pitch_Presentation.pptx'

prs = Presentation(SRC_PPTX)

# Institutional FIR VŠE theme colors
NAVY_BG = RGBColor(7, 11, 19)
CARD_BG = RGBColor(12, 18, 30)
CARD_BORDER = RGBColor(30, 58, 95)
TEXT_WHITE = RGBColor(255, 255, 255)
TEXT_SLATE = RGBColor(148, 163, 184)
TEXT_MUTED = RGBColor(100, 116, 139)
ACCENT_BLUE = RGBColor(56, 189, 248)
ACCENT_EMERALD = RGBColor(52, 211, 153)
ACCENT_AMBER = RGBColor(251, 191, 36)
ACCENT_PURPLE = RGBColor(192, 132, 252)
ACCENT_RED = RGBColor(248, 113, 113)

def clear_content_shapes(slide, keep_indices=[0]):
    shapes_to_remove = []
    for idx, shape in enumerate(slide.shapes):
        if idx not in keep_indices:
            shapes_to_remove.append(shape)
    for shape in shapes_to_remove:
        sp = shape._element
        sp.getparent().remove(sp)

def add_header(slide, title_text, subtitle_text=""):
    title_box = slide.shapes.add_textbox(Inches(0.6), Inches(0.4), Inches(12.1), Inches(0.85))
    tf = title_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = "Arial"
    p.font.size = Pt(23)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    if subtitle_text:
        p2 = tf.add_paragraph()
        p2.text = subtitle_text
        p2.font.name = "Arial"
        p2.font.size = Pt(12)
        p2.font.color.rgb = ACCENT_BLUE

def add_speaker_note(slide, note_text):
    notes_slide = slide.notes_slide
    tf = notes_slide.notes_text_frame
    tf.text = note_text

# ==============================================================================
# SLIDE 1: Title
# ==============================================================================
slide1 = prs.slides[0]
for shape in slide1.shapes:
    if shape.has_text_frame:
        shape.text_frame.clear()
        p = shape.text_frame.paragraphs[0]
        p.text = "VERXL PROTOCOL"
        p.font.name = "Arial Black"
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        
        p2 = shape.text_frame.add_paragraph()
        p2.text = "Capital-Light Decentralized AI Inference Clearing Switch"
        p2.font.size = Pt(18)
        p2.font.color.rgb = ACCENT_BLUE
        
        p3 = shape.text_frame.add_paragraph()
        p3.text = "\nŠimon Havlík · Prague University of Economics and Business (VŠE Praha)\nAcademic University Project Collaboration · 2026"
        p3.font.size = Pt(12.5)
        p3.font.color.rgb = TEXT_SLATE

add_speaker_note(slide1, 
    "SPEAKER SCRIPT (0:00 - 0:25 · 25s)\n"
    "Good morning. I'm Šimon Havlík from Prague University of Economics and Business. "
    "Today, I'm presenting Verxl Protocol: a capital-light, decentralized clearing switch for global AI inference. "
    "Hyperscalers like AWS and OpenAI extract 80 to 90% markups on commodity models while independent datacenters sit with idle GPUs. "
    "Verxl replaces this broken paradigm with a stateless, 50 basis point clearing switch settling natively on Arbitrum L2."
)

# ==============================================================================
# SLIDE 2: Section Divider 1 - Problem
# ==============================================================================
add_speaker_note(prs.slides[1],
    "SPEAKER SCRIPT (0:25 - 0:35 · 10s)\n"
    "Let's begin with the core problem: the massive economic drag holding back artificial intelligence compute liquidity."
)

# ==============================================================================
# SLIDE 3: Content - Problem Breakdown
# ==============================================================================
slide3 = prs.slides[2]
clear_content_shapes(slide3, keep_indices=[0])
add_header(slide3, "The 80%+ Cloud AI Markup & Fragmented GPU Compute", "Centralized AI gateways are rent-seeking tollbooths holding back compute liquidity")

col_width = Inches(3.8)
col_height = Inches(4.5)
top_pos = Inches(1.6)

# Card 1: Hyperscaler Monopoly
card1 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), top_pos, col_width, col_height)
card1.fill.solid()
card1.fill.fore_color.rgb = CARD_BG
card1.line.color.rgb = ACCENT_RED
card1.line.width = Pt(1.5)
tf1 = card1.text_frame
tf1.word_wrap = True
tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = Inches(0.22)
p = tf1.paragraphs[0]
p.text = "🚨 HYPERSCALER MONOPOLY"
p.font.bold = True
p.font.size = Pt(13.5)
p.font.color.rgb = ACCENT_RED

bullets1 = [
    ("80–90% Gross Margin Markups", "AWS Bedrock and OpenAI extract massive markups on commodity open-source models (DeepSeek, Qwen)."),
    ("Walled Gardens & Account Freezes", "Strict proprietary SDKs, arbitrary developer account freezes without appeal, and mandatory credit subscriptions."),
    ("Mandatory KYC & Surveillance", "Developers must submit passports, corporate documents, and phone numbers to run open weights.")
]
for title, desc in bullets1:
    p_t = tf1.add_paragraph()
    p_t.text = f"\n• {title}"
    p_t.font.bold = True
    p_t.font.size = Pt(10.5)
    p_t.font.color.rgb = TEXT_WHITE
    p_d = tf1.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9)
    p_d.font.color.rgb = TEXT_SLATE

# Card 2: Idle Compute Bottleneck
card2 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.6), top_pos, col_width, col_height)
card2.fill.solid()
card2.fill.fore_color.rgb = CARD_BG
card2.line.color.rgb = ACCENT_AMBER
card2.line.width = Pt(1.5)
tf2 = card2.text_frame
tf2.word_wrap = True
tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = Inches(0.22)
p = tf2.paragraphs[0]
p.text = "⚡ IDLE COMPUTE BOTTLENECK"
p.font.bold = True
p.font.size = Pt(13.5)
p.font.color.rgb = ACCENT_AMBER

bullets2 = [
    ("Thousands of Idle GPUs", "Regional European and Asian datacenters hold unmonetized H100 and A100 clusters with zero retail distribution."),
    ("Zero Liquidity Routing", "No unified, permissionless mechanism to aggregate distributed hardware into one high-availability endpoint."),
    ("30-Day Payment Friction", "Hardware operators wait 30–60 days for fiat invoice clearing and lose 3% to traditional banking rails.")
]
for title, desc in bullets2:
    p_t = tf2.add_paragraph()
    p_t.text = f"\n• {title}"
    p_t.font.bold = True
    p_t.font.size = Pt(10.5)
    p_t.font.color.rgb = TEXT_WHITE
    p_d = tf2.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9)
    p_d.font.color.rgb = TEXT_SLATE

# Card 3: The Verxl Switch
card3 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.6), top_pos, col_width, col_height)
card3.fill.solid()
card3.fill.fore_color.rgb = CARD_BG
card3.line.color.rgb = ACCENT_EMERALD
card3.line.width = Pt(1.5)
tf3 = card3.text_frame
tf3.word_wrap = True
tf3.margin_left = tf3.margin_top = tf3.margin_right = tf3.margin_bottom = Inches(0.22)
p = tf3.paragraphs[0]
p.text = "💎 THE VERXL SWITCH"
p.font.bold = True
p.font.size = Pt(13.5)
p.font.color.rgb = ACCENT_EMERALD

bullets3 = [
    ("50 bps Transparent Clearing", "Non-custodial edge router charges only 0.5% protocol spread — saving developers over 94% on fee markups."),
    ("OpenAI Drop-In Compatibility", "Standard endpoint (`api.verxl.com/v1`). Any existing AI codebase runs with zero code modifications."),
    ("Instant L2 Micro-Settlements", "Arbitrum L2 settlements (<$0.01 gas fee) allow compute nodes to withdraw earnings in seconds in USDC.")
]
for title, desc in bullets3:
    p_t = tf3.add_paragraph()
    p_t.text = f"\n• {title}"
    p_t.font.bold = True
    p_t.font.size = Pt(10.5)
    p_t.font.color.rgb = TEXT_WHITE
    p_d = tf3.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9)
    p_d.font.color.rgb = TEXT_SLATE

add_speaker_note(slide3,
    "SPEAKER SCRIPT (0:35 - 1:10 · 35s)\n"
    "On this slide, you see the market arbitrage. Hyperscalers charge 80 to 90% margins on open-weight models, "
    "while independent European datacenters sit with idle GPUs because they lack retail distribution. "
    "Verxl solves this with an edge switch: developers point their existing code to our OpenAI-compatible endpoint, "
    "requests route to the lowest-latency GPU in 4 milliseconds, and the protocol settles in USDC for just 50 basis points."
)

# ==============================================================================
# SLIDE 4: Section Divider 2 - Target Audience
# ==============================================================================
add_speaker_note(prs.slides[3],
    "SPEAKER SCRIPT (1:10 - 1:20 · 10s)\n"
    "Next, who is the customer, and why does this model achieve explosive product-market fit?"
)

# ==============================================================================
# SLIDE 5: Content - Target Audience & Crypto Persona
# ==============================================================================
slide5 = prs.slides[4]
clear_content_shapes(slide5, keep_indices=[0])
add_header(slide5, "Target Audience: The Crypto-Native Adoption Triad", "High-conviction, low-CAC customer acquisition engine leveraging on-chain incentives")

row_height = Inches(1.3)
card_y = Inches(1.5)

audience_data = [
    ("1. TECH-SAVVY & API-FIRST DEVELOPERS", ACCENT_BLUE,
     "Autonomous Agent Builders & Algorithmic Quants",
     "Developers building AI trading bots, autonomous agents (OMP, Hermes), and automated pipelines. They demand raw speed, curl/TypeScript compatibility, and zero UI bloat."),
    ("2. PRIVACY MAXIMALISTS & ENTERPRISE COMPLIANCE", ACCENT_EMERALD,
     "Confidential Compute & Freedom of Speech",
     "European fintech quants, researchers, and enterprises who cannot legally permit OpenAI or Microsoft to train on proprietary prompts. Verxl streams data through RAM with zero prompt retention."),
    ("3. ON-CHAIN IDENTIFIABLE COMMUNITY", ACCENT_PURPLE,
     "Low CAC Customer Engine & Token Alignment",
     "Crypto-native developers actively seeking decentralized alternatives. Transparent on-chain volume drives viral adoption and staking alignment with near-zero CAC.")
]

for idx, (title, color, sub, desc) in enumerate(audience_data):
    box = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), card_y + idx * Inches(1.42), Inches(11.8), row_height)
    box.fill.solid()
    box.fill.fore_color.rgb = CARD_BG
    box.line.color.rgb = color
    box.line.width = Pt(1.5)
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = Inches(0.16)
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.bold = True
    p.font.size = Pt(11.5)
    p.font.color.rgb = color
    
    p2 = tf.add_paragraph()
    p2.text = f"{sub} — {desc}"
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = TEXT_WHITE

fin_box = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(5.8), Inches(11.8), Inches(0.85))
fin_box.fill.solid()
fin_box.fill.fore_color.rgb = RGBColor(18, 30, 48)
fin_box.line.color.rgb = ACCENT_AMBER
fin_box.line.width = Pt(1)
tf_fin = fin_box.text_frame
tf_fin.word_wrap = True
tf_fin.margin_left = tf_fin.margin_top = tf_fin.margin_right = tf_fin.margin_bottom = Inches(0.12)
p_f = tf_fin.paragraphs[0]
p_f.text = "💰 FINANCIAL METRIC: CAPITAL-LIGHT GO-TO-MARKET FLYWHEEL"
p_f.font.bold = True
p_f.font.size = Pt(10.5)
p_f.font.color.rgb = ACCENT_AMBER

p_f2 = tf_fin.add_paragraph()
p_f2.text = "Traditional SaaS companies burn $150+ per customer on Google Ads. Verxl leverages on-chain incentive mechanics: direct 94% fee savings and transparent volume produce an effective CAC near $0 with a projected 25.9x LTV/CAC ratio."
p_f2.font.size = Pt(9)
p_f2.font.color.rgb = TEXT_SLATE

add_speaker_note(slide5,
    "SPEAKER SCRIPT (1:20 - 1:55 · 35s)\n"
    "As a finance student, customer acquisition cost is paramount. "
    "Our audience consists of three crypto-native personas: tech-savvy bot developers, privacy-conscious fintech quants, and on-chain communities. "
    "Traditional SaaS companies burn hundreds of dollars on ad spend. "
    "In Verxl, our CAC is virtually zero because developers instantly save 90% on inference and participate directly in on-chain network rewards."
)

# ==============================================================================
# SLIDE 6: Section Divider 3 - Role / Architecture
# ==============================================================================
add_speaker_note(prs.slides[5],
    "SPEAKER SCRIPT (1:55 - 2:05 · 10s)\n"
    "Let's examine the technical execution, proprietary architecture, and the team behind the protocol."
)

# ==============================================================================
# SLIDE 7: Content - Technical Architecture & Team Execution
# ==============================================================================
slide7 = prs.slides[6]
clear_content_shapes(slide7, keep_indices=[0])
add_header(slide7, "Technical Architecture & Core Protocol Engine", "Engineered by Šimon Havlík, Daniel Kolárovský & Miroslava Valová · Founding Assembly at VŠE Praha")

# Top Team Attribution Strip
team_banner = slide7.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(1.42), Inches(11.8), Inches(0.48))
team_banner.fill.solid()
team_banner.fill.fore_color.rgb = RGBColor(16, 26, 42)
team_banner.line.color.rgb = ACCENT_BLUE
team_banner.line.width = Pt(1)
tbtf = team_banner.text_frame
tbtf.word_wrap = True
tbtf.margin_left = tbtf.margin_top = tbtf.margin_right = tbtf.margin_bottom = Inches(0.08)
tbp = tbtf.paragraphs[0]
tbp.text = "👥 CORE TEAM: Šimon Havlík (Lead Architect & Dev)  |  Daniel Kolárovský (QA & Process Audit)  |  Miroslava Valová (Regulatory & Strategy)"
tbp.font.bold = True
tbp.font.size = Pt(10)
tbp.font.color.rgb = ACCENT_BLUE

# 4 Quadrants
w_quad = Inches(5.75)
h_quad = Inches(2.25)
x1 = Inches(0.6)
x2 = Inches(6.65)
y1 = Inches(2.05)
y2 = Inches(4.45)

quad_data = [
    (x1, y1, "1. SMART CONTRACT & DAO GOVERNANCE ARCHITECTURE", ACCENT_BLUE, [
        ("Aragon OSx On-Chain DAO", "Modular governance contracts deployed on Arbitrum One governing protocol parameters."),
        ("Tokenomics & Staking Vault", "1,000 $VRXL provider collateral requirement with automated 10% penalty slashes on SLA violations."),
        ("Non-Custodial Escrow", "Direct smart-contract deposits ensuring protocol operators never custody user funds.")
    ]),
    (x2, y1, "2. STATELESS EDGE CLEARING SWITCH & ROUTER", ACCENT_EMERALD, [
        ("Sub-4ms Edge Routing", "Cloudflare Pages Functions inspecting headers and dynamically dispatching to lowest-latency clusters."),
        ("Stateless RAM Streaming", "Prompts and completions stream in RAM with zero disk persistence, guaranteeing GDPR compliance."),
        ("Automated Multi-Node Failover", "Sub-second heartbeat health checks reroute inference queries instantly if a node drops offline.")
    ]),
    (x1, y2, "3. DETERMINISTIC CANARY QUALITY ORACLE", ACCENT_AMBER, [
        ("Seed=42 SLA Audits", "Autonomous background oracle sends deterministic canary prompts every 60s verifying output authenticity."),
        ("Sub-200ms Verification", "Instantly verifies whether host nodes are serving genuine unquantized model weights."),
        ("Cryptographic Slashing Proofs", "Automated on-chain slashing triggers when model output deviates from ground truth.")
    ]),
    (x2, y2, "4. FINANCIAL DATABASE & PRODUCTION CLUSTER", ACCENT_PURPLE, [
        ("Charizard PostgreSQL Ledger", "Strict schema-isolated ledger (`verxl.*`) recording micro-settlements and balances."),
        ("RFC 6238 TOTP 2FA Infrastructure", "PBKDF2 password hashing (100k rounds), pure WebCrypto TOTP validation, and 8 emergency codes."),
        ("Prague Bare-Metal GPU Host", "`bulbasaur-prague-01` running Vulkan-accelerated local Qwen models with zero-overhead tunnels.")
    ])
]

for qx, qy, qtitle, qcolor, qitems in quad_data:
    qbox = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, qx, qy, w_quad, h_quad)
    qbox.fill.solid()
    qbox.fill.fore_color.rgb = CARD_BG
    qbox.line.color.rgb = qcolor
    qbox.line.width = Pt(1.5)
    qtf = qbox.text_frame
    qtf.word_wrap = True
    qtf.margin_left = qtf.margin_top = qtf.margin_right = qtf.margin_bottom = Inches(0.16)
    
    qp = qtf.paragraphs[0]
    qp.text = qtitle
    qp.font.bold = True
    qp.font.size = Pt(10.5)
    qp.font.color.rgb = qcolor
    
    for ititle, idesc in qitems:
        p_t = qtf.add_paragraph()
        p_t.text = f"• {ititle}: {idesc}"
        p_t.font.size = Pt(8.5)
        p_t.font.color.rgb = TEXT_WHITE

add_speaker_note(slide7,
    "SPEAKER SCRIPT (2:05 - 2:40 · 35s)\n"
    "Verxl is built on four proprietary pillars: "
    "First, on-chain Aragon OSx contracts manage non-custodial escrows and collateral. "
    "Second, our stateless edge router dispatches requests in 3.8 milliseconds with zero proxy latency. "
    "Third, our seed=42 canary oracle continuously audits provider output, slashing degraded nodes by 10%. "
    "And fourth, our Charizard PostgreSQL ledger manages real-time balance clearing with 2FA security. "
    "Our core team comprises Šimon Havlík leading architecture and full-stack engineering, Daniel Kolárovský directing empirical SLA testing and process verification, and Miroslava Valová leading regulatory compliance, market research, and institutional governance."
)

# ==============================================================================
# SLIDE 8: Section Divider 4 - Goal
# ==============================================================================
add_speaker_note(prs.slides[7],
    "SPEAKER SCRIPT (2:40 - 2:50 · 10s)\n"
    "Now, let's explore our ultimate financial goal: building the decentralized clearinghouse for global AI."
)

# ==============================================================================
# SLIDE 9: Content - Financial Goal & Unit Economics
# ==============================================================================
slide9 = prs.slides[8]
clear_content_shapes(slide9, keep_indices=[0])
add_header(slide9, "Protocol Goal: Capital-Light Marketplace Economics", "Zero hardware CapEx, 50 bps clearing take rate, and compounding financial velocity")

ban = slide9.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(1.5), Inches(11.8), Inches(0.95))
ban.fill.solid()
ban.fill.fore_color.rgb = RGBColor(15, 23, 42)
ban.line.color.rgb = ACCENT_BLUE
ban.line.width = Pt(1)
btf = ban.text_frame
btf.word_wrap = True
btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = Inches(0.12)
bp1 = btf.paragraphs[0]
bp1.text = "CORE OBJECTIVE: THE NASDAQ / VISA OF ARTIFICIAL INTELLIGENCE COMPUTE"
bp1.font.bold = True
bp1.font.size = Pt(11.5)
bp1.font.color.rgb = ACCENT_BLUE
bp2 = btf.add_paragraph()
bp2.text = "Visa does not own retail stores; NASDAQ does not own stocks; Airbnb does not build hotels. Verxl never buys GPUs, leases server rooms, or pays power bills. We are a pure financial clearing layer taking 50 basis points on every inference dollar."
bp2.font.size = Pt(9)
bp2.font.color.rgb = TEXT_WHITE

y_sim = Inches(2.65)
w_sim = Inches(3.8)
h_sim = Inches(3.65)

sim_data = [
    (Inches(0.6), "1. SEED PHASE (Q4 2026)", TEXT_SLATE, "500M Tokens / Month",
     "$30,000 / month", "$150 / month", "10–25 Clusters",
     "Initial bootstrap across European crypto developers and regional research labs."),
    (Inches(4.6), "2. SCALE PHASE (2027)", ACCENT_BLUE, "50 Billion Tokens / Month",
     "$3,000,000 / month", "$15,000 / mo ($180k/yr)", "100–250 Clusters",
     "Expansion into quant funds, autonomous agents, and commercial DeFi pipelines."),
    (Inches(8.6), "3. VELOCITY PHASE (2028+)", ACCENT_EMERALD, "1 Trillion Tokens / Month",
     "$60,000,000 / month", "$300,000 / mo ($3.6M/yr)", "1,000+ Distributed Fleets",
     "Machine-to-machine economy: autonomous AI agents clearing micro-inferences directly via HTTP 402.")
]

for sx, stitle, scolor, stoks, sgmv, stake, sclusters, sdesc in sim_data:
    sbox = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, y_sim, w_sim, h_sim)
    sbox.fill.solid()
    sbox.fill.fore_color.rgb = CARD_BG
    sbox.line.color.rgb = scolor
    sbox.line.width = Pt(1.5)
    stf = sbox.text_frame
    stf.word_wrap = True
    stf.margin_left = stf.margin_top = stf.margin_right = stf.margin_bottom = Inches(0.18)
    
    p = stf.paragraphs[0]
    p.text = stitle
    p.font.bold = True
    p.font.size = Pt(11.5)
    p.font.color.rgb = scolor
    
    rows = [
        ("Monthly Inference Tokens:", stoks),
        ("Gross Volume (GMV):", sgmv),
        ("50 bps Protocol Take:", stake),
        ("Connected Clusters:", sclusters),
    ]
    for rlabel, rval in rows:
        p_l = stf.add_paragraph()
        p_l.text = f"{rlabel} {rval}"
        p_l.font.size = Pt(9.5)
        p_l.font.color.rgb = TEXT_WHITE
    
    p_d = stf.add_paragraph()
    p_d.text = f"\nFocus: {sdesc}"
    p_d.font.size = Pt(8.5)
    p_d.font.color.rgb = TEXT_SLATE

add_speaker_note(slide9,
    "SPEAKER SCRIPT (2:50 - 3:30 · 40s)\n"
    "From a finance perspective, our economics are extraordinarily compelling. "
    "We take zero hardware CapEx and zero depreciation risk. "
    "Just like Visa collects a toll on payments, Verxl collects 50 basis points on compute. "
    "At 50 billion tokens a month, that is $3 million in monthly gross volume and $180,000 in annualized protocol cash flow. "
    "At 1 trillion tokens, the 50 bps switch yields $3.6 million in annual net cash flow, distributed directly to DAO stakers."
)

# ==============================================================================
# SLIDE 10: Section Divider 5 - Success Evaluation
# ==============================================================================
add_speaker_note(prs.slides[9],
    "SPEAKER SCRIPT (3:30 - 3:40 · 10s)\n"
    "How do we measure success, and how is the protocol protected from regulatory and financial risks?"
)

# ==============================================================================
# SLIDE 11: Content - KPIs & Legal Defensibility
# ==============================================================================
slide11 = prs.slides[10]
clear_content_shapes(slide11, keep_indices=[0])
add_header(slide11, "Evaluation Metrics & EU Legal Defensibility", "Rigorous quantitative benchmarks coupled with MiCA regulatory compliance")

kpi_width = Inches(5.75)
kpi_card = slide11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.5), kpi_width, Inches(4.8))
kpi_card.fill.solid()
kpi_card.fill.fore_color.rgb = CARD_BG
kpi_card.line.color.rgb = ACCENT_EMERALD
kpi_card.line.width = Pt(1.5)
ktf = kpi_card.text_frame
ktf.word_wrap = True
ktf.margin_left = ktf.margin_top = ktf.margin_right = ktf.margin_bottom = Inches(0.22)
kp = ktf.paragraphs[0]
kp.text = "📊 QUANTITATIVE SUCCESS BENCHMARKS (KPIs)"
kp.font.bold = True
kp.font.size = Pt(12.5)
kp.font.color.rgb = ACCENT_EMERALD

kpis = [
    ("Gross Inference Volume (GMV)", "Target: Exceed $5M monthly GMV within 12 months of mainnet launch."),
    ("Sub-5ms Router Latency Overhead", "Edge proxy overhead strictly capped below 5ms (measured 3.8ms in production)."),
    ("Autonomous Canary SLA Uptime (99.99%)", "Zero tolerance for degraded nodes: automated seed=42 slashing enforces 99.99% model accuracy."),
    ("DAO Treasury Growth & Reserves", "Positive cash flow: 80% protocol take retained in DAO reserve, 20% allocated to insurance.")
]
for title, desc in kpis:
    p_t = ktf.add_paragraph()
    p_t.text = f"\n• {title}"
    p_t.font.bold = True
    p_t.font.size = Pt(10)
    p_t.font.color.rgb = TEXT_WHITE
    p_d = ktf.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(8.5)
    p_d.font.color.rgb = TEXT_SLATE

legal_card = slide11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.65), Inches(1.5), kpi_width, Inches(4.8))
legal_card.fill.solid()
legal_card.fill.fore_color.rgb = CARD_BG
legal_card.line.color.rgb = ACCENT_BLUE
legal_card.line.width = Pt(1.5)
ltf = legal_card.text_frame
ltf.word_wrap = True
ltf.margin_left = ltf.margin_top = ltf.margin_right = ltf.margin_bottom = Inches(0.22)
lp = ltf.paragraphs[0]
lp.text = "⚖️ LEGAL STRUCTURE & EU REGULATORY IMMUNITY"
lp.font.bold = True
lp.font.size = Pt(12.5)
lp.font.color.rgb = ACCENT_BLUE

legals = [
    ("MiCA Non-Custodial Exemption", "Under EU MiCA, purely technical non-custodial routers do not hold customer funds and are exempt from CASP licensing."),
    ("Stateless Edge Payload Routing", "Prompts and completions stream in RAM and are never persisted to disk, fully complying with GDPR and EU AI Act Article 50."),
    ("Aragon OSx Decentralized Governance", "Protocol parameter updates and fee changes are governed on-chain by the DAO, eliminating centralized promoter liabilities."),
    ("Arbitrum L2 Native USDC Settlement", "Micro-settlements utilize regulated Circle USDC on Arbitrum with verified on-chain proofs and deterministic smart contracts.")
]
for title, desc in legals:
    p_t = ltf.add_paragraph()
    p_t.text = f"\n• {title}"
    p_t.font.bold = True
    p_t.font.size = Pt(10)
    p_t.font.color.rgb = TEXT_WHITE
    p_d = ltf.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(8.5)
    p_d.font.color.rgb = TEXT_SLATE

add_speaker_note(slide11,
    "SPEAKER SCRIPT (3:40 - 4:15 · 35s)\n"
    "We evaluate success through four quantitative metrics: "
    "gross volume, sub-5 millisecond routing latency, 99.99% canary uptime, and treasury reserves. "
    "Equally vital is our institutional legal moat: under EU MiCA, Verxl is strictly non-custodial and exempt from CASP licensing. "
    "Furthermore, because our edge router streams data through RAM without storing prompts on disk, we have total GDPR and EU AI Act compliance."
)

# ==============================================================================
# SLIDE 12: Section Divider 6 - Roadmap
# ==============================================================================
add_speaker_note(prs.slides[11],
    "SPEAKER SCRIPT (4:15 - 4:25 · 10s)\n"
    "Finally, let's review our strategic roadmap spanning 2026 through 2028."
)

# ==============================================================================
# SLIDE 13: Content - Expected Timeframe & 4 Horizons
# ==============================================================================
slide13 = prs.slides[12]
clear_content_shapes(slide13, keep_indices=[0])
add_header(slide13, "Project Roadmap: 4 Strategic Horizons (2026–2028)", "From live non-custodial clearing to autonomous machine-to-machine micro-clearing")

h_width = Inches(2.8)
h_height = Inches(4.7)
top_h = Inches(1.5)

roadmap_items = [
    (Inches(0.6), "HORIZON 1 (Q4 2026)", "LIVE ON MAINNET", ACCENT_EMERALD, [
        ("Status: OPERATIONAL", "100% Complete"),
        ("Live 50 bps Switch", "Stateless Cloudflare edge router deployed."),
        ("PostgreSQL Ledger", "Isolated `verxl.*` schema on Charizard."),
        ("2FA & PBKDF2 Auth", "WebCrypto TOTP + emergency codes."),
        ("DAO Contracts", "Aragon OSx governance live on Sepolia/Arbitrum.")
    ]),
    (Inches(3.6), "HORIZON 2 (Q1–Q2 2027)", "CANARY SLASHING FLEET", ACCENT_BLUE, [
        ("Status: IN DEVELOPMENT", "45% Complete"),
        ("Provider Registry", "Staking 1,000 $VRXL minimum collateral."),
        ("Seed=42 Slashing", "Automated 10% collateral slash on SLA fail."),
        ("Hardware Clusters", "Integration of 50+ independent GPU clusters."),
        ("Public Console 2.0", "One-click provider deployment CLI.")
    ]),
    (Inches(6.6), "HORIZON 3 (Q3–Q4 2027)", "ZK-PROOFS OF INFERENCE", ACCENT_PURPLE, [
        ("Status: PLANNED", "Research Phase"),
        ("Zero-Knowledge Proofs", "Succinct ZK-SNARK output verification."),
        ("Non-Repudiation", "Cryptographic proof of model execution."),
        ("Enterprise SLA Vaults", "DeFi insurance pools backing uptime."),
        ("Institutional Gateway", "Direct sub-millisecond dark-pool routing.")
    ]),
    (Inches(9.6), "HORIZON 4 (2028+)", "M2M AGENT ECONOMY", ACCENT_AMBER, [
        ("Status: PLANNED", "Future Horizon"),
        ("HTTP 402 Micropayments", "Direct agent-to-agent inference payment."),
        ("Autonomous AI Nodes", "Agents hire compute without human intervention."),
        ("Decentralized Weights", "P2P sharded model weights over IPFS/libp2p."),
        ("Global Compute Mesh", "Ubiquitous multi-cloud decentralized clearing.")
    ])
]

for hx, htitle, hsub, hcolor, hbullets in roadmap_items:
    hbox = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, hx, top_h, h_width, h_height)
    hbox.fill.solid()
    hbox.fill.fore_color.rgb = CARD_BG
    hbox.line.color.rgb = hcolor
    hbox.line.width = Pt(1.5)
    htf = hbox.text_frame
    htf.word_wrap = True
    htf.margin_left = htf.margin_top = htf.margin_right = htf.margin_bottom = Inches(0.16)
    
    p = htf.paragraphs[0]
    p.text = htitle
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = hcolor
    
    p_s = htf.add_paragraph()
    p_s.text = hsub
    p_s.font.bold = True
    p_s.font.size = Pt(9)
    p_s.font.color.rgb = TEXT_WHITE
    
    for btitle, bdesc in hbullets:
        p_b = htf.add_paragraph()
        p_b.text = f"\n• {btitle}:"
        p_b.font.bold = True
        p_b.font.size = Pt(8.5)
        p_b.font.color.rgb = hcolor
        p_bd = htf.add_paragraph()
        p_bd.text = bdesc
        p_bd.font.size = Pt(8)
        p_bd.font.color.rgb = TEXT_SLATE

add_speaker_note(slide13,
    "SPEAKER SCRIPT (4:25 - 4:55 · 30s)\n"
    "Our roadmap spans four clear horizons. "
    "Horizon 1 is not a future promise — it is operational right now on mainnet at verxl.com. "
    "Horizon 2 brings decentralized provider staking and automated canary slashing. "
    "Horizon 3 introduces zero-knowledge cryptographic proofs of inference. "
    "And Horizon 4 unlocks the true machine-to-machine economy where autonomous AI agents pay each other directly via HTTP 402."
)

# ==============================================================================
# SLIDE 14: Closing
# ==============================================================================
slide14 = prs.slides[13]
for shape in slide14.shapes:
    if shape.has_text_frame:
        shape.text_frame.clear()
        p = shape.text_frame.paragraphs[0]
        p.text = "Thank you for your attention!"
        p.font.name = "Arial Black"
        p.font.size = Pt(32)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        
        p2 = shape.text_frame.add_paragraph()
        p2.text = "Verxl Protocol · The Capital-Light Clearing Switch for Global AI Compute\n"
        p2.font.size = Pt(16)
        p2.font.color.rgb = ACCENT_BLUE
        
        p3 = shape.text_frame.add_paragraph()
        p3.text = "Presenter: Šimon Havlík (me@simonhavlik.com)\nLive Platform: https://verxl.com  ·  Documentation: https://verxl.com/whitepaper\nPrague University of Economics and Business (VŠE Praha)"
        p3.font.size = Pt(12)
        p3.font.color.rgb = TEXT_SLATE

add_speaker_note(slide14,
    "SPEAKER SCRIPT (4:55 - 5:00 · 5s)\n"
    "Thank you for your time. Verxl is live today at verxl.com, and I look forward to your questions."
)

prs.save(OUT_PPTX_REPO)
prs.save(OUT_PPTX_PUBLIC)
prs.save(OUT_PPTX_BRAIN)
print(f"Successfully saved pitch deck to:")
print(f"1. {OUT_PPTX_REPO}")
print(f"2. {OUT_PPTX_PUBLIC}")
print(f"3. {OUT_PPTX_BRAIN}")
