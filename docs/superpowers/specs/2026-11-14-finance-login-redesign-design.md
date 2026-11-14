# Login do finance-app reimaginado — design curto

Data: 2026-11-14. Referência visual: a tela de abertura "Finova AI" que o Carlos enviou (título grande sobre fundo azul com luz difusa, cartões translúcidos, grade de bolinhas "Investment Performance", botões escuros em pílula).

**[Decidido]** é o que o Carlos disse ou aprovou. **[Escolha do autor]** pode ser revertido na leitura.

## Intenção

Trocar o cartão centralizado da tela de login (`apps/web/finance-app/src/screens/Login/Login.tsx`) por uma tela de abertura com a linguagem da referência, mantendo o que o login precisa fazer: uma ação ("Continuar com Google") e o aviso de privacidade.

## Objetivos e limites **[Decidido]**

- Sem pessoa na tela: luz, gradiente e a grade de bolinhas fazem o papel visual.
- Sem números de marketing. Os cartões mostram o que o app faz de verdade.
- Sem menu: não existem páginas de Soluções, Preços etc. Única ação: entrar com Google.
- O aviso de privacidade continua na tela, em posição mais discreta (rodapé, letra pequena), com o mesmo texto e o mesmo e-mail de contato.
- Cores só com o que já existe nos tokens: gradiente do azul mais claro do `accent` até o navy do fundo. Nenhum token novo.

## Abordagens

1. Tudo dentro da tela de login, com a grade de bolinhas desenhada na própria tela. Mais rápido, mas a grade fica presa ao login e contraria a regra do `CLAUDE.md` de que primitivos visuais nascem no design system.
2. **[Decidido]** A grade vira um componente do `@industry/web` (`DotGrid`), com teste, story e changeset, e o login é montado com ele. Mais trabalho (Chromatic e nova versão do pacote), mas segue a regra do repositório e a grade pode virar depois um gráfico real de gastos por dia em Relatórios.

## `DotGrid` no `@industry/web` **[Escolha do autor]**

- Props: `values: number[]` (intensidade de cada bolinha, entre 0 e 1), `columns: number`, `legend?: { low: string; high: string }` (mostra "low ○ ◐ ● high" abaixo da grade quando informado), `label?: string`.
- Quatro níveis de cor, do mais apagado ao mais forte, todos de tokens existentes (superfície → `accent` escuro → `accent` médio → `accent` claro). Valores fora de 0–1 ou não finitos são tratados como 0 ou 1, sem quebrar.
- Com `label`, a grade tem `role="img"` e esse nome acessível. Sem `label`, é decorativa (`aria-hidden`).
- Sem animação.
- Teste, story no Storybook (web) e changeset minor do `@industry/web`.

## Tela de login **[Escolha do autor, salvo o que está marcado acima]**

Desktop (no celular tudo vira uma coluna, na mesma ordem):

```
┌───────────────────────────────────────────────────────────────┐
│ ◢ Finanças                                 [ Entrar com Google ]│  accent-500 no topo → navy
│ (• controle financeiro pessoal)                                │
│              Suas finanças                                     │
│                    em ordem                                    │  título grande
│ ┌ Gastos dia a dia ──────────┐  ┌───────┐ ┌───────┐ ┌───────┐  │
│ │ ● ○ ● ● ○ ● ○ ● ● ○ ● ○    │  │Contas │ │Orçam. │ │ Metas │  │  cartões translúcidos
│ │ menos ○ ◐ ● mais           │  └───────┘ └───────┘ └───────┘  │
│ └────────────────────────────┘  frase curta sobre o app        │
│                                 [ ↗ Continuar com Google ]     │
│ aviso de privacidade em letra pequena no rodapé                │
└───────────────────────────────────────────────────────────────┘
```

- Fundo: gradiente do `--color-accent-500` no topo até `--color-bg` embaixo, com uma luz radial mais clara (`--color-accent-400`) no canto superior, longe do texto. O tom do topo foi escolhido pelo contraste: o texto claro dos tokens (`#f2f5fa`) tem 2,27:1 sobre `accent-400` e 3,11:1 sobre `accent-500`, o único dos azuis claros que atinge os 3:1 exigidos para texto grande.
- Título "Suas finanças em ordem" em duas linhas deslocadas, como na referência, num tamanho de exibição maior que `--text-h1` (não existe token de display; o tamanho fica na tela, com `clamp` para caber no celular).
- Selo pequeno acima do título: "Controle financeiro pessoal".
- Cartão "Gastos dia a dia" com o `DotGrid` em dados fixos de ilustração, decorativo; a legenda "menos / mais" deixa claro que é um exemplo do recurso, não dados de alguém.
- Três cartões translúcidos com o que o app faz: "Contas e saldos", "Orçamentos com aviso", "Metas com aportes". Uma frase abaixo cita relatórios e exportação.
- Dois botões levam ao mesmo login Google: o do cabeçalho ("Entrar com Google") e o principal ("Continuar com Google"). Os dois ficam desabilitados enquanto o popup está aberto; o erro continua aparecendo como toast.
- Fora do escopo: o círculo "Start Now", o "Scroll down" e o "Watch Demo" da referência.

## Restrições

- Contraste: o título precisa de pelo menos 3:1 sobre o fundo atrás dele (texto grande) e os textos menores, 4,5:1; por isso eles ficam na parte do gradiente que já escureceu.
- Só tokens do Industry para cor, espaçamento e raio; nada de hex na tela.
- Os quatro comportamentos já testados do login continuam valendo (botão do Google, aviso com e-mail, erro em toast, popup fechado sem erro).

## Verificação

- Testes do `DotGrid` e do login atualizados; lint, tipos e cobertura ≥ 95% nos arquivos alterados.
- Story do `DotGrid` vista no Storybook; captura do login em 1280px e 390px no navegador.
