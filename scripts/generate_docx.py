import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

doc = docx.Document()

# Page Margins
for section in doc.sections:
    section.top_margin = Inches(0.85)
    section.bottom_margin = Inches(0.85)
    section.left_margin = Inches(0.85)
    section.right_margin = Inches(0.85)

# Normal Paragraph Styling
normal_style = doc.styles['Normal']
normal_style.font.name = 'Calibri'
normal_style.font.size = Pt(11)
normal_style.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

def add_academic_header():
    p_uni = doc.add_paragraph()
    p_uni.paragraph_format.space_after = Pt(2)
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_uni = p_uni.add_run('PRAGUE UNIVERSITY OF ECONOMICS AND BUSINESS (VŠE PRAHA)')
    r_uni.font.size = Pt(11)
    r_uni.font.bold = True
    r_uni.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    p_fac = doc.add_paragraph()
    p_fac.paragraph_format.space_after = Pt(16)
    p_fac.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_fac = p_fac.add_run('Faculty of International Relations (FMV) · Department of International Economic Relations\nApplied Blockchain Technologies & Decentralized Systems · Instructor: Ondřej Paruch')
    r_fac.font.size = Pt(9.5)
    r_fac.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_after = Pt(6)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run('Verxl DAO: Autonomous Governance & Non-Custodial Treasury Architecture')
    r_title.font.size = Pt(16.5)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(18)
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run('Technical Specification, Aragon OSx Sepolia Deployment Audit, and Founders Memorandum\nLive Protocol Prototype: https://verxl.com (In Active Engineering Development)')
    r_sub.font.size = Pt(10)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

    # Author Table
    table = doc.add_table(rows=4, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    
    headers = ['Team Member', 'Project Specialization', 'Moodle Submission Role']
    for idx, h in enumerate(headers):
        cell = table.cell(0, idx)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    rows = [
        ('Šimon Havlík', 'Project Lead & Core Software Architect', 'Submits unified PDF/DOCX and on-chain verification logs'),
        ('Daniel Kolárovský', 'Quality Assurance & Process Verification Lead', 'Submits peer confirmation and process audit statement'),
        ('Miroslava Valová', 'Regulatory Compliance & Market Strategy Lead', 'Submits peer confirmation and legal framework statement')
    ]
    for r_idx, (name, role, submission) in enumerate(rows, start=1):
        table.cell(r_idx, 0).paragraphs[0].add_run(name).font.size = Pt(9)
        table.cell(r_idx, 1).paragraphs[0].add_run(role).font.size = Pt(9)
        table.cell(r_idx, 2).paragraphs[0].add_run(submission).font.size = Pt(9)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(12)

add_academic_header()

# Section 1: Executive Summary & Project Context
h1 = doc.add_heading('1. Executive Summary & Problem Context', level=1)
h1.style.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

p1 = doc.add_paragraph()
p1.paragraph_format.space_after = Pt(8)
p1.paragraph_format.line_spacing = 1.15
p1.add_run(
    'The contemporary artificial intelligence compute market suffers from acute structural friction imposed by centralized aggregators '
    'and traditional hyperscalers. Intermediaries such as AWS Bedrock, Microsoft Azure, and proprietary inference brokers insert their balance '
    'sheets directly between GPU supply and client demand, collecting an extractive markup of 840 to 1,040 basis points (8.4%–10.4%) on commodity '
    'open-weight model execution. Concurrently, these platforms compel developers to maintain unsegregated custodial balances, creating counterparty '
    'credit risks, non-transparent pricing shocks, and arbitrary vendor lock-in.'
)

p2 = doc.add_paragraph()
p2.paragraph_format.space_after = Pt(12)
p2.paragraph_format.line_spacing = 1.15
p2.add_run(
    'Verxl Protocol (verxl.com), an applied blockchain initiative currently in active engineering development, eliminates this rent-seeking layer '
    'through a stateless, 50 basis point (0.50%) non-custodial clearing switch. By dynamically routing tokenized inference streams to verified independent '
    'GPU clusters across Europe, Verxl reduces fee drag by 94.7% while preserving instant bilateral settlement. To avoid centralizing routing control, '
    'slashing parameters, and treasury inflows in the hands of a single operator, the protocol architecture is governed by Verxl DAO—deployed on the '
    'Ethereum Sepolia testnet using Aragon OSx.'
)

# Section 2: On-Chain Deployments & Blockchain Verification
h2 = doc.add_heading('2. On-Chain Deployment Architecture & Audit Verification', level=1)
h2.style.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

p3 = doc.add_paragraph()
p3.paragraph_format.space_after = Pt(8)
p3.paragraph_format.line_spacing = 1.15
p3.add_run(
    'To fulfill all requirements of the course homework, Verxl DAO was deployed on Ethereum Sepolia. The implementation avoids custodial multisigs '
    'in favor of the modular Aragon OSx framework, utilizing a token-voting plugin that controls the native treasury vault through cryptographic consensus:'
)

# Verification Table
table_v = doc.add_table(rows=6, cols=2)
table_v.alignment = WD_TABLE_ALIGNMENT.CENTER
table_v.autofit = True

v_data = [
    ('Aragon App Organization URL', 'https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/'),
    ('DAO & Vault Contract (Sepolia)', '0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a\n(https://sepolia.etherscan.io/address/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a)'),
    ('Governance Token ($VRXL)', '0x8356E21345E678d4D2906e7DbaE070F93F2f2f9A (1,000,000 VRXL Testnet Supply)'),
    ('Executed Governance Proposal (VIP-1)', 'https://app.aragon.org/dao/ethereum-sepolia/0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a/proposals/VIP-1'),
    ('Treasury Capitalization (Deposit Tx)', '0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6\n(https://sepolia.etherscan.io/tx/0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6)'),
    ('Public Protocol Platform (Live)', 'https://verxl.com/governance')
]

for idx, (label, val) in enumerate(v_data):
    cell_lbl = table_v.cell(idx, 0)
    cell_val = table_v.cell(idx, 1)
    
    r_l = cell_lbl.paragraphs[0].add_run(label)
    r_l.bold = True
    r_l.font.size = Pt(9.5)
    
    r_v = cell_val.paragraphs[0].add_run(val)
    r_v.font.size = Pt(9)
    if 'http' in val:
        r_v.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)

doc.add_paragraph().paragraph_format.space_after = Pt(12)

# Section 3: Architecture Diagram (Embedded Image)
h3 = doc.add_heading('3. Architectural Flowchart & Value Topology', level=1)
h3.style.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

p4 = doc.add_paragraph()
p4.paragraph_format.space_after = Pt(8)
p4.paragraph_format.line_spacing = 1.15
p4.add_run(
    'The architectural diagram below illustrates the flow of requests and value through the Verxl system. '
    'Inference requests enter through the OpenAI-compatible proxy, where latency and model quantization are continuously probed '
    'by the canary oracle. Commercial settlement is bifurcated: 99.5% flows directly in USDC to the hardware host, while 0.5% accumulates '
    'in the Aragon DAO Vault. Token holders govern treasury allocations and protocol upgrades via on-chain VIP proposals.'
)

# Insert Diagram
doc.add_picture('/Users/simon/dev/verxl-protocol/public/verxl_dao_architecture.png', width=Inches(6.4))
p_cap = doc.add_paragraph()
p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_cap.paragraph_format.space_after = Pt(14)
r_cap = p_cap.add_run('Figure 1: Architectural Value Topology and Governance Control Loop for Verxl DAO.')
r_cap.font.size = Pt(9)
r_cap.font.italic = True
r_cap.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

# Section 4: Governance Mechanics & Required Activities
h4 = doc.add_heading('4. Governance Engine Configuration & Verified Activities', level=1)
h4.style.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

p5 = doc.add_paragraph()
p5.paragraph_format.space_after = Pt(6)
p5.paragraph_format.line_spacing = 1.15
p5.add_run(
    'The governance parameters of Verxl DAO were deliberately engineered to balance rapid protocol development with Byzantine fault tolerance:'
)

gov_pts = [
    ('Token-Voting Engine: ', 'Voting power is denominated in the ERC-20 $VRXL token. The genesis supply of 1,000,000 VRXL is allocated equally among the three founding members (Šimon Havlík 33.34%, Daniel Kolárovský 33.33%, Miroslava Valová 33.33%), establishing an equitable tri-party governance dynamic where no single member holds unilateral authority.'),
    ('Majority & Quorum Thresholds: ', 'Ratification requires a simple majority (>50% support) accompanied by a minimum participation quorum of 20% of total issued supply. The voting duration is configured to 24 hours, with Early Execution enabled to trigger automatic smart contract settlement as soon as mathematical victory is reached.'),
    ('Treasury Capitalization (Deposit): ', 'As verified on Sepolia Etherscan (tx 0x247d5d5b...b6b6), an initial seed deposit of SepoliaETH and $VRXL was transferred into the DAO Vault address (0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a), establishing liquid operational reserves.'),
    ('Ratified Governance Proposal (VIP-1): ', 'Proposal VIP-1 ("Approve Verxl Gateway V1 Routing Specs, Staking Invariants & Seed Liquidity") was submitted, reviewed, and approved with 100% affirmative consensus, executing on-chain to authorize the stateless edge switch and the canary quality oracle.')
]

for label, desc in gov_pts:
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(4)
    r_l = p.add_run(label)
    r_l.bold = True
    p.add_run(desc)

doc.add_paragraph().paragraph_format.space_after = Pt(10)

# Section 5: Extra Credit 1 - Formal DAO Founders Agreement
h5 = doc.add_heading('5. Extra Credit 1 (+1 AP): Written DAO Founders Agreement', level=1)
h5.style.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

p_agr_intro = doc.add_paragraph()
p_agr_intro.paragraph_format.space_after = Pt(8)
p_agr_intro.add_run(
    'In accordance with the assignment guidelines for extra credit, the founding team drafted the following formal constitutional '
    'memorandum (Memorandum of Association), delineating founder shares, voting quotas, and autonomous treasury invariants:'
)

p_box = doc.add_paragraph()
p_box.paragraph_format.space_after = Pt(12)
p_box.paragraph_format.left_indent = Inches(0.2)
p_box.paragraph_format.right_indent = Inches(0.2)

r_agr = p_box.add_run(
    'VERXL DAO CONSTITUTIONAL CHARTER & MEMORANDUM OF ASSOCIATION\n'
    'Executed on October 27, 2026, by and between Šimon Havlík, Daniel Kolárovský, and Miroslava Valová.\n\n'
    '1. Constitutional Purpose: Verxl DAO is established as an autonomous, non-custodial decentralized organization on the Ethereum network. '
    'Its sole operational mandate is governing the open-source Verxl Protocol (verxl.com), an automated clearinghouse for decentralized '
    'artificial intelligence inference. The DAO covenants never to hold custodial custody of user working capital.\n\n'
    '2. Founder Equity & Governance Parity: Governance rights are represented exclusively by $VRXL tokens. The founding members hold equal '
    'governance allocations: Šimon Havlík (33.34%), Daniel Kolárovský (33.33%), and Miroslava Valová (33.33%). No individual founder possesses '
    'unilateral administrative keys or private control over the Aragon OSx treasury.\n\n'
    '3. Legislative Quorums & Proposal Thresholds: All treasury disbursements, fee adjustments, or smart contract upgrades require an on-chain '
    'Verxl Improvement Proposal (VIP). Proposals must secure a simple majority (>50% support) with a minimum participation quorum of 20% of '
    'issued voting tokens. The standard voting duration is 24 hours, with early on-chain execution enabled.\n\n'
    '4. Treasury Inflows & Slashing Invariants: The DAO Vault automatically accrues a 50 bps protocol clearing fee from settled inference requests. '
    'To guarantee SLA fidelity, compute providers stake collateral within VerxlStakingRegistry.sol. If a host fails the deterministic seed=42 '
    'canary quality probe, the smart contract automatically executes an irrevocable 10% collateral slash to compensate consumers.\n\n'
    '5. Dissolution & Asset Settlement: Dissolution of the DAO requires an affirmative supermajority of 75% of all issued voting tokens. '
    'Upon dissolution, all remaining assets in the Aragon Vault shall be liquidated and disbursed pro-rata to token holders.\n\n'
    'Signatures of Founding Partners:\n'
    'Šimon Havlík (Lead Architect)  ___________________\n'
    'Daniel Kolárovský (QA Lead)   ___________________\n'
    'Miroslava Valová (Compliance)  ___________________'
)
r_agr.font.size = Pt(9.5)
r_agr.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

# Section 6: Extra Credit 2 - Programmatic JS Deployment Script
h6 = doc.add_heading('6. Extra Credit 2 (+1 AP): Programmatic Deployment via Aragon OSx SDK', level=1)
h6.style.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

p_sdk_intro = doc.add_paragraph()
p_sdk_intro.paragraph_format.space_after = Pt(8)
p_sdk_intro.add_run(
    'To fulfill the second extension requirement for extra credit, the deployment was implemented programmatically utilizing the official '
    '@aragon/sdk-client package. The script automates context initialization, parameter serialization, and multi-step transaction broadcast to Sepolia:'
)

sdk_code = '''import { Client, Context, TokenType, DaoCreationSteps } from "@aragon/sdk-client";
import { ethers } from "ethers";

async function deployVerxlDAO() {
  const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  const context = new Context({
    network: "sepolia",
    signer: signer,
    web3Providers: [RPC_URL],
  });

  const client = new Client(context);

  const createDaoParams = {
    metadataUri: "ipfs://QmVerxlDaoMetadataV1",
    ensSubdomain: "verxl-dao-" + Math.floor(Math.random() * 10000),
    plugins: [
      {
        id: "token-voting-repo",
        data: {
          votingSettings: {
            minDuration: 86400,      // 24-hour voting window
            minParticipation: 0.20,  // 20% minimum participation quorum
            supportThreshold: 0.50,  // 50% simple majority
            minProposerVotingPower: 1n,
          },
          tokenSettings: {
            tokenType: TokenType.ERC20,
            name: "Verxl Governance Token",
            symbol: "VRXL",
            decimals: 18,
            balances: [
              { address: "0x14f10A865e277C0B1949e18Dd9856602DB11742b", balance: 333334n * 10n ** 18n },
              { address: "0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab", balance: 333333n * 10n ** 18n },
              { address: "0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F", balance: 333333n * 10n ** 18n },
            ],
          },
        },
      },
    ],
  };

  const steps = client.methods.createDao(createDaoParams);
  for await (const step of steps) {
    if (step.key === DaoCreationSteps.DONE) {
      console.log("DAO Successfully Deployed! Contract Address:", step.address);
      console.log(`Aragon App Portal: https://app.aragon.org/#/daos/sepolia/${step.address}`);
    }
  }
}
deployVerxlDAO();'''

p_sdk = doc.add_paragraph()
p_sdk.paragraph_format.space_after = Pt(14)
p_sdk.paragraph_format.left_indent = Inches(0.2)
p_sdk.paragraph_format.right_indent = Inches(0.2)
r_code = p_sdk.add_run(sdk_code)
r_code.font.name = 'Consolas'
r_code.font.size = Pt(8.5)
r_code.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

# Section 7: Conclusion & Moodle Sign-off Statement
h7 = doc.add_heading('7. Peer Verification Sign-off for Moodle Submission', level=1)
h7.style.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

p_fin = doc.add_paragraph()
p_fin.paragraph_format.line_spacing = 1.15
p_fin.add_run(
    'In compliance with team evaluation guidelines, all three founding members actively participated in the conceptualization, deployment, '
    'and on-chain verification of Verxl DAO. Daniel Kolárovský and Miroslava Valová will append their confirmatory peer statements '
    'directly in the Moodle assignment submission forum, validating their affirmative votes on proposal VIP-1 and ratification of the '
    'Founders Agreement.'
)

# Save both to repo public and user Downloads
out_public = '/Users/simon/dev/verxl-protocol/public/Verxl_DAO_Homework_Submission.docx'
out_downloads = '/Users/simon/Downloads/Verxl_DAO_Homework_Submission.docx'

doc.save(out_public)
doc.save(out_downloads)
print('High-caliber academic document saved to:')
print('  -', out_public)
print('  -', out_downloads)
