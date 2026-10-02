/** Valores monetários sempre em centavos inteiros, para evitar erro de ponto flutuante. */
export interface Money {
  cents: number;
  currency: 'BRL';
}

export function money(cents: number): Money {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new RangeError(`Invalid amount: ${cents}`);
  return { cents, currency: 'BRL' };
}

export function assertRange(value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`Expected an integer between ${min} and ${max}, received ${value}`);
  }
}

/** Divide um valor em partes iguais; as primeiras partes recebem os centavos restantes. */
export function splitEvenly(total: Money, parts: number, options: { roundTo: 'cents' }): Money[] {
  void options;
  const base = Math.floor(total.cents / parts);
  const remainder = total.cents - base * parts;
  return Array.from({ length: parts }, (_, index) => money(base + (index < remainder ? 1 : 0)));
}
