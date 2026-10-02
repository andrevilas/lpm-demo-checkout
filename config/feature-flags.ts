/**
 * Feature flags do checkout. Os valores de produção vêm das variáveis de ambiente do deploy;
 * este repositório não registra quais flags estão ligadas em cada ambiente.
 */
export const featureFlags = {
  /** Parcelamento no checkout (ADR-001). Desligado por padrão até o antifraude cobrir compras parceladas. */
  installments: process.env.FEATURE_INSTALLMENTS === 'true',
  /** Pix ainda não implementado; ver checkout/pix.ts. */
  pix: false,
};
