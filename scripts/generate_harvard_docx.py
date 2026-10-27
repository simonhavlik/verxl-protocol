import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.opc.constants import RELATIONSHIP_TYPE
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

doc = docx.Document()

# Standard 1.0 inch Harvard margins
for section in doc.sections:
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

# Base Style: Times New Roman, 11pt, Pure Black
normal_style = doc.styles['Normal']
normal_style.font.name = 'Times New Roman'
normal_style.font.size = Pt(11)
normal_style.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

# Register official Hyperlink character style so Word styles all links uniformly
styles = doc.styles
hyperlink_style_xml = parse_xml(r'''
    <w:style xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:type="character" w:styleId="Hyperlink">
        <w:name w:val="Hyperlink"/>
        <w:basedOn w:val="DefaultParagraphFont"/>
        <w:uiPriority w:val="99"/>
        <w:unhideWhenUsed/>
        <w:rPr>
            <w:color w:val="0000FF"/>
            <w:u w:val="single"/>
        </w:rPr>
    </w:style>
''')
styles.element.append(hyperlink_style_xml)

def add_hyperlink(paragraph, url, text, font_size_pt=11, color="0000FF", underline=True):
    part = paragraph.part
    r_id = part.relate_to(url, RELATIONSHIP_TYPE.HYPERLINK, is_external=True)

    hyperlink = parse_xml(f'<w:hyperlink xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" r:id="{r_id}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>')
    new_run = parse_xml(f'<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
    rPr = parse_xml(f'<w:rPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')

    rStyle = parse_xml(f'<w:rStyle xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="Hyperlink"/>')
    rPr.append(rStyle)

    rFont = parse_xml(f'<w:rFonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>')
    rPr.append(rFont)

    val_sz = int(font_size_pt * 2)
    sz = parse_xml(f'<w:sz xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="{val_sz}"/>')
    rPr.append(sz)

    if color:
        c = parse_xml(f'<w:color xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="{color}"/>')
        rPr.append(c)

    if underline:
        u = parse_xml(f'<w:u xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="single"/>')
        rPr.append(u)

    new_run.append(rPr)
    new_run_text = parse_xml(f'<w:t xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xml:space="preserve">{text}</w:t>')
    new_run.append(new_run_text)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)

def add_p(text, before=0, after=6, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.15
    p.alignment = align
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.bold = bold
    r.font.italic = italic
    r.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    return p

def add_code_box(code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)

    shd = parse_xml(r'<w:shd {} w:fill="F6F8FA"/>'.format(nsdecls('w')))
    cell._tc.get_or_add_tcPr().append(shd)

    borders = parse_xml(r'''
        <w:tcBorders {} >
            <w:top w:val="single" w:sz="4" w:space="0" w:color="D0D7DE"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="D0D7DE"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D0D7DE"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="D0D7DE"/>
        </w:tcBorders>
    '''.format(nsdecls('w')))
    cell._tc.get_or_add_tcPr().append(borders)

    tcMar = parse_xml(r'''
        <w:tcMar {} >
            <w:top w:w="120" w:type="dxa"/>
            <w:bottom w:w="120" w:type="dxa"/>
            <w:left w:w="160" w:type="dxa"/>
            <w:right w:w="160" w:type="dxa"/>
        </w:tcMar>
    '''.format(nsdecls('w')))
    cell._tc.get_or_add_tcPr().append(tcMar)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.0
    r = p.add_run(code_text)
    r.font.name = 'Consolas'
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(0x1F, 0x23, 0x28)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)

# Header
p_top = doc.add_paragraph()
p_top.paragraph_format.space_before = Pt(0)
p_top.paragraph_format.space_after = Pt(4)
r_top1 = p_top.add_run('HW5: Create and Use Your Own DAO – Verxl DAO\n')
r_top1.font.name = 'Times New Roman'
r_top1.font.size = Pt(13)
r_top1.font.bold = True

r_top2 = p_top.add_run('Team Members: Šimon Havlík, Daniel Kolárovský, Miroslava Valová\nDate: October 27, 2026')
r_top2.font.name = 'Times New Roman'
r_top2.font.size = Pt(11)
r_top2.font.italic = True

# 1. Overview
add_p('1. DAO Overview, Purpose and Links', before=8, after=4, bold=True)
p_ov = doc.add_paragraph()
p_ov.paragraph_format.space_before = Pt(0)
p_ov.paragraph_format.space_after = Pt(6)
p_ov.paragraph_format.line_spacing = 1.15
p_ov.add_run('For this assignment, our team established the Verxl DAO on the Ethereum Sepolia testnet using the Aragon OSx platform. The organization is created to serve as the decentralized governance and non-custodial treasury management body for our startup project, the Verxl Protocol. Verxl Protocol is an open compute routing protocol that routes tokenized artificial intelligence inference requests across independent GPU clusters with automated, non-custodial clearing. Our live platform is located at ')
add_hyperlink(p_ov, 'https://verxl.com', 'https://verxl.com')
p_ov.add_run(', and our comprehensive technical specifications and economic design are detailed in our whitepaper at ')
add_hyperlink(p_ov, 'https://verxl.com/whitepaper', 'https://verxl.com/whitepaper')
p_ov.add_run('. Furthermore, we integrated a dedicated governance interface directly into our production website at ')
add_hyperlink(p_ov, 'https://verxl.com/governance', 'https://verxl.com/governance')
p_ov.add_run(', providing real-time streaming of on-chain DAO telemetry, active proposal statuses, and live contract events synchronized from Ethereum Sepolia. Links to our live platform, whitepaper, and governance dashboard were embedded directly into the organization metadata during the creation process on Aragon.')

# 2. Properties & Etherscan Links
add_p('2. Core DAO Properties, Contract Registry and Sepolia Etherscan Verification', before=8, after=4, bold=True)
add_p('The DAO was deployed and configured collaboratively on Ethereum Sepolia. Below are the verified parameters, contract registry, and direct Sepolia Etherscan links:')

# Bullet: Name
add_p('• Organization Name: Verxl DAO (ENS Subdomain: verxl-dao.dao.eth)', after=3)

# Bullet: Aragon URL
p_ar = doc.add_paragraph()
p_ar.paragraph_format.space_before = Pt(0)
p_ar.paragraph_format.space_after = Pt(3)
p_ar.paragraph_format.line_spacing = 1.15
p_ar.add_run('• Aragon App Organization URL: ')
add_hyperlink(p_ar, 'https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/', 'https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/')

# Bullet: DAO Contract & Creation Tx
p_dc = doc.add_paragraph()
p_dc.paragraph_format.space_before = Pt(0)
p_dc.paragraph_format.space_after = Pt(3)
p_dc.paragraph_format.line_spacing = 1.15
p_dc.add_run('• DAO Contract & Vault Address: ')
add_hyperlink(p_dc, 'https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a', '0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a')
p_dc.add_run(' (')
add_hyperlink(p_dc, 'https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a', 'View on Sepolia Etherscan')
p_dc.add_run(')')

p_ctx = doc.add_paragraph()
p_ctx.paragraph_format.space_before = Pt(0)
p_ctx.paragraph_format.space_after = Pt(3)
p_ctx.paragraph_format.line_spacing = 1.15
p_ctx.add_run('  Contract Creation Transaction: ')
add_hyperlink(p_ctx, 'https://sepolia.etherscan.io/tx/0x031bd2c85b97fa4229f98017f7968dd6f5444d75a182c5bdfcc1859a7963a7ef', '0x031bd2c85b97fa4229f98017f7968dd6f5444d75a182c5bdfcc1859a7963a7ef')
p_ctx.add_run(' (Confirmed at Block 12000801 by Creator ')
add_hyperlink(p_ctx, 'https://sepolia.etherscan.io/address/0x14f10A865e277C0B1949e18Dd9856602DB11742b', '0x14f10A865e277C0B1949e18Dd9856602DB11742b')
p_ctx.add_run(')')

# Bullet: Web Governance
p_wg = doc.add_paragraph()
p_wg.paragraph_format.space_before = Pt(0)
p_wg.paragraph_format.space_after = Pt(3)
p_wg.paragraph_format.line_spacing = 1.15
p_wg.add_run('• Dedicated Web Governance Dashboard: ')
add_hyperlink(p_wg, 'https://verxl.com/governance', 'https://verxl.com/governance')
p_wg.add_run(' (live synchronized on-chain telemetry, active votes, and event feed)')

# Bullet: Simon Wallet
p_sw = doc.add_paragraph()
p_sw.paragraph_format.space_before = Pt(0)
p_sw.paragraph_format.space_after = Pt(3)
p_sw.paragraph_format.line_spacing = 1.15
p_sw.add_run('• Founding Wallet (Creator & Submitter): ')
add_hyperlink(p_sw, 'https://sepolia.etherscan.io/address/0x14f10A865e277C0B1949e18Dd9856602DB11742b', '0x14f10A865e277C0B1949e18Dd9856602DB11742b')
p_sw.add_run(' (Šimon Havlík – 33.34% genesis voting quota · ')
add_hyperlink(p_sw, 'https://sepolia.etherscan.io/address/0x14f10A865e277C0B1949e18Dd9856602DB11742b', 'Etherscan Wallet Link')
p_sw.add_run(')')

# Bullet: Daniel Wallet
p_dw = doc.add_paragraph()
p_dw.paragraph_format.space_before = Pt(0)
p_dw.paragraph_format.space_after = Pt(3)
p_dw.paragraph_format.line_spacing = 1.15
p_dw.add_run('• Founding Wallet (Voting Member): ')
add_hyperlink(p_dw, 'https://sepolia.etherscan.io/address/0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab', '0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab')
p_dw.add_run(' (Daniel Kolárovský – 33.33% genesis voting quota · ')
add_hyperlink(p_dw, 'https://sepolia.etherscan.io/address/0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab', 'Etherscan Wallet Link')
p_dw.add_run(')')

# Bullet: Miroslava Wallet
p_mw = doc.add_paragraph()
p_mw.paragraph_format.space_before = Pt(0)
p_mw.paragraph_format.space_after = Pt(3)
p_mw.paragraph_format.line_spacing = 1.15
p_mw.add_run('• Founding Wallet (Co-Administrator): ')
add_hyperlink(p_mw, 'https://sepolia.etherscan.io/address/0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F', '0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F')
p_mw.add_run(' (Miroslava Valová – 33.33% genesis voting quota · ')
add_hyperlink(p_mw, 'https://sepolia.etherscan.io/address/0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F', 'Etherscan Wallet Link')
p_mw.add_run(')')

# Bullet: Governance Design
add_p('• Governance Design on Sepolia: Aragon OSx Multi-Member Consensus Plugin with 3 equal founder member wallets, requiring a 2-of-3 threshold (>50% simple majority) to approve proposals, coupled with automated early execution upon mathematical majority.', after=3)
add_p('• Protocol Governance Allocation: Denominated in native $VRXL tokens with a 1,000,000 VRXL genesis allocation specified in the protocol whitepaper, distributed equally across the three founders.', after=3)

p_pw = doc.add_paragraph()
p_pw.paragraph_format.space_before = Pt(0)
p_pw.paragraph_format.space_after = Pt(6)
p_pw.paragraph_format.line_spacing = 1.15
p_pw.add_run('• Project Website & Whitepaper: ')
add_hyperlink(p_pw, 'https://verxl.com', 'https://verxl.com')
p_pw.add_run(' and ')
add_hyperlink(p_pw, 'https://verxl.com/whitepaper', 'https://verxl.com/whitepaper')

# 3. Verified Activities
add_p('3. Verified On-Chain Activities: Treasury Capitalization and Governance Voting', before=8, after=4, bold=True)
add_p('To fulfill the practical operations required by the assignment, our team executed two on-chain activities on the Sepolia network:')

p_act1 = doc.add_paragraph()
p_act1.paragraph_format.space_before = Pt(0)
p_act1.paragraph_format.space_after = Pt(3)
p_act1.paragraph_format.line_spacing = 1.15
p_act1.add_run('First, we executed an on-chain transaction with the DAO Vault (')
add_hyperlink(p_act1, 'https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a', '0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a')
p_act1.add_run(') to verify treasury execution. The transaction was initiated from the founding creator wallet (')
add_hyperlink(p_act1, 'https://sepolia.etherscan.io/address/0x14f10A865e277C0B1949e18Dd9856602DB11742b', '0x14f10A865e277C0B1949e18Dd9856602DB11742b')
p_act1.add_run(') and confirmed on Ethereum Sepolia under transaction hash: ')
add_hyperlink(p_act1, 'https://sepolia.etherscan.io/tx/0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6', '0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6')
p_act1.add_run(' (')
add_hyperlink(p_act1, 'https://sepolia.etherscan.io/tx/0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6', 'View on Sepolia Etherscan')
p_act1.add_run(').')

p_act2 = doc.add_paragraph()
p_act2.paragraph_format.space_before = Pt(0)
p_act2.paragraph_format.space_after = Pt(6)
p_act2.paragraph_format.line_spacing = 1.15
p_act2.add_run('Second, we initiated and ratified an on-chain governance vote for proposal VIP-1, titled "Authorize Verxl Gateway V1 Routing Invariants, Seed Liquidity, and Collateral Slashing Registry". Founding partner Daniel Kolárovský (')
add_hyperlink(p_act2, 'https://sepolia.etherscan.io/address/0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab', '0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab')
p_act2.add_run(') cast the affirmative vote from his registered wallet, completing the required 2-of-3 quorum threshold and securing unanimous approval. Because the majority was mathematically secured, the proposal triggered early automated execution on-chain. Both the proposal execution and real-time voting history can be audited directly on the Aragon portal at ')
add_hyperlink(p_act2, 'https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1', 'Aragon Proposal VIP-1')
p_act2.add_run(' as well as on our live platform governance dashboard at ')
add_hyperlink(p_act2, 'https://verxl.com/governance', 'https://verxl.com/governance')
p_act2.add_run('.' )

# 4. DAO Agreement
add_p('4. Extra Work Extension A: Written DAO Agreement (Memorandum of Association)', before=8, after=4, bold=True)

p_agree_intro = doc.add_paragraph()
p_agree_intro.paragraph_format.space_before = Pt(0)
p_agree_intro.paragraph_format.space_after = Pt(6)
p_agree_intro.paragraph_format.line_spacing = 1.15
p_agree_intro.add_run('To expand on the DAO purpose and claim extra credit, our team drafted this written DAO Agreement (Memorandum of Association) setting forth the rules, shares, goals, and vision of the organization, however we primarily focused on our project\'s whitepaper ')
add_hyperlink(p_agree_intro, 'https://verxl.com/whitepaper', 'https://verxl.com/whitepaper')
p_agree_intro.add_run(':')

p_memo = doc.add_paragraph()
p_memo.paragraph_format.space_before = Pt(4)
p_memo.paragraph_format.space_after = Pt(10)
p_memo.paragraph_format.left_indent = Inches(0.2)
p_memo.paragraph_format.right_indent = Inches(0.2)
p_memo.paragraph_format.line_spacing = 1.15

r_m1_1 = p_memo.add_run(
    'DAO FOUNDERS AGREEMENT & MEMORANDUM OF ASSOCIATION\n'
    'Entered into on October 27, 2026, by and between Šimon Havlík, Daniel Kolárovský, and Miroslava Valová.\n\n'
    'Article I (Name, Purpose and Vision): Verxl DAO is established as a decentralized autonomous organization on Ethereum Sepolia using Aragon OSx. '
    'The DAO governs the Verxl Protocol ('
)
r_m1_1.font.name = 'Times New Roman'
r_m1_1.font.size = Pt(9.5)

add_hyperlink(p_memo, 'https://verxl.com', 'https://verxl.com', font_size_pt=9.5)

r_m1_2 = p_memo.add_run(
    '), an open compute clearing network designed to route tokenized artificial intelligence '
    'inference requests to independent GPU data centers. The complete architectural blueprint and economic model are set forth in the protocol '
    'whitepaper at '
)
r_m1_2.font.name = 'Times New Roman'
r_m1_2.font.size = Pt(9.5)

add_hyperlink(p_memo, 'https://verxl.com/whitepaper', 'https://verxl.com/whitepaper', font_size_pt=9.5)

r_m1_3 = p_memo.add_run(', and real-time DAO telemetry is mirrored at ')
r_m1_3.font.name = 'Times New Roman'
r_m1_3.font.size = Pt(9.5)

add_hyperlink(p_memo, 'https://verxl.com/governance', 'https://verxl.com/governance', font_size_pt=9.5)

r_m1_4 = p_memo.add_run(
    '. The DAO holds no client principal balances and operates as a non-custodial clearing registry.\n\n'
    'Article II (Founder Shares and Voting Rights): Governance rights are shared equally among founding members: Šimon Havlík holds 33.34%, '
    'Daniel Kolárovský holds 33.33%, and Miroslava Valová holds 33.33%. No single founder possesses administrative backdoor keys or unilateral authority over the DAO Vault.\n\n'
    'Article III (Quorum, Voting and Ratification): Any formal modification to protocol routing rates, smart contracts, or treasury disbursements '
    'requires an on-chain Verxl Improvement Proposal (VIP). Proposals require a simple majority (>50% support) and a minimum participation quorum '
    'of 20% of outstanding supply over a 24-hour voting window, with early execution authorized upon mathematical finality.\n\n'
    'Article IV (Treasury Inflows and Slashing Invariants): The DAO Vault receives a 50 basis point protocol clearing fee from settled inference requests. '
    'Compute clusters register staking collateral in VerxlStakingRegistry.sol. If a compute cluster fails deterministic seed=42 canary verification probes, '
    'the smart contract executes an automated 10% collateral slash to compensate affected clients.\n\n'
    'Article V (Dissolution and Liquidation): Formal dissolution of the DAO requires an affirmative supermajority of 75% of issued voting tokens. '
    'Upon formal dissolution, remaining treasury assets shall be disbursed pro-rata to token holders.\n\n'
    'Article VI (On-Chain Cryptographic Ratification & Etherscan Verification):\n'
    'This Memorandum of Association is executed and cryptographically ratified on the Ethereum Sepolia network by the three founding partner wallets:\n'
    '1. Šimon Havlík (Founding Creator & Submitter): 0x14f10A865e277C0B1949e18Dd9856602DB11742b\n'
    '   Etherscan: '
)
r_m1_4.font.name = 'Times New Roman'
r_m1_4.font.size = Pt(9.5)

add_hyperlink(p_memo, 'https://sepolia.etherscan.io/address/0x14f10A865e277C0B1949e18Dd9856602DB11742b', 'https://sepolia.etherscan.io/address/0x14f10A865e277C0B1949e18Dd9856602DB11742b', font_size_pt=9.5)

r_m2 = p_memo.add_run(
    '\n2. Daniel Kolárovský (Founding Voting Partner): 0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab\n'
    '   Etherscan: '
)
r_m2.font.name = 'Times New Roman'
r_m2.font.size = Pt(9.5)

add_hyperlink(p_memo, 'https://sepolia.etherscan.io/address/0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab', 'https://sepolia.etherscan.io/address/0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab', font_size_pt=9.5)

r_m3 = p_memo.add_run(
    '\n3. Miroslava Valová (Founding Co-Administrator): 0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F\n'
    '   Etherscan: '
)
r_m3.font.name = 'Times New Roman'
r_m3.font.size = Pt(9.5)

add_hyperlink(p_memo, 'https://sepolia.etherscan.io/address/0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F', 'https://sepolia.etherscan.io/address/0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F', font_size_pt=9.5)

r_m4 = p_memo.add_run(
    '\nAll covenants, equity tranches, and governance parameters herein are immutably bound on-chain to the Aragon OSx contract 0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a ('
)
r_m4.font.name = 'Times New Roman'
r_m4.font.size = Pt(9.5)

add_hyperlink(p_memo, 'https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a', 'View Contract on Sepolia Etherscan', font_size_pt=9.5)

r_m5 = p_memo.add_run(') and formally confirmed via executed governance proposal VIP-1.')
r_m5.font.name = 'Times New Roman'
r_m5.font.size = Pt(9.5)

# 5. Programmatic Deployment Verification & SDK
add_p('5. Extra Work Extension B: Programmatic DAO Deployment on Ethereum Sepolia', before=8, after=4, bold=True)
add_p(
    'While our primary organization was established via the Aragon UI workflow, to definitively demonstrate that our organization can be '
    'instantiated and configured purely through code, we executed a second, programmatic deployment directly on the Ethereum Sepolia testnet '
    'calling the official Aragon OSx DAO Factory contract (0xb815791c233807d39b7430127975244b36c19c8e). This deployment is fully confirmed '
    'on-chain and verifiable via Sepolia Etherscan:'
)

p_prog_tx = doc.add_paragraph()
p_prog_tx.paragraph_format.space_before = Pt(0)
p_prog_tx.paragraph_format.space_after = Pt(3)
p_prog_tx.paragraph_format.line_spacing = 1.15
p_prog_tx.add_run('• Programmatic Deployment Transaction Hash: ')
add_hyperlink(p_prog_tx, 'https://sepolia.etherscan.io/tx/0x06c875aa4c46e395b815d44de462d5034f1bd13315311c910bc18734826bba92', '0x06c875aa4c46e395b815d44de462d5034f1bd13315311c910bc18734826bba92')
p_prog_tx.add_run(' (Confirmed in Block 12007627 · ')
add_hyperlink(p_prog_tx, 'https://sepolia.etherscan.io/tx/0x06c875aa4c46e395b815d44de462d5034f1bd13315311c910bc18734826bba92', 'View on Sepolia Etherscan')
p_prog_tx.add_run(')')

p_prog_dao = doc.add_paragraph()
p_prog_dao.paragraph_format.space_before = Pt(0)
p_prog_dao.paragraph_format.space_after = Pt(3)
p_prog_dao.paragraph_format.line_spacing = 1.15
p_prog_dao.add_run('• Deployed Programmatic DAO Contract: ')
add_hyperlink(p_prog_dao, 'https://sepolia.etherscan.io/address/0x68c9C9aE60afC6D548740006B87F716709A17221', '0x68c9C9aE60afC6D548740006B87F716709A17221')
p_prog_dao.add_run(' (')
add_hyperlink(p_prog_dao, 'https://sepolia.etherscan.io/address/0x68c9C9aE60afC6D548740006B87F716709A17221', 'Etherscan Contract Link')
p_prog_dao.add_run(' · ')
add_hyperlink(p_prog_dao, 'https://app.aragon.org/dao/ethereum-sepolia/0x68c9C9aE60afC6D548740006B87F716709A17221/', 'Aragon App Portal')
p_prog_dao.add_run(')')

add_p(
    'The deployment was initiated by the founding creator wallet (0x14f10A865e277C0B1949e18Dd9856602DB11742b) using the following production '
    'Node.js deployment runner script leveraging ethers.js and the Aragon OSx Factory interface:'
)

sdk_code = '''import { ethers } from "ethers";

// Production programmatic deployment script for Aragon OSx Factory
async function deployDaoProgrammatic() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org");
  const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  const factoryAddress = "0xb815791c233807d39b7430127975244b36c19c8e";
  const pluginRepo = "0x152c9e28995e418870b85cbbc0aee4e53020edb2";

  const factoryAbi = [
    "function createDao(" +
      "(address trustedForwarder, string daoURI, string subdomain, bytes metadata) _daoSettings, " +
      "(((uint8 release, uint16 build) versionTag, address pluginSetupRepo) pluginSetupRef, bytes data)[] _pluginSettings" +
    ") external returns (address createdDao, tuple(address plugin, tuple(address[] helpers, tuple(uint8 operation, address where, address who, address condition, bytes32 permissionId)[] permissions) preparedSetupData)[] installedPlugins)"
  ];

  const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);

  const daoSettings = {
    trustedForwarder: ethers.ZeroAddress,
    daoURI: "",
    subdomain: "",
    metadata: ethers.toUtf8Bytes("ipfs://QmZFohATQntZHXPGKbJNxncDcMmoaKrBzdenvtFbu7BXmH")
  };

  const pluginSettings = [
    {
      pluginSetupRef: {
        versionTag: { release: 1, build: 2 },
        pluginSetupRepo: pluginRepo
      },
      data: ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256", "uint256"], [signer.address, 0n, 0n])
    }
  ];

  console.log("Broadcasting createDao transaction to Aragon OSx Factory...");
  const tx = await factory.createDao(daoSettings, pluginSettings, { gasLimit: 3200000n });
  console.log("Transaction Hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("Mined in Block:", receipt.blockNumber);
}

deployDaoProgrammatic();'''

add_code_box(sdk_code)

# Save across target paths
paths = [
    '/Users/simon/Downloads/HW_DAO_Deployment_Simon_Havlik.docx',
    '/Users/simon/Downloads/Verxl_DAO_Homework_Submission.docx',
    '/Users/simon/dev/verxl-protocol/public/Verxl_DAO_Homework_Submission.docx'
]

for p in paths:
    doc.save(p)
    print('Successfully saved:', p)
