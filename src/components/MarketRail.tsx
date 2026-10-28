import React, { useEffect, useMemo, useRef, useState } from "react";
import { Radio, WifiOff } from "lucide-react";

/**
 * Live settlement rail.
 *
 * Reads two public, keyless, CORS-enabled feeds directly from the browser:
 *  - Binance Spot REST  (24h ticker + 24 hourly closes for the sparkline)
 *  - Arbitrum One JSON-RPC (execution gas price + head block)
 *
 * No mock values, no synthetic movement. When the feed drops the rail keeps the
 * last verified snapshot on screen and labels its age instead of inventing data.
 */

const BINANCE = "https://api.binance.com/api/v3";
const ARBITRUM_RPC = "https://arb1.arbitrum.io/rpc";
const CACHE_KEY = "vrxl.marketRail.v1";
const TICKER_MS = 30_000;
const SPARK_MS = 5 * 60_000;
const TRANSFER_GAS = 65_000; // ERC-20 transfer, conservative L2 execution estimate

type FeedStatus = "loading" | "live" | "stale" | "offline";

interface AssetSpec {
  pair: string;
  base: string;
  quote: string;
  note: string;
  peg: boolean;
}

interface Quote {
  pair: string;
  base: string;
  quote: string;
  note: string;
  peg: boolean;
  price: number;
  changePct: number;
  high: number;
  low: number;
  spark: number[];
}

interface ChainState {
  gasGwei: number;
  block: number;
}

interface Snapshot {
  quotes: Quote[];
  chain: ChainState | null;
  ts: number;
}

const ASSETS: AssetSpec[] = [
  { pair: "ETHUSDT", base: "ETH", quote: "USDT", note: "L1 GAS TOKEN", peg: false },
  { pair: "ARBUSDT", base: "ARB", quote: "USDT", note: "SETTLEMENT CHAIN", peg: false },
  { pair: "USDCUSDT", base: "USDC", quote: "USDT", note: "SETTLEMENT ASSET", peg: true },
];

function decimalsFor(price: number) {
  if (price >= 1000) return 2;
  if (price >= 1) return 4;
  return 4;
}

function formatPrice(price: number) {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: decimalsFor(price),
    maximumFractionDigits: decimalsFor(price),
  });
}

function formatPct(pct: number) {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function formatTransferCost(usd: number) {
  if (!Number.isFinite(usd) || usd <= 0) return "n/a";
  if (usd < 0.0001) return "<$0.0001";
  return `$${usd.toFixed(4)}`;
}

function sparkPath(values: number[], width: number, height: number) {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.max(Math.abs(max), 1) * 0.0001;
  const step = width / (values.length - 1);
  return values
    .map((value, index) => {
      const x = (index * step).toFixed(2);
      const y = (height - ((value - min) / span) * (height - 2) - 1).toFixed(2);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function sparkArea(values: number[], width: number, height: number) {
  const line = sparkPath(values, width, height);
  if (!line) return "";
  return `${line} L${width},${height} L0,${height} Z`;
}

async function fetchJson(url: string, signal: AbortSignal): Promise<any> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchTickers(signal: AbortSignal): Promise<Map<string, any>> {
  const symbols = encodeURIComponent(JSON.stringify(ASSETS.map((asset) => asset.pair)));
  const payload = await fetchJson(`${BINANCE}/ticker/24hr?symbols=${symbols}`, signal);
  const map = new Map<string, any>();
  if (Array.isArray(payload)) {
    payload.forEach((row: any) => map.set(row.symbol, row));
  }
  return map;
}

async function fetchSparks(signal: AbortSignal): Promise<Map<string, number[]>> {
  const settled = await Promise.allSettled(
    ASSETS.map((asset) =>
      fetchJson(`${BINANCE}/klines?symbol=${asset.pair}&interval=1h&limit=24`, signal)
    )
  );
  const map = new Map<string, number[]>();
  settled.forEach((result, index) => {
    if (result.status !== "fulfilled" || !Array.isArray(result.value)) return;
    const closes = result.value
      .map((candle: any[]) => Number(candle[4]))
      .filter((value: number) => Number.isFinite(value));
    if (closes.length > 1) map.set(ASSETS[index].pair, closes);
  });
  return map;
}

async function fetchChain(signal: AbortSignal): Promise<ChainState> {
  const response = await fetch(ARBITRUM_RPC, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([
      { jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] },
      { jsonrpc: "2.0", id: 2, method: "eth_blockNumber", params: [] },
    ]),
  });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const payload = (await response.json()) as Array<{ result?: string }>;
  const gasHex = payload?.[0]?.result;
  const blockHex = payload?.[1]?.result;
  if (typeof gasHex !== "string" || typeof blockHex !== "string") throw new Error("RPC payload");
  const gasWei = Number(BigInt(gasHex));
  const block = Number(BigInt(blockHex));
  return { gasGwei: gasWei / 1e9, block };
}

function readCache(): Snapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Snapshot;
    if (!Array.isArray(parsed.quotes) || parsed.quotes.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(snapshot: Snapshot) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage is best effort */
  }
}

const Sparkline: React.FC<{ values: number[]; id: string; up: boolean }> = ({ values, id, up }) => {
  const width = 62;
  const height = 20;
  const line = useMemo(() => sparkPath(values, width, height), [values]);
  const area = useMemo(() => sparkArea(values, width, height), [values]);
  const stroke = up ? "#34d399" : "#f87171";
  if (!line) return <span className="market-spark-empty" aria-hidden="true" />;
  return (
    <svg
      className="market-spark"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
};

const QuoteCell: React.FC<{ quote: Quote; sequence: number; copy: number }> = ({ quote, sequence, copy }) => {
  const up = quote.changePct >= 0;
  const pegBps = Math.round((quote.price - 1) * 10_000);
  return (
    <div className="market-cell" role="listitem">
      <div className="market-cell__top">
        <span className="market-pair">
          {quote.base}
          <span className="market-pair__slash">/</span>
          {quote.quote}
        </span>
        <span className={`market-delta ${up ? "is-up" : "is-down"}`}>{formatPct(quote.changePct)}</span>
      </div>
      <div className="market-cell__mid">
        <span className="market-price" key={`${quote.pair}-${sequence}`}>
          {formatPrice(quote.price)}
        </span>
        <Sparkline values={quote.spark} id={`${quote.pair}-${copy}`} up={up} />
      </div>
      <div className="market-cell__foot">
        <span>{quote.note}</span>
        <span className="market-range">
          {quote.peg ? (
            <>
              PEG <strong className={pegBps >= 0 ? "is-up" : "is-down"}>{pegBps > 0 ? "+" : ""}{pegBps} bps</strong>
            </>
          ) : (
            <>
              24H {formatPrice(quote.low)} to {formatPrice(quote.high)}
            </>
          )}
        </span>
      </div>
    </div>
  );
};

const ChainCell: React.FC<{ chain: ChainState; transferUsd: number; sequence: number }> = ({
  chain,
  transferUsd,
  sequence,
}) => (
  <div className="market-cell market-cell--chain" role="listitem">
    <div className="market-cell__top">
      <span className="market-pair">
        ARB<span className="market-pair__slash">/</span>GAS
      </span>
      <span className="market-chain-tag">L2 EXECUTION</span>
    </div>
    <div className="market-cell__mid">
      <span className="market-price" key={`gas-${sequence}`}>
        {chain.gasGwei.toFixed(3)}
        <small> gwei</small>
      </span>
      <span className="market-chain-sub">BLOCK {chain.block.toLocaleString("en-US")}</span>
    </div>
    <div className="market-cell__foot">
      <span>USDC TRANSFER</span>
      <span className="market-range">
        <strong className="is-blue">{formatTransferCost(transferUsd)}</strong> · {TRANSFER_GAS.toLocaleString("en-US")} GAS
      </span>
    </div>
  </div>
);

const SkeletonCell: React.FC = () => (
  <div className="market-cell is-skeleton" role="listitem" aria-hidden="true">
    <div className="market-cell__top">
      <span className="market-skeleton-line" style={{ width: 54 }} />
      <span className="market-skeleton-line" style={{ width: 34 }} />
    </div>
    <div className="market-cell__mid">
      <span className="market-skeleton-line" style={{ width: 92, height: 15 }} />
      <span className="market-skeleton-line" style={{ width: 62, height: 14 }} />
    </div>
    <div className="market-cell__foot">
      <span className="market-skeleton-line" style={{ width: 78 }} />
      <span className="market-skeleton-line" style={{ width: 66 }} />
    </div>
  </div>
);

export const MarketRail: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [chain, setChain] = useState<ChainState | null>(null);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [sequence, setSequence] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const sparkRef = useRef<{ at: number; map: Map<string, number[]> }>({ at: 0, map: new Map() });
  const quotesRef = useRef<Quote[]>([]);

  quotesRef.current = quotes;

  // Paint the last verified snapshot immediately, so a cold or blocked network
  // never leaves an empty strip on screen.
  useEffect(() => {
    const cached = readCache();
    if (cached && cached.quotes.length) {
      setQuotes(cached.quotes);
      setChain(cached.chain);
      setLastUpdated(cached.ts);
      setStatus("stale");
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const load = async () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const needsSparks = Date.now() - sparkRef.current.at > SPARK_MS;
      const [tickers, sparks, chainState] = await Promise.allSettled([
        fetchTickers(controller.signal),
        needsSparks ? fetchSparks(controller.signal) : Promise.resolve(new Map<string, number[]>()),
        fetchChain(controller.signal),
      ]);

      if (!mountedRef.current || controller.signal.aborted) return;

      if (sparks.status === "fulfilled" && sparks.value.size > 0) {
        sparkRef.current = { at: Date.now(), map: sparks.value };
      }

      if (tickers.status === "fulfilled" && tickers.value.size > 0) {
        const previous = new Map(quotesRef.current.map((quote) => [quote.pair, quote]));
        const next: Quote[] = ASSETS.filter((asset) => tickers.value.has(asset.pair)).map((asset) => {
          const row = tickers.value.get(asset.pair);
          const price = Number(row.lastPrice);
          return {
            pair: asset.pair,
            base: asset.base,
            quote: asset.quote,
            note: asset.note,
            peg: asset.peg,
            price,
            changePct: Number(row.priceChangePercent),
            high: Number(row.highPrice),
            low: Number(row.lowPrice),
            spark:
              sparkRef.current.map.get(asset.pair) ??
              previous.get(asset.pair)?.spark ??
              [price, price],
          };
        });

        const moved = next.some((quote) => previous.get(quote.pair)?.price !== quote.price);
        const nextChain = chainState.status === "fulfilled" ? chainState.value : chain;

        setQuotes(next);
        if (chainState.status === "fulfilled") setChain(chainState.value);
        setLastUpdated(Date.now());
        setStatus("live");
        if (moved) setSequence((value) => value + 1);

        writeCache({ quotes: next, chain: nextChain ?? null, ts: Date.now() });
      } else if (quotesRef.current.length > 0) {
        setStatus("stale");
        if (chainState.status === "fulfilled") setChain(chainState.value);
      } else {
        setStatus("offline");
      }
    };

    void load();
    const refresh = window.setInterval(() => void load(), TICKER_MS);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);

    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      window.clearInterval(refresh);
      window.clearInterval(clock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ageSeconds = lastUpdated ? Math.max(0, Math.round((now - lastUpdated) / 1000)) : null;
  const ageLabel =
    ageSeconds === null
      ? status === "offline"
        ? "NO SNAPSHOT"
        : "SYNCING"
      : ageSeconds < 90
      ? `${ageSeconds}s AGO`
      : `${Math.round(ageSeconds / 60)}m AGO`;

  const ethPrice = quotes.find((quote) => quote.base === "ETH")?.price ?? NaN;
  const transferUsd = chain && Number.isFinite(ethPrice) ? (TRANSFER_GAS * chain.gasGwei * 1e-9 * ethPrice) : NaN;

  const statusLabel =
    status === "live"
      ? "LIVE FEED"
      : status === "loading"
      ? "SYNCING"
      : status === "stale"
      ? "STALE SNAPSHOT"
      : "FEED OFFLINE";

  const hasData = quotes.length > 0;

  const renderCells = (hidden: boolean, copy: number) => (
    <div className="market-group" role="list" aria-hidden={hidden || undefined}>
      {hasData
        ? quotes.map((quote) => (
            <QuoteCell key={quote.pair} quote={quote} sequence={sequence} copy={copy} />
          ))
        : null}
      {chain ? <ChainCell chain={chain} transferUsd={transferUsd} sequence={sequence} /> : null}
      {!hasData && !chain
        ? Array.from({ length: 4 }).map((_, index) => <SkeletonCell key={`skeleton-${index}`} />)
        : null}
      {hasData && !chain ? <SkeletonCell /> : null}
    </div>
  );

  return (
    <section className="market-rail" aria-label="Live settlement asset and chain telemetry">
      <div className="market-rail__head">
        <div className="market-rail__id">
          <span className={`market-live ${status === "live" ? "is-live" : ""}`} aria-hidden="true" />
          <span className="market-rail__title">SETTLEMENT RAIL</span>
          <span className="market-rail__div">/</span>
          <span className="market-rail__sub">LIVE SPOT AND CHAIN TELEMETRY</span>
          <span className="market-rail__source">BINANCE SPOT · ARBITRUM ONE</span>
        </div>

        <div className="market-rail__meta">
          <span className="market-rail__cost" title="L2 execution gas for one ERC-20 transfer at the live gas price">
            USDC TRANSFER <strong className={Number.isFinite(transferUsd) ? "is-blue" : ""}>{formatTransferCost(transferUsd)}</strong>
          </span>
          <span className="market-rail__div">·</span>
          <span className="market-rail__age">{ageLabel}</span>
          <span className={`market-status is-${status}`}>
            {status === "offline" ? <WifiOff className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="market-scroll">
        <div className="market-track">
          {renderCells(false, 0)}
          {renderCells(true, 1)}
          {renderCells(true, 2)}
          {renderCells(true, 3)}
        </div>
      </div>

      <div className="market-rail__legend">
        <span>PEG = USDC/USDT deviation from 1.0000</span>
        <span className="market-rail__div">·</span>
        <span>TRANSFER = 65,000 gas × gas price × ETH/USDT</span>
        <span className="market-rail__div">·</span>
        <span className="market-rail__ok">Spot reference, not protocol revenue</span>
      </div>
    </section>
  );
};
