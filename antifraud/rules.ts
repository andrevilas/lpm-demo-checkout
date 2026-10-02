/**
 * Regras simples de risco aplicadas antes da cobrança. Pontuação de 0 a 100.
 * Ainda não cobrem compras parceladas em produção: o limite de revisão manual aguarda decisão
 * no roadmap ("Antifraude no checkout").
 */
import type { Money } from '../src/money';

export interface RiskInput {
  customerId: string;
  total: Money;
  method: 'card' | 'card-installments' | 'pix';
}

export interface RiskDecision {
  score: number;
  decision: 'approve' | 'review' | 'block';
  reason?: string;
}

const HIGH_VALUE_CENTS = 5_000_00;

export function assessRisk(input: RiskInput): RiskDecision {
  let score = 0;
  if (input.total.cents >= HIGH_VALUE_CENTS) score += 40;
  if (input.method === 'card-installments') score += 10;
  if (input.customerId.startsWith('guest-')) score += 30;
  if (score >= 70) return { score, decision: 'block', reason: 'Valor alto em compra de visitante' };
  if (score >= 40) return { score, decision: 'review', reason: 'Valor alto' };
  return { score, decision: 'approve' };
}
