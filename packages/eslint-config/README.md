# @repo/eslint-config

**As configurações de ESLint compartilhadas do monorepo** — flat config, ESLint 9. Um detalhe de design define como tudo aqui funciona: **toda regra vira warning**, e o que quebra o build é `--max-warnings 0`.

## O truque do `only-warn`

Todas as três configs carregam `eslint-plugin-only-warn`, que converte qualquer violação em warning. Cada workspace então roda:

```sh
eslint . --max-warnings 0
```

O efeito é que **a severidade declarada na regra é cosmética**. Uma regra em `"error"` se comporta exatamente como uma em `"warn"`; o que reprova o build é a contagem chegar a um.

Isso vale para quem for adicionar regra aqui: não adianta subir a severidade para "forçar" alguma coisa. E vale para quem for lendo o output — um `warning` neste repo não é advisory, é build quebrado.

## As três configs

| Export                               | Uso                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `@repo/eslint-config/base`           | Qualquer pacote TypeScript                                                 |
| `@repo/eslint-config/react-internal` | Pacotes React — `@industry/web`, `@industry/mobile`                        |
| `@repo/eslint-config/next-js`        | Aplicações Next.js. Mantido para uso futuro; nenhum workspace consome hoje |

```js
// eslint.config.mjs
import { config } from '@repo/eslint-config/react-internal';

export default [...config, { ignores: ['storybook-static/**'] }];
```

## Fronteiras de arquitetura, aplicadas pelo linter

A parte mais interessante do pacote. `architecture-boundaries` exporta `domainServicesBoundaries(appSrcDir)`, que gera regras de `no-restricted-imports` transformando a camada de Clean Architecture em algo verificável:

```js
import { config } from '@repo/eslint-config/react-internal';
import { domainServicesBoundaries } from '@repo/eslint-config/architecture-boundaries';

export default [...config, ...domainServicesBoundaries('src')];
```

O que passa a ser impossível:

- **`domain/` não importa de camada nenhuma de fora.** É TypeScript puro — sem React, sem Firebase, sem navegação — e continua assim porque o linter recusa o contrário
- **`services/` não importa de `screens/`, `hooks/`, `components/`, `context/`, `store/` ou `navigation/`.** As dependências apontam para dentro

Sem isso, "a arquitetura é em camadas" é um acordo verbal que se desfaz no primeiro import de conveniência às onze da noite. Com isso, é uma propriedade do build. Usado pelo `appointmate` e pelo `tickets-app`.

## Plugins

`@eslint/js` · `typescript-eslint` · `eslint-plugin-react` · `eslint-plugin-react-hooks` · `@next/eslint-plugin-next` · `eslint-plugin-turbo` · `eslint-config-prettier` · `eslint-plugin-only-warn`

## Onde isso roda

O `mobile-apps.yml` faz lint dos dois apps e do `@industry/mobile` a cada PR que os toque. Os demais pacotes dependem do hook de pre-commit do Husky — que roda `check-types`, **não** lint — e de execução manual. Essa lacuna está registrada como débito conhecido no documento de arquitetura.
