/**
 * Rotas HTTP do checkout.
 *
 * POST /checkout/quote  → calcula total, frete e opções de pagamento do carrinho.
 * POST /checkout/pay    → cobra o pedido pelo gateway após a análise antifraude.
 */
import { featureFlags } from '../../config/feature-flags';
import { installmentOptions, type InstallmentOption } from '../../checkout/installments';
import { assessRisk } from '../../antifraud/rules';
import { gateway } from '../../payments/gateway';
import { money, type Money } from '../../src/money';

export interface CartLine {
  sku: string;
  quantity: number;
  unitCents: number;
}

export interface QuoteRequest {
  customerId: string;
  lines: CartLine[];
  shippingCents: number;
}

export interface QuoteResponse {
  total: Money;
  paymentMethods: Array<'card' | 'card-installments' | 'pix'>;
  installments: InstallmentOption[];
}

function cartTotal(request: QuoteRequest): Money {
  const items = request.lines.reduce((sum, line) => sum + line.quantity * line.unitCents, 0);
  return money(items + request.shippingCents);
}

export function quote(request: QuoteRequest): QuoteResponse {
  const total = cartTotal(request);
  const paymentMethods: QuoteResponse['paymentMethods'] = ['card'];
  if (featureFlags.installments) paymentMethods.push('card-installments');
  if (featureFlags.pix) paymentMethods.push('pix');
  const installments = featureFlags.installments ? installmentOptions(total) : [];
  return { total, paymentMethods, installments };
}

export interface PayRequest extends QuoteRequest {
  method: 'card' | 'card-installments' | 'pix';
  installmentCount?: number;
  cardToken?: string;
}

export async function pay(request: PayRequest) {
  const { total } = quote(request);
  const risk = assessRisk({ customerId: request.customerId, total, method: request.method });
  if (risk.decision === 'block') return { status: 'declined' as const, reason: risk.reason };
  if (request.method === 'pix') throw new Error('Pix indisponível: aguardando o contrato v2 do gateway.');
  return gateway.charge({ total, cardToken: request.cardToken ?? '', installments: request.installmentCount ?? 1 });
}
