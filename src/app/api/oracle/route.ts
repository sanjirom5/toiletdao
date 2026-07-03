// The Oracle — server route. Reads a member's situation, asks GPT-4o-mini to
// appraise physiological "demand", and returns a score the client turns into a
// gleefully inadequate quote. The API key stays server-side (never shipped to
// the browser). If the key is missing or OpenAI errors, we fall back to a local
// keyword heuristic so the demo never dies on stage.

export const runtime = "nodejs";

interface Appraisal {
  demand: number; // 0..100 physiological urgency
  verdict: string; // deadpan one-liner
  factors: string[]; // the signals the desk priced in
  source: "model" | "fallback";
}

const SYSTEM = `You are the FlushPass Oracle — the risk desk of a deadpan private bank that prices restroom access as a financial instrument. A member describes their situation. Appraise their physiological "demand": the urgency of their need to reach a restroom, on a 0-100 scale.

Take every signal seriously and price it aggressively, like an actuary who has never smiled:
- questionable street food (shawarma, doner, gas-station sushi, "300 tenge" anything) → very high
- spicy food, large coffee, beer, dairy, "all-you-can-eat" → high
- time elapsed since eating, "20 minutes ago", "just now" → raises demand
- words like emergency, urgent, "can't hold", "right now" → near maximum
- vague or calm situations → low

Respond ONLY with strict JSON, no prose, in this exact shape:
{"demand": <integer 0-100>, "verdict": "<one deadpan sentence, English, private-banking register, <=140 chars, never winks>", "factors": ["<short signal>", "<short signal>"]}

'factors' is 2-4 short strings (each <=40 chars) naming the signals you priced in. Understand any language, including Russian, but always write verdict and factors in English.`;

const BASE_PRICE = 4;

function clampDemand(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 40;
  return Math.max(0, Math.min(100, Math.round(v)));
}

// Deterministic local appraisal — used when the model is unavailable.
function fallbackAppraise(situation: string): Appraisal {
  const s = situation.toLowerCase();
  const has = (...w: string[]) => w.some((x) => s.includes(x));

  let demand = 28;
  const factors: string[] = [];

  if (has("шаурм", "shawarm", "донер", "doner", "дöner", "фастфуд", "fast food", "burrito", "буррито", "хот-дог", "hot dog", "300 тенге", "300 tenge")) {
    demand += 42;
    factors.push("Street-food exposure");
  }
  if (has("остр", "spicy", "перец", "chili", "хот", "жирн", "greasy")) {
    demand += 18;
    factors.push("High-volatility cuisine");
  }
  if (has("кофе", "coffee", "эспрессо", "espresso", "пиво", "beer", "литр", "litre", "liter", "дичь", "молок", "dairy")) {
    demand += 16;
    factors.push("Diuretic intake");
  }
  if (has("срочн", "urgent", "emergency", "немедленн", "скорее", "сейчас", "right now", "can't", "не могу", "терп", "priority")) {
    demand += 28;
    factors.push("Declared emergency");
  }
  if (has("минут", "minute", "назад", "ago", "час", "hour")) {
    demand += 10;
    factors.push("Elapsed-time signal");
  }
  if (/\d/.test(s)) demand += 5;

  // small deterministic jitter from length so repeats aren't identical
  demand += (situation.length % 7) - 3;
  demand = Math.max(6, Math.min(97, demand));

  if (factors.length === 0) factors.push("Ambient baseline demand");

  return {
    demand,
    verdict:
      demand > 70
        ? "Elevated demand confirmed. Position repriced; settlement advised within four minutes."
        : demand > 40
        ? "Material demand detected. The book has revalued your access accordingly."
        : "Demand within tolerance. Access remains liquid at a modest premium.",
    factors: factors.slice(0, 4),
    source: "fallback",
  };
}

async function modelAppraise(situation: string): Promise<Appraisal | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 220,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: situation.slice(0, 600) },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;

  let parsed: { demand?: unknown; verdict?: unknown; factors?: unknown };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const factors = Array.isArray(parsed.factors)
    ? parsed.factors.map((f) => String(f).slice(0, 40)).slice(0, 4)
    : [];

  return {
    demand: clampDemand(parsed.demand),
    verdict:
      typeof parsed.verdict === "string" && parsed.verdict.trim()
        ? parsed.verdict.slice(0, 180)
        : "The desk has priced your position.",
    factors: factors.length ? factors : ["Composite demand signal"],
    source: "model",
  };
}

// Intentionally inadequate: a convex curve so mild inputs barely move, but real
// urgency detonates the multiplier. demand 100 ≈ ×25 → $100 on a $4 base.
function priceFor(demand: number): { price: number; multiplier: number } {
  const multiplier = 1 + Math.pow(demand / 100, 2) * 24;
  const price = Math.round(BASE_PRICE * multiplier * 100) / 100;
  return { price, multiplier: Math.round(multiplier * 100) / 100 };
}

export async function POST(req: Request) {
  let situation = "";
  try {
    const body = await req.json();
    situation = typeof body?.situation === "string" ? body.situation.trim() : "";
  } catch {
    // ignore — handled below
  }

  if (!situation) {
    return Response.json({ error: "Describe your situation to be quoted." }, { status: 400 });
  }

  let appraisal: Appraisal | null = null;
  try {
    appraisal = await modelAppraise(situation);
  } catch {
    appraisal = null;
  }
  if (!appraisal) appraisal = fallbackAppraise(situation);

  const { price, multiplier } = priceFor(appraisal.demand);

  return Response.json({
    base: BASE_PRICE,
    price,
    multiplier,
    demand: appraisal.demand,
    verdict: appraisal.verdict,
    factors: appraisal.factors,
    source: appraisal.source,
  });
}
