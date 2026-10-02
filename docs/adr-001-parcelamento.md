# ADR-001 — Parcelamento no checkout

- **Status:** aprovada
- **Contexto:** carrinhos acima de R$ 300 têm abandono alto quando só há pagamento à vista.
- **Decisão:** oferecer de 2x a 12x no cartão, sem juros até 6x, com parcela mínima de R$ 5,00.
  Juros de 1,99% ao mês acima de 6x. Arredondamento: as primeiras parcelas absorvem os centavos.
- **Liberação:** atrás da flag `FEATURE_INSTALLMENTS`, ligada por ambiente no deploy, somente depois que o antifraude
  cobrir compras parceladas (`antifraud/rules.ts`).
- **Consequências:** usa o contrato v1 do gateway, que já aceita parcelas; o contrato v2 só é necessário para estorno parcial.
