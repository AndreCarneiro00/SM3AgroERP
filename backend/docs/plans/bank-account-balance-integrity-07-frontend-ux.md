# Plano 07: UX frontend para integridade de saldo

## Prioridade

P4. Este plano melhora a experiencia do usuario, mas nao substitui validacao no
backend.

## Dependencias

- Planos backend necessarios para o fluxo que sera exposto.

## Goal

- Antecipar erros previsiveis de saldo bancario.
- Evitar que a UI ofereca edicoes que o backend bloqueia.
- Exibir `status` e `cancelId` quando isso ajudar auditoria.
- Manter mensagens especificas retornadas pela API.

## Escopo

Inclui:

- tipos DTO no frontend;
- formularios de conta bancaria;
- dialog de baixa;
- formulario/listagem de transferencia;
- fluxos de cancelamento se os endpoints backend ja existirem.

Nao inclui:

- calcular saldo projetado no frontend;
- duplicar regra bancaria da API;
- criar endpoint backend novo.

## Conta bancaria

Em edicao de conta existente:

- desabilitar `initialBalance`;
- desabilitar `initialBalanceDate`;
- explicar que a correcao deve ser feita por ajuste auditavel;
- permitir editar campos cadastrais;
- permitir inativar conta com movimentos.

Na listagem:

- se a UI souber que ha movimentos, ocultar/desabilitar botao de delete;
- se nao souber, permitir tentativa e exibir erro da API.

## Baixas

Em `FulfillmentDialog`:

- mostrar saldo atual da conta selecionada quando disponivel;
- para `EXPENSE`, mostrar aviso se `currentBalance < amountPaid`;
- nao bloquear apenas por esse calculo simples, porque a regra real e
  cronologica;
- exibir mensagem especifica da API via `extractApiErrorMessage`.

Para baixa existente:

- permitir editar somente observacao, se o backend seguir essa regra;
- campos de conta, data, valor e alocacoes devem ser read-only;
- fluxo de cancelamento deve chamar endpoint explicito quando existir.

## Transferencias

Em edicao de transferencia existente:

- origem, destino, valor e data devem ser read-only;
- permitir editar somente observacao;
- correcao estrutural deve ser feita por cancelamento + nova transferencia.

Na listagem:

- incluir suporte a `status` e `cancelId`;
- opcionalmente esconder `ADJUSTMENT` por padrao com toggle para auditoria;
- nao esconder no backend nesta etapa.

## Testes e validacao

Executar:

```text
npm run build
```

Validar manualmente:

- campos de saldo inicial ficam bloqueados em edicao;
- erro da API aparece ao tentar operacao que negativaria conta;
- transferencia existente nao permite editar campos estruturais;
- cancelamento aparece como fluxo separado quando endpoint existir;
- status/cancelId aparecem ou sao preservados nos tipos.

## Acceptance criteria

- UI nao incentiva operacoes que o backend rejeita.
- Backend continua sendo a fonte de verdade.
- Mensagens de erro especificas continuam visiveis.
- Build TypeScript passa.
