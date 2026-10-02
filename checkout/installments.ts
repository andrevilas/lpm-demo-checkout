/**
 * Parcelamento no checkout (Squad Checkout).
 *
 * Calcula os planos de pagamento parcelado oferecidos a pedidos elegíveis.
 * Regras de negócio: docs/adr-001-parcelamento.md.
 * Disponibilidade em produção depende da flag FEATURE_INSTALLMENTS (config/feature-flags.ts).
 */
import { Money, assertRange, money, splitEvenly } from '../src/money';

/** Política de parcelamento vigente. */
export interface InstallmentPolicy {
  /** Número mínimo de parcelas oferecidas. */
  minInstallments: number;
  /** Número máximo de parcelas oferecidas. */
  maxInstallments: number;
  /** Valor mínimo de cada parcela, em centavos. */
  minInstallmentCents: number;
  /** Parcelas sem juros até este número, inclusive. */
  interestFreeUpTo: number;
  /** Juros mensais aplicados acima de `interestFreeUpTo`, em pontos-base. */
  monthlyInterestBps: number;
}

/** Política aprovada na ADR-001: até 12x, sem juros até 6x, parcela mínima de R$ 5,00. */
export const DEFAULT_POLICY: InstallmentPolicy = {
  minInstallments: 2,
  maxInstallments: 12,
  minInstallmentCents: 5_00,
  interestFreeUpTo: 6,
  monthlyInterestBps: 199,
};

export interface InstallmentOption {
  count: number;
  installment: Money;
  total: Money;
  interestFree: boolean;
}

/** Um pedido é elegível quando a menor parcela possível respeita o valor mínimo. */
export function isEligible(total: Money, policy: InstallmentPolicy = DEFAULT_POLICY): boolean {
  return total.cents >= policy.minInstallments * policy.minInstallmentCents;
}

/** Maior número de parcelas que mantém cada parcela acima do mínimo. */
export function maxInstallmentsFor(total: Money, policy: InstallmentPolicy = DEFAULT_POLICY): number {
  const byValue = Math.floor(total.cents / policy.minInstallmentCents);
  return Math.max(0, Math.min(policy.maxInstallments, byValue));
}

/** Aplica juros compostos mensais quando o plano passa do limite sem juros. */
export function withInterest(total: Money, count: number, policy: InstallmentPolicy = DEFAULT_POLICY): Money {
  if (count <= policy.interestFreeUpTo) return total;
  const monthlyRate = policy.monthlyInterestBps / 10_000;
  const months = count - policy.interestFreeUpTo;
  return money(Math.round(total.cents * (1 + monthlyRate) ** months));
}

/** Opções exibidas no checkout, da menor para a maior quantidade de parcelas. */
export function installmentOptions(total: Money, policy: InstallmentPolicy = DEFAULT_POLICY): InstallmentOption[] {
  if (!isEligible(total, policy)) return [];
  const options: InstallmentOption[] = [];
  for (let count = policy.minInstallments; count <= maxInstallmentsFor(total, policy); count += 1) {
    const financed = withInterest(total, count, policy);
    const [first] = installmentPlan(financed, count);
    options.push({ count, installment: first, total: financed, interestFree: count <= policy.interestFreeUpTo });
  }
  return options;
}

/** Texto exibido no seletor de parcelas, por exemplo "6x de R$ 50,00 sem juros". */
export function describeOption(option: InstallmentOption): string {
  const value = (option.installment.cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return option.interestFree
    ? `${option.count}x de ${value} sem juros`
    : `${option.count}x de ${value} com juros`;
}

/** Total efetivamente pago no plano escolhido. */
export const totalPaid = (option: InstallmentOption): Money => option.total;

/**
 * Divide o total em `count` parcelas com diferença máxima de um centavo entre elas.
 * As primeiras parcelas absorvem os centavos restantes, como exige a ADR-001.
 */
export function installmentPlan(total: Money, count: number) {
  assertRange(count, 2, 12);
  return splitEvenly(total, count, { roundTo: 'cents' });
}
