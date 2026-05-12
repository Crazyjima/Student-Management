const MULTIPLIERS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

const DURATION_PATTERN = /^(\d+)(ms|s|m|h|d)$/;

export const parseDurationMs = (input: string): number => {
  const match = DURATION_PATTERN.exec(input);
  if (match === null) {
    throw new Error(`Invalid duration string: ${input}`);
  }
  const [, raw, unit] = match;
  const value = Number(raw);
  const multiplier = MULTIPLIERS[unit ?? ''];
  if (multiplier === undefined) {
    throw new Error(`Invalid duration unit: ${unit ?? ''}`);
  }
  return value * multiplier;
};
