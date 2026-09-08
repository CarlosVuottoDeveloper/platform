# @repo/typescript-config

**Os `tsconfig` base compartilhados do monorepo.** Quatro presets, todos estendendo o mesmo núcleo estrito.

## A base

```jsonc
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "target": "ES2022",
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "isolatedModules": true,
  "declaration": true,
  "declarationMap": true,
}
```

Duas escolhas merecem explicação:

**`noUncheckedIndexedAccess`** é a mais incômoda e a mais valiosa. Acessar `array[0]` passa a devolver `T | undefined`, não `T` — porque é isso que o acesso realmente devolve. Obriga a tratar o caso vazio no ponto onde ele existe, em vez de descobrir em runtime.

**`strict` não é negociável por pacote.** Se um tipo dá erro, o caminho é corrigir o tipo, não afrouxar o config local.

## Os presets

| Export               | Para                       |
| -------------------- | -------------------------- |
| `base.json`          | Qualquer pacote TypeScript |
| `react-library.json` | Pacotes React com JSX      |
| `nextjs.json`        | Aplicações Next.js         |
| `react-native.json`  | Pacotes React Native       |

```jsonc
// tsconfig.json
{
  "extends": "@repo/typescript-config/react-library.json",
  "include": ["src"],
}
```

## A exceção dos apps Expo

Os dois apps mobile **não** estendem daqui. Eles estendem o `expo/tsconfig.base` diretamente.

Não é descuido: o Expo mantém o próprio config alinhado com o que cada SDK espera — tipos de plataforma, resolução de módulos, transformações de JSX — e sobrepor isso com o nosso base cria conflito silencioso a cada upgrade de SDK. As garantias de rigor continuam valendo lá porque os apps declaram `strict` por conta própria.

## Onde isso roda

`yarn check-types` a partir da raiz, via Turborepo, respeitando a ordem topológica.

Uma armadilha que vale saber: `check-types` verifica um pacote contra o `dist` construído das suas dependências. **Rode `yarn build` antes** — é a ordem que o CI usa. Fora dessa ordem, um pacote que depende do `@industry/tokens` falha com `Cannot find module '@industry/tokens'`, e o erro não parece o que é.
