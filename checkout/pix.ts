/**
 * Pagamento com Pix no checkout.
 *
 * Ainda não implementado: depende do contrato v2 do gateway de pagamentos (payments/gateway.ts),
 * que inclui cobranças imediatas e webhooks de confirmação.
 */
import type { Money } from '../src/money';

export interface PixCharge {
  txid: string;
  qrCode: string;
  expiresAt: string;
  total: Money;
}

export async function createPixCharge(_orderId: string, _total: Money): Promise<PixCharge> {
  throw new Error('Pix não implementado: aguardando o contrato v2 do gateway de pagamentos.');
}
