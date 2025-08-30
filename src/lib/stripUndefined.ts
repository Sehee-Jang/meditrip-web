export function stripUndefinedDeep<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((v) => stripUndefinedDeep(v)) as unknown as T;
  }
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const sv = stripUndefinedDeep(v as unknown);
      if (sv !== undefined) out[k] = sv; // undefined 키 제거
    }
    return out as T;
  }
  return input;
}
