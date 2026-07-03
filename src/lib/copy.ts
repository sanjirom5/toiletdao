// WC.exit — deadpan private-banking copy. Never winks.

export const brand = {
  name: "WC.exit",
  institution: "ToiletDAO Institution",
} as const;

export const hero = {
  eyebrow: "A ToiletDAO Institution · Est. MMXXVI",
  headlineLead: "The private exchange for the moment that ",
  headlineEm: "will not wait",
  tag: "WC.exit provides members with priced, guaranteed access to a limited estate of two cabins. Liquidity is continuous; pricing is dynamic; settlement is immediate. We do not sell convenience — we price certainty.",
  primary: "Reserve access",
  secondary: "Request membership",
  assurances: ["Settlement · T+0", "Estate · 2 cabins", "Access · by tier"],
} as const;

export const estate = {
  eyebrow: "The Estate",
  heading: "Two cabins. One order book.",
  lede: "Our entire estate comprises two instruments. Scarcity is not a constraint we manage — it is the asset we intermediate.",
} as const;

export const desk = {
  eyebrow: "The Desk",
  heading: "Price your access.",
  lede: "Select an instrument, a settlement window, and your conviction. The book revalues live, to the cent.",
} as const;

export const doctrine = {
  eyebrow: "Doctrine",
  heading: "Three principles of scarce access.",
  columns: [
    {
      n: "I",
      h: "Dynamic revaluation",
      p: "Every slot is priced by proximity. Forty-eight hours out, liquidity is abundant and clears at ten dollars. As the window approaches the asset revalues — to one hundred within the final hour, and fivefold through the 09:00 rush.",
    },
    {
      n: "II",
      h: "Conviction pricing",
      p: "The urgency instrument lets members express private information. Higher conviction clears faster and settles higher. Candour is not penalised here; it is priced. Those who understate their need routinely forfeit their window.",
    },
    {
      n: "III",
      h: "Reliability as collateral",
      p: "Non-arrival forfeits the position and debits your Toilet Score. Standing compounds. Members who honour their windows ascend from Bronze, through Gold, to Sovereign — where the estate opens without friction.",
    },
  ],
} as const;

export const membership = {
  eyebrow: "Membership",
  heading: "Admission is by standing.",
  lede: "Three tiers govern access to the book. One is open; two are earned.",
  tiers: [
    {
      rank: "Tier I",
      name: "Founding Member",
      price: "Complimentary",
      priceNote: "",
      desc: "Standing access to the open order book.",
      featured: false,
      cta: "Open an account",
      features: [
        "Live two-cabin order book",
        "Standard clearing priority",
        "Full surge exposure, to ×5",
        "The urgency instrument",
        "Toilet Score enrolment",
      ],
    },
    {
      rank: "Tier II",
      name: "Private",
      price: "$240",
      priceNote: "per month",
      desc: "Priority liquidity for members who decline to be price-takers.",
      featured: true,
      cta: "Request Private",
      features: [
        "Priority clearing, ahead of the open book",
        "20% concession on all surge",
        "Gold standing on enrolment",
        "Secondary-market resale desk",
        "Deferred settlement (Toilet Klarna)",
        "A concierge liquidity line",
      ],
    },
    {
      rank: "Tier III",
      name: "Sovereign",
      price: "By invitation",
      priceNote: "",
      desc: "The estate, on your terms — surge notwithstanding.",
      featured: false,
      cta: "Enquire",
      features: [
        "Guaranteed access, surge notwithstanding",
        "Both cabins reservable in parallel",
        "A named settlement officer",
        "Bespoke floor-level assurances",
        "A governance seat on surge policy",
        "Discretion, as standard",
      ],
    },
  ],
  note: "Deferred settlement provided by Toilet Klarna. Financing subject to standing.",
} as const;

export const faq = {
  eyebrow: "Enquiries",
  heading: "For those conducting due diligence.",
  items: [
    {
      q: "Is a restroom slot genuinely an asset?",
      a: "It possesses scarcity, a delivery window, non-fungible physical settlement, and observable volatility. By every definition traditional finance applies, the answer is yes. We were simply the first to price it with discipline.",
    },
    {
      q: "Why should greater urgency cost more?",
      a: "Urgency is private information. The instrument lets you disclose it, and the book compensates the disclosure. Members who understate their need to economise routinely miss their window and forfeit the position. Candour is the efficient strategy.",
    },
    {
      q: "And in the event of an emergency?",
      a: "Emergencies are our most liquid segment. Advance the urgency instrument to ten to enter priority clearing, or elect deferred settlement to hold a slot immediately. Median priority settlement is under forty seconds — faster than most incident-response commitments.",
    },
    {
      q: "What follows a non-arrival?",
      a: "The check-in window closes, your position is liquidated to the open book at the prevailing price, and your Toilet Score is debited. Punctuality is the collateral. Standing is earned, never granted.",
    },
    {
      q: "Only two cabins?",
      a: "Two. Scarcity is not a limitation of the model; it is the model. A larger estate would dilute the very illiquidity our members pay to command.",
    },
    {
      q: "How do you intend to scale?",
      a: "The mechanism is instrument-agnostic. Any access-controlled resource with a time window — parking, boardrooms, the executive lift — clears on the same rails. We are not building a facilities application. We are building the settlement layer for inelastic demand.",
    },
  ],
} as const;

export const footer = {
  tagline: "We do not sell restroom access. We price the certainty of it.",
  columns: [
    { title: "The Estate", links: ["Cabin A", "Cabin B", "The order book", "Occupancy"] },
    { title: "Membership", links: ["Founding Member", "Private", "Sovereign", "Concierge"] },
    { title: "Institution", links: ["Doctrine", "Governance", "Careers", "Press"] },
    { title: "Legal", links: ["Privacy", "Terms", "Risk disclosure", "Toilet Score"] },
  ],
  privacyLine:
    "Privacy: we do not retain the duration of your occupancy. (We do. It trains the revaluation model, which would like a great deal more.)",
  statusLine:
    "All systems operational · Cabin A occupied · Cabin B available · Uptime 99.97% · Last incident 14:32, resolved in 4 min",
  careersLine:
    "Now appointing: Chief Liquidity Officer (Sanitation) — by referral, compensation commensurate with discretion.",
  disclosure:
    "Positions in restroom access carry risk, including the total loss of composure. Past occupancy does not indicate future availability. WC.exit is not a bank, a lavatory, or a registered exchange. Membership confers access, not ownership. $WC is a utility token with no intrinsic value and considerable extrinsic confidence.",
  legal: "© MMXXVI ToiletDAO Institution · Settlement T+0 · By invitation",
} as const;
