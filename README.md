# LPM demo · Squad Checkout

Repositório **fictício** usado nas demonstrações do [LPM — Little Project Manager](https://lpm.rocks).

Ele simula o código de um time de checkout para mostrar como o Advisor do LPM responde perguntas sobre o roadmap
citando arquivo, linha e commit — e separando o que está **implementado no código** do que está **em produção**.

Não é um produto real e não processa pagamentos.

## Conteúdo

| Caminho | O que demonstra |
|---|---|
| `checkout/installments.ts` | Parcelamento implementado, atrás da feature flag `FEATURE_INSTALLMENTS` |
| `checkout/pix.ts` | Pix ainda não implementado (apenas o contrato da função) |
| `api/routes/checkout.ts` | Rotas de cotação e pagamento do checkout |
| `payments/gateway.ts` | Contrato v1 do gateway e a migração pendente para o v2 |
| `antifraud/rules.ts` | Regras simples de risco aplicadas antes do pagamento |
| `docs/adr-001-parcelamento.md` | Decisão de negócio sobre o parcelamento |
