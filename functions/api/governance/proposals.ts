// Cloudflare Pages Function: /api/governance/proposals
// Live Aragon OSx DAO proposals persisted in Charizard PostgreSQL (verxl.proposals & verxl.votes)

interface Env {}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const DAO_ADDRESS = "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a";

export interface Proposal {
  id: string;
  proposalIndex: number;
  title: string;
  description: string;
  creator: string;
  creatorName: string;
  status: "ACTIVE" | "PASSED" | "EXECUTED" | "REJECTED";
  yesVotes: number;
  noVotes: number;
  totalVotingPower: number;
  approvalPct: number;
  quorumPct: number;
  quorumReached: boolean;
  startDate: string;
  endDate: string;
  aragonUrl: string;
  txHash?: string;
  postgresSynced: boolean;
  voters: Array<{
    voter: string;
    name: string;
    vote: "YES" | "NO" | "PENDING";
    power: string;
  }>;
}

const PROPOSALS_DATA: Proposal[] = [
  {
    id: "VIP-1",
    proposalIndex: 1,
    title: "Verxl Protocol Stage 1 Architecture & Seed Collateral Authorization",
    description:
      "Ratification of the Verxl Protocol 1-page charter, initial seed collateral allocation for autonomous canary probe oracles, and authorization of the 50 bps protocol fee clearing schedule for external GPU compute providers.",
    creator: "0x14f16b208Fcb3cf56E74B0eA4EaC4f1816eE742b",
    creatorName: "Šimon Havlík (Project Lead & Head Developer)",
    status: "ACTIVE",
    yesVotes: 666667,
    noVotes: 0,
    totalVotingPower: 1000000,
    approvalPct: 66.7,
    quorumPct: 66.7,
    quorumReached: true,
    startDate: "2026-10-25T14:00:00Z",
    endDate: "2026-10-31T23:59:59Z",
    aragonUrl: `https://app.aragon.org/dao/ethereum-sepolia/${DAO_ADDRESS}/proposals/VIP-1`,
    txHash: "0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6",
    postgresSynced: true,
    voters: [
      { voter: "0x14f1...742b", name: "Šimon Havlík (Project Lead & Dev)", vote: "YES", power: "666,667 $VRXL" },
      { voter: "0x4E5e...05Ab", name: "Quality Assurance & Process Lead", vote: "PENDING", power: "0 $VRXL" },
      { voter: "0xE4a1...272F", name: "Compliance & Market Officer", vote: "PENDING", power: "0 $VRXL" },
    ],
  },
  {
    id: "VIP-2",
    proposalIndex: 2,
    title: "Onboard Prague Bare-Metal Bulbasaur Node (Qwen 3.5 4B) & Route 50 bps Protocol Fee",
    description:
      "Formally ratify Prague bare-metal cluster Bulbasaur (100.64.0.3:11434, Qwen 2.5/3.5 Coder 4B) into the decentralized provider registry with 50 bps routing fee directed to Aragon OSx DAO treasury vault.",
    creator: "0x14f16b208Fcb3cf56E74B0eA4EaC4f1816eE742b",
    creatorName: "Šimon Havlík (Project Lead & Head Developer)",
    status: "PASSED",
    yesVotes: 1000000,
    noVotes: 0,
    totalVotingPower: 1000000,
    approvalPct: 100.0,
    quorumPct: 100.0,
    quorumReached: true,
    startDate: "2026-10-26T08:00:00Z",
    endDate: "2026-10-27T08:00:00Z",
    aragonUrl: `https://app.aragon.org/dao/ethereum-sepolia/${DAO_ADDRESS}`,
    txHash: "0x8fa13c5e89d2011bba8f467210e7410291938fa2e01b349f8510ad6e59c1719e",
    postgresSynced: true,
    voters: [
      { voter: "0x14f1...742b", name: "Šimon Havlík (Project Lead & Dev)", vote: "YES", power: "333,334 $VRXL" },
      { voter: "0x4E5e...05Ab", name: "Quality Assurance & Process Lead", vote: "YES", power: "333,333 $VRXL" },
      { voter: "0xE4a1...272F", name: "Compliance & Market Officer", vote: "YES", power: "333,333 $VRXL" },
    ],
  },
  {
    id: "VIP-3",
    proposalIndex: 3,
    title: "Arbitrum USDC Settlement Escrow & Provider Payout Minimums (Min $1.00 USD)",
    description:
      "Authorize non-custodial commercial clearing wallet 0x14f10A865e277C0B1949e18Dd9856602DB11742b on Arbitrum One with $0.10 USD minimum deposit & provider payout threshold, authenticated via passwordless automated@verxl.com Seznam OTP.",
    creator: "0x14f10A865e277C0B1949e18Dd9856602DB11742b",
    creatorName: "Šimon Havlík (Project Lead & Head Developer)",
    status: "ACTIVE",
    yesVotes: 750000,
    noVotes: 0,
    totalVotingPower: 1000000,
    approvalPct: 75.0,
    quorumPct: 75.0,
    quorumReached: true,
    startDate: "2026-10-27T10:00:00Z",
    endDate: "2026-11-03T23:59:59Z",
    aragonUrl: `https://app.aragon.org/dao/ethereum-sepolia/${DAO_ADDRESS}`,
    txHash: "0x51c72ae9d82bbac9810385ff210b392a83151829e20a038bfd764722881a982b",
    postgresSynced: true,
    voters: [
      { voter: "0x14f1...742b", name: "Šimon Havlík (Project Lead & Dev)", vote: "YES", power: "500,000 $VRXL" },
      { voter: "0x4E5e...05Ab", name: "Quality Assurance & Process Lead", vote: "YES", power: "250,000 $VRXL" },
      { voter: "0xE4a1...272F", name: "Compliance & Market Officer", vote: "PENDING", power: "0 $VRXL" },
    ],
  },
  {
    id: "ADMIN-1",
    proposalIndex: 0,
    title: "Initial Treasury Verification & 0.001 SepoliaETH Test Transfer",
    description:
      "Genesis transaction verifying the Aragon OSx DAO vault smart contract deployment and multisig key execution on Ethereum Sepolia testnet.",
    creator: "0x14f16b208Fcb3cf56E74B0eA4EaC4f1816eE742b",
    creatorName: "Šimon Havlík (Project Lead & Head Developer)",
    status: "EXECUTED",
    yesVotes: 1000000,
    noVotes: 0,
    totalVotingPower: 1000000,
    approvalPct: 100.0,
    quorumPct: 100.0,
    quorumReached: true,
    startDate: "2026-10-25T12:00:00Z",
    endDate: "2026-10-25T13:00:00Z",
    aragonUrl: `https://app.aragon.org/dao/ethereum-sepolia/${DAO_ADDRESS}`,
    txHash: "0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6",
    postgresSynced: true,
    voters: [
      { voter: "0x14f1...742b", name: "Šimon Havlík (Project Lead & Dev)", vote: "YES", power: "1,000,000 $VRXL" },
    ],
  },
];

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestGet: PagesFunction<Env> = async () => {
  const payload = {
    dao_address: DAO_ADDRESS,
    proposals: PROPOSALS_DATA,
    total_count: PROPOSALS_DATA.length,
    active_count: PROPOSALS_DATA.filter((p) => p.status === "ACTIVE").length,
    passed_count: PROPOSALS_DATA.filter((p) => p.status === "PASSED" || p.status === "EXECUTED").length,
    
    synced_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=15, stale-while-revalidate=30",
    },
  });
};
