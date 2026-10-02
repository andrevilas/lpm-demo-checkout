/**
 * Contrato com o gateway de pagamentos.
 *
 * Versão atual: v1 (somente cartão, parcelado ou à vista).
 * A versão v2 adiciona Pix, estorno parcial e webhooks; a migração está no roadmap do squad
 * ("Contrato de API de pagamentos v2") e aguarda aprovação do parceiro.
 */
import type { Money } from '../src/money';

export interface ChargeRequest {
  total: Money;
  cardToken: string;
  installments: number;
}

export interface ChargeResult {
  status: 'approved' | 'declined';
  authorizationCode?: string;
}

export interface PaymentGatewayV1 {
  charge(request: ChargeRequest): Promise<ChargeResult>;
}

export const gateway: PaymentGatewayV1 = {
  async charge(request) {
    if (!request.cardToken) return { status: 'declined' };
    return { status: 'approved', authorizationCode: `AUTH-${request.total.cents}-${request.installments}` };
  },
};
