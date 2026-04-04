# Refatoração — Qualidade de Código Backend

> Problemas identificados na revisão de código. Todos os itens violam os padrões SOLID/Clean Code estabelecidos como obrigatórios no projeto.

---

## 1. Lógica de negócio no handler `search/route.ts`

**Problema:** O handler está decidindo o limite de buscas por plano — isso é regra de negócio e pertence ao `PlacesService`.

```typescript
// search/route.ts — não deve existir aqui
const FREE_SEARCH_LIMIT = 12
const PAID_SEARCH_LIMIT = 60
const limit = plan === 'paid' ? PAID_SEARCH_LIMIT : FREE_SEARCH_LIMIT
```

**O que fazer:**
- Mover as constantes e a lógica de resolução de limite para dentro do `PlacesService`
- O handler passa apenas o `userId` e os parâmetros de busca
- O serviço resolve o plano, calcula o limite e aplica o rate limit internamente

---

## 2. `MercadoPagoService.handleWebhook` — método longo com `upsert` duplicado

**Problema:** O bloco `webhookEventRepository.upsert({...})` é repetido 4 vezes com variações mínimas de `status`. Viola DRY e torna o método difícil de manter e testar.

**O que fazer:**
- Extrair métodos privados no `MercadoPagoService`:
  - `markProcessing(event, providerEventId)`
  - `markIgnored(event, providerEventId)`
  - `markProcessed(event, providerEventId)`
  - `markFailed(event, providerEventId, error)`
- Reduzir `handleWebhook` ao fluxo principal de decisão

---

## 3. Singletons de módulo inconsistentes nos handlers

**Problema:** Alguns serviços são criados uma vez no nível do módulo (singleton), outros por request. A inconsistência é um code smell.

```typescript
// search/route.ts — singleton de módulo
const placesService = makePlacesService()

// leads/route.ts — criado por request
const leadService = makeLeadService(supabase)
```

**O que fazer:**
- Definir e documentar um padrão único:
  - Serviços **sem** dependência do `SupabaseClient` do usuário (ex: `PlacesService`, `MercadoPagoService`) → singleton de módulo
  - Serviços **com** `SupabaseClient` do usuário → criados por request
- Aplicar o padrão consistentemente em todos os handlers

---

## 4. `LeadScorer` e `GooglePlacesRepository` instanciados em duplicata na factory

**Problema:** `makeLeadService` e `makePlacesService` instanciam `new LeadScorer()` e `new GooglePlacesRepository(...)` de forma independente.

```typescript
export function makeLeadService(supabase) {
  const scorer = new LeadScorer()                          // duplicado
  const placesRepository = new GooglePlacesRepository(...) // duplicado
}

export function makePlacesService() {
  const scorer = new LeadScorer()                          // duplicado
  const placesRepository = new GooglePlacesRepository(...) // duplicado
}
```

**O que fazer:**
- Extrair `makeLeadScorer(): LeadScorer` na factory
- Extrair `makePlacesRepository(): GooglePlacesRepository` na factory
- Ambas as funções `makeLeadService` e `makePlacesService` passam a usar essas factories internas

---

## 5. `LeadRepository.update` — `&&` em vez de `!== undefined`

**Problema:** O uso de `&&` para checagem de campo opcional pode silenciosamente ignorar um valor se ele for falsy — inconsistente com o restante do código que usa `!== undefined`.

```typescript
// inconsistente com o padrão do restante
...(input.status && { status: input.status })

// padrão correto usado no restante do código
...(input.status !== undefined && { status: input.status })
```

**O que fazer:**
- Trocar `&&` por `!== undefined` em todos os campos do `update`

---

## Prioridade sugerida

| # | Item | Impacto | Esforço |
|---|---|---|---|
| 1 | Lógica de negócio no handler `search` | Alto | Baixo |
| 2 | `handleWebhook` — extrair helpers | Alto | Médio |
| 3 | Singletons inconsistentes | Médio | Baixo |
| 4 | Duplicata na factory | Baixo | Baixo |
| 5 | `&&` no `LeadRepository.update` | Baixo | Mínimo |
