// All landing copy in one place. Deadpan venture-satire voice.
// Product: ToiletDAO / WC.exit — a dynamic exchange for restroom access.

export const brand = {
  name: "ToiletDAO",
  wordmark: "WC.exit",
  ticker: "$WC",
  asset: "TOILET#14 · FL3",
} as const;

export const nav = {
  links: [
    { label: "Markets", href: "#markets" },
    { label: "How it clears", href: "#how" },
    { label: "Derivatives", href: "#derivatives" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  cta: "Open terminal",
} as const;

export const hero = {
  eyebrow: "Series A · $28M led by Peristaltic Capital",
  headline: "We tokenized the one resource you can't postpone.",
  subhead:
    "ToiletDAO is a dynamic exchange for restroom access. Price discovery in real time, slots settled on-chain, occupancy hedged with derivatives. Uber solved transport. We solve inevitability.",
  primaryCta: "Take a position",
  secondaryCta: "Read the whitepaper",
  ticker: "2.3M slots cleared · settlement T+0",
} as const;

export const surgeTape = {
  // Live-styled quote chips for the crawling ticker.
  quotes: [
    { sym: "WC-14·3F", px: "$34.20", chg: "+7.2%", up: true },
    { sym: "WC-09·2F", px: "$61.00", chg: "+18.4%", up: true },
    { sym: "RUSH·ALM", px: "7.4x", chg: "SURGE", up: true },
    { sym: "WC-07·1F", px: "$11.20", chg: "-4.1%", up: false },
    { sym: "FUT/DEC", px: "$58.00", chg: "-2.3%", up: false },
    { sym: "WC-22·5F", px: "$96.40", chg: "+42.0%", up: true },
    { sym: "SHORT·07", px: "$3.10", chg: "-9.0%", up: false },
    { sym: "GMV", px: "+340%", chg: "QoQ", up: true },
    { sym: "WC-03·1F", px: "$19.90", chg: "+2.6%", up: true },
    { sym: "BASIN-IDX", px: "412.7", chg: "+1.1%", up: true },
  ],
} as const;

export const metrics = [
  { value: "+340%", unit: "QoQ", label: "GMV (Gross Movement Value)" },
  { value: "2.3M", unit: "", label: "Bookings settled to date" },
  { value: "91%", unit: "", label: "Toilet Score retention within 24h" },
  { value: "7.4x", unit: "", label: "Avg peak surge · Almaty offices, Fri 17:00" },
] as const;

export const featuredIn = [
  "TechCrunch",
  "a16z Future",
  "Bloomberg Bidet",
  "The Flush Street Journal",
  "Forbes 30 Under 30",
  "Hacker News · #1",
] as const;

export const problem = {
  eyebrow: "The thesis",
  heading: "Restroom access is the last unpriced market on Earth",
  body: "Every office runs a $0 liquidity crisis at 9:00 AM. Demand is inelastic, supply is fixed, and access is allocated by the most primitive mechanism in economics: a line. No price signal. No hedging. No secondary market. Billions of high-value knowledge workers stand idle in a queue they cannot exit and cannot forecast. We saw a market where everyone else saw a hallway.",
} as const;

export const howItWorks = {
  eyebrow: "How the market clears",
  heading: "Three steps from queue to settlement",
  steps: [
    {
      n: "01",
      title: "Discover live inventory",
      desc: "Browse every stall in your building with a real-time countdown to the next free slot. Occupancy is streamed on-chain and priced by our engine, trained on 10M+ historical occupancy patterns.",
    },
    {
      n: "02",
      title: "Bid your urgency",
      desc: "Book a 4-minute slot. Set the Urgency Slider (1–10) to self-report need. Higher urgency clears faster — and yes, admitting panic costs more. That's not a bug. That's price discovery.",
    },
    {
      n: "03",
      title: "Show up or get liquidated",
      desc: "Arrive within 30 seconds or your booking burns and your Toilet Score drops. Can't commit? Buy a Future, short an empty stall, or resell your slot above face on the secondary market.",
    },
  ],
  curve: {
    eyebrow: "Time-to-slot pricing curve",
    caption:
      "Price is a function of proximity. The closer the slot, the scarcer the asset. The 9:00–9:15 Rush Hour band clears at a 5× multiplier.",
    // anchors used by the curve + the terminal ask ladder
    anchors: [
      { hours: 48, price: 10, label: "48h out" },
      { hours: 24, price: 20, label: "24h" },
      { hours: 6, price: 35, label: "6h" },
      { hours: 1, price: 100, label: "1h" },
    ],
  },
} as const;

export const occupancy = {
  eyebrow: "Live occupancy",
  heading: "Every stall is an order book",
  body: "Floor 3 in real time. Green is vacant liquidity, amber is reserved, red is occupied and climbing. Hover any stall to pull its quote.",
  legend: [
    { key: "vacant", label: "Vacant" },
    { key: "reserved", label: "Reserved" },
    { key: "occupied", label: "Occupied" },
  ],
} as const;

export const derivatives = {
  eyebrow: "Secondary markets",
  heading: "A full derivatives stack on human predictability",
  cards: [
    {
      tag: "FUTURES",
      title: "Toilet Futures",
      desc: "Lock tomorrow's 9:05 slot at today's price. Hedge your morning against Rush Hour surge before the market prices it in.",
      chip: "FUT/DEC · $58.00",
      tone: "amber",
    },
    {
      tag: "SHORTS",
      title: "Toilet Shorts",
      desc: "Take a position that a stall stays empty through settlement. Fully collateralized. Historically our most reliable alpha before 8:45 AM.",
      chip: "SHORT·07 · $3.10",
      tone: "teal",
    },
    {
      tag: "RESALE",
      title: "Slot Resale",
      desc: "No longer need your booking? List it above face on the open market. Scalping, but for a resource with genuinely inelastic demand.",
      chip: "ASK · $34.20 +12%",
      tone: "vermilion",
    },
  ],
} as const;

export const economics = {
  eyebrow: "Unit economics",
  heading: "The math on markets of inevitability",
  takeRate: "12%",
  takeRateLabel: "Take rate on every settlement",
  rows: [
    { k: "TAM · every hallway on Earth", v: "$1.4T", note: "8.1B bladders × 6 events/day" },
    { k: "SAM · offices with ≥2 floors", v: "$220B", note: "priced restroom access" },
    { k: "SOM · Y1 beachhead (APAC coworking)", v: "$18M", note: "3-year serviceable target" },
    { k: "Blended take rate", v: "12%", note: "8% on Pro, 12% Retail" },
    { k: "CAC", v: "$0.04", note: "users arrive pre-motivated" },
    { k: "LTV", v: "$1,240", note: "6 events/day × 40-year career" },
    { k: "LTV : CAC", v: "31,000 : 1", note: "we round down for the board" },
    { k: "Payback period", v: "< 1 visit", note: "instant, by definition" },
    { k: "Moat", v: "Biological", note: "demand cannot be deferred, only priced" },
  ],
} as const;

export const token = {
  eyebrow: "Token & governance",
  heading: "The $WC token clears every settlement",
  body: "Every reserved minute settles on-chain against the flush reserve. $WC holders govern surge policy, floor-level SLAs, and inventory expansion. One wallet, one bladder, one vote.",
  // treasury ticks up live; others static
  treasuryStart: 41_203_918,
  stats: [
    { k: "Circulating supply", v: "1,000,000,000 $WC" },
    { k: "Staking APR", v: "6.9%" },
    { k: "Active governance proposals", v: "14" },
    { k: "Settlement finality", v: "T+0" },
  ],
  allocation: [
    { label: "Community", pct: 34 },
    { label: "Treasury", pct: 28 },
    { label: "Team & advisors", pct: 22 },
    { label: "Liquidity", pct: 16 },
  ],
  proposal: {
    id: "WCIP-14",
    text: "Raise Rush Hour multiplier to ×6 on Floor 3",
    meta: "Quorum reached · voting closes in 2 days · 68% in favor",
  },
} as const;

export const pricing = {
  eyebrow: "Pricing",
  heading: "Access is free. Certainty is not.",
  klarna:
    "Toilet Klarna available at checkout — buy now, pay later on urgent slots. Financing subject to Toilet Score.",
  tiers: [
    {
      tier: "Retail",
      price: "$0",
      period: "/mo",
      tagline: "Access the market. Pay surge.",
      featured: false,
      cta: "Start trading",
      features: [
        "Live inventory & next-slot countdown feed",
        "Standard queue priority",
        "Full surge pricing exposure (up to 5×)",
        "Urgency Slider 1–10",
        "12% take rate on every settlement",
        "Toilet Score credit profile",
      ],
    },
    {
      tier: "ToiletDAO Pro",
      price: "$9.99",
      period: "/mo",
      tagline: "For professionals who refuse to be a price-taker.",
      featured: true,
      cta: "Become a price-maker",
      features: [
        "Priority slot allocation ahead of Retail",
        "20% off all surge multipliers, Rush Hour included",
        "Gold Toilet rating & verified reliability badge",
        "Toilet Klarna: BNPL on urgent slots",
        "Futures & Shorts trading-desk access",
        "Reduced 8% take rate",
      ],
    },
    {
      tier: "Enterprise",
      price: "Contact sales",
      period: "",
      tagline: "Restroom infrastructure for the modern org.",
      featured: false,
      cta: "Talk to sales",
      features: [
        "White-label exchange for your campus",
        "HR integration: productivity-per-restroom-minute",
        "SSO, SOC 2, dedicated liquidity guarantees",
        "Bulk slot procurement & corporate hedging desk",
        "Custom surge governance & floor-level SLAs",
        "Quarterly GMV & Toilet Score benchmarking",
      ],
    },
  ],
} as const;

export const testimonials = {
  eyebrow: "Traders",
  heading: "The market speaks",
  quotes: [
    {
      quote:
        "I used to just go to the bathroom. Now I have a strategy and a risk-hedging position. My Q3 was the calmest of my career.",
      name: "Daniyar A.",
      title: "CFO, Series B SaaS startup",
      initials: "DA",
    },
    {
      quote:
        "I shorted stall #7 on a Friday afternoon. Highest-conviction trade of my career. The DAO taught me that empty is also a position.",
      name: "Marcus L.",
      title: "Independent liquidity provider",
      initials: "ML",
    },
    {
      quote:
        "We integrated Enterprise across three floors. Restroom-minute variance dropped 40% and we finally have a leading indicator for standup delays.",
      name: "Aigerim T.",
      title: "VP People Operations, 400-person scale-up",
      initials: "AT",
    },
  ],
} as const;

export const status = {
  eyebrow: "Trust & operations",
  heading: "Institutional-grade reliability",
  systems: "All systems operational",
  line: "Toilet #14, 3rd floor: Occupied · Uptime 99.97% · Last incident 14:32, resolved in 4 min",
  careers: {
    role: "Senior Flush Reliability Engineer",
    detail: "Remote · $120k–$160k + treasury staking · Governance experience a plus",
  },
} as const;

export const faq = {
  eyebrow: "FAQ",
  heading: "Questions from people who almost invested",
  items: [
    {
      q: "What if I have an emergency?",
      a: "Emergencies are our highest-margin segment. Toggle the Urgency Slider to 10 to enter the priority clearing queue, or activate Toilet Klarna to finance an instant slot at market. Our median emergency settlement time is 38 seconds — faster than most incident-response SLAs. Panic is not a failure state; it is a willingness-to-pay signal.",
    },
    {
      q: "How do you scale?",
      a: "The core mechanic is inventory-agnostic. Any scarce resource with a time-window and a physical access limit — parking spots, meeting rooms, office microwaves, EV chargers — trades on the same rails. We're not building a restroom app. We're building the settlement layer for markets of inevitability. TAM is every hallway on Earth.",
    },
    {
      q: "Isn't it unfair that admitting urgency costs more?",
      a: "It's not unfair, it's efficient. Urgency is private information; the slider simply lets you monetize your own transparency. Users who under-report to save money routinely miss their slot, burn the booking, and damage their Toilet Score. The market rewards honesty. We consider this a feature of moral clarity.",
    },
    {
      q: "What happens if I miss my slot?",
      a: "You have a 30-second grace window. After that the booking burns, your Toilet Score is debited, and the slot returns to the order book at market — where it is instantly re-cleared to the next wallet in queue. Punctuality is collateral. This is why 91% of users retain their Score within 24 hours.",
    },
    {
      q: "Can I really short a toilet?",
      a: "Yes. A Toilet Short is a position that a given stall remains unoccupied through a defined settlement window. If the stall stays empty, you collect. It's a fully collateralized derivative on human predictability, and historically the empty-stall trade has been our most reliable alpha before 8:45 AM.",
    },
    {
      q: "Is a toilet slot really an asset class?",
      a: "It has scarcity, a time-window, non-fungible physical delivery, volatility, and a derivatives layer. By every definition used in traditional finance, yes. We are simply the first team disciplined enough to say it on a pitch deck.",
    },
  ],
} as const;

export const footer = {
  tagline:
    "We don't sell restroom access. We sell infrastructure for markets of inevitability.",
  privacyLine:
    "Privacy Policy: We don't store how long you were inside. (We do. For the ML model. It was trained on 10M occupancy patterns and it would like more.)",
  statusLine:
    "All systems operational · Toilet #14, 3rd floor: Occupied · Uptime 99.97% · Last incident 14:32, resolved in 4 min",
  careersLine:
    "We're hiring: Senior Flush Reliability Engineer — remote, $120k–$160k + treasury staking. Governance experience a plus.",
  columns: [
    {
      title: "Markets",
      links: ["Live order book", "Occupancy map", "Futures desk", "Shorts desk", "Resale"],
    },
    {
      title: "Protocol",
      links: ["Whitepaper", "Tokenomics", "DAO governance", "Treasury", "Audits"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Status", "Press kit", "Contact sales"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Risk disclosure", "Settlement policy", "Toilet Score"],
    },
  ],
  disclosure:
    "Trading restroom derivatives involves risk, including total loss of dignity. Past occupancy is not indicative of future results. ToiletDAO is not a bank, a toilet, or a registered securities exchange. $WC is a utility token with no intrinsic value and considerable extrinsic confidence.",
} as const;
