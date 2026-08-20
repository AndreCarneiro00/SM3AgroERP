# Plano 05: transferencias sem rewrite historico

## Prioridade

P2. Este plano fecha a brecha de editar ou deletar transferencia registrada.

## Dependencias

- Plano 02.
- Plano 03.

## Goal

- Permitir update apenas de campos sem impacto de caixa.
- Bloquear rewrite de origem, destino, valor e data.
- Impedir delete fisico de transferencia.
- Criar fluxo explicito de cancelamento por transferencia inversa.
- Validar a conta debitada pela transferencia inversa.

## Escopo

Inclui:

- `BankTransferService.update`;
- `BankTransferService.delete`;
- endpoint explicito para cancelamento;
- DTOs com `status` e `cancelId`;
- testes de controller/service.

Nao inclui:

- UI de cancelamento.
- criacao de uma nova transferencia correta apos cancelamento. Isso continua
  usando o endpoint normal de criacao.

## Regra de update

Campos estruturais nao podem mudar apos registro:

- `sourceBankAccount`;
- `destinationBankAccount`;
- `amount`;
- `transferDate`.

Permitir apenas campos sem impacto de caixa, inicialmente:

- `observation`.

Se o request mudar qualquer campo estrutural, retornar erro.

Mensagem sugerida:

```text
Bank transfer cash fields cannot be changed. Use a cancellation adjustment.
```

## Regra de delete

`DELETE /bank-transfers/{id}` nao deve remover fisicamente a transferencia,
porque transferencia registrada ja afetou caixa.

Opcao recomendada:

- bloquear o `DELETE`;
- orientar o uso do endpoint de cancelamento.

Mensagem sugerida:

```text
Bank transfer cannot be deleted. Use a cancellation adjustment.
```

## Endpoint de cancelamento

Adicionar endpoint explicito, por exemplo:

```text
POST /bank-transfers/{id}/cancel
```

Request sugerida:

```java
record CancelBankTransferRequest(
        LocalDate adjustmentDate,
        String observation
) {
}
```

`adjustmentDate` deve ser obrigatoria.

## Criacao da transferencia inversa

Ao cancelar transferencia:

- buscar transferencia original ativa;
- criar nova `bank_transfer` com `status = ADJUSTMENT`;
- preencher `cancel_id` apontando para a transferencia original;
- inverter origem e destino;
- copiar o mesmo valor;
- usar `adjustmentDate` como `transferDate`;
- marcar transferencia original como `CANCELED`;
- validar saldo projetado da conta debitada pela transferencia inversa.

Exemplo:

```text
Original:   A -> B, 100.00
Adjustment: B -> A, 100.00
```

Se a conta B nao puder suportar a saida na data do ajuste, o cancelamento deve
falhar e a transferencia original deve continuar ativa.

## Listagem

Por enquanto, listagens podem retornar todos os registros:

- original `CANCELED`;
- transferencia inversa `ADJUSTMENT`;
- transferencias `ACTIVE`.

Filtros para esconder ajustes por padrao ficam no plano frontend ou em plano de
consulta especifico.

## Testes

Adicionar cobertura para:

- editar apenas `observation`;
- tentar alterar origem falha;
- tentar alterar destino falha;
- tentar alterar valor falha;
- tentar alterar data falha;
- `DELETE` de transferencia registrada falha;
- cancelar transferencia cria inversa `ADJUSTMENT`;
- transferencia original fica `CANCELED`;
- `cancelId` aponta para a original;
- saldo considera original e inversa;
- cancelamento falha se a conta destino original ficaria negativa;
- criar transferencia de origem sem saldo continua falhando.

## Acceptance criteria

- `PUT /bank-transfers/{id}` nao reescreve campos de caixa.
- `DELETE /bank-transfers/{id}` nao remove historico.
- Cancelamento e auditavel por transferencia inversa.
- DTOs mostram `status` e `cancelId`.
