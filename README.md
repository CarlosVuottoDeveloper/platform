<div align="center">

# Platform

**Monorepo de produção com dois apps mobile na Google Play Store e um design system próprio, compartilhado entre React e React Native.**

[![TypeScript][typescript-shield]][typescript-url]
[![React Native][reactnative-shield]][reactnative-url]
[![Expo][expo-shield]][expo-url]
[![Firebase][firebase-shield]][firebase-url]
[![Turborepo][turborepo-shield]][turborepo-url]

[Storybook Web][sb-web] · [Storybook Mobile][sb-mobile]

</div>

---

## Sobre mim

Olá, sou o **Carlos Amorim** — Frontend Developer, React.js & React Native, focado em performance e UX.

Este repositório é onde eu levo essas ideias até o fim. Não é uma coleção de exercícios: são dois aplicativos reais, publicados, com dados de usuário de verdade — um deles lidando com informação sensível de saúde sob a LGPD — sustentados por um design system que eu projetei e implementei do zero, sem Material UI e sem React Native Paper.

O que eu tentei provar aqui:

- **Que consistência visual entre web e nativo é um problema de arquitetura, não de CSS.** Um único pacote de tokens alimenta dois design systems em plataformas que não compartilham nem motor de layout.
- **Que decisão de build merece o mesmo cuidado que código de produto.** O resolver do Metro deste monorepo existe porque quatro pacotes quebram em silêncio se resolverem para cópias diferentes — está documentado no ponto exato onde alguém tentaria "simplificar".
- **Que teste que não roda em CI não existe.** São 907 testes e um gate de cobertura de 95% por arquivo alterado.

[github.com/CarlosAmorimDeveloper](https://github.com/CarlosAmorimDeveloper)

---

## Índice

- [As aplicações](#as-aplicações)
- [O design system](#o-design-system)
- [Arquitetura](#arquitetura)
- [Qualidade](#qualidade)
- [Rodando localmente](#rodando-localmente)
- [Estrutura](#estrutura)
- [Stack](#stack)

## As aplicações

| App                                                  | Plataforma           | O que resolve                                                                                                                            |
| ---------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **[AppointMate](apps/mobile/appointmate/README.md)** | Expo / Android · iOS | Diário estruturado entre consultas de saúde mental: humor, sono, medicação e notas livres, exportáveis em PDF para levar ao profissional |
| **[Tickets App](apps/mobile/tickets-app/README.md)** | Expo / Android · iOS | Sistema de chamados multi-tenant por workspace, com papéis de admin e membro. Publicado na Play Store                                    |

Os dois compartilham as mesmas decisões de base — Firebase para auth e dados, React Navigation, `@industry/mobile` para a interface — e divergem exatamente onde o domínio pede: o AppointMate usa Context API e `react-hook-form` para um formulário longo de uma pessoa só; o Tickets App usa Zustand e um modelo de permissões por workspace.

## O design system

**Industry** é um sistema de blueprint sobre fundo escuro, com implementação própria nas duas plataformas.

| Pacote                                                                     | O que é                                                                                                                                                                           |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`@industry/tokens`](packages/design-system/industry/tokens/README.md)** | A fonte única de verdade. Rampas de cor em OKLCH, tipografia, espaçamento, elevação — exportadas como CSS custom properties para a web e como constantes resolvidas para o nativo |
| **[`@industry/web`](packages/design-system/industry/web/README.md)**       | 33 componentes React. Sem MUI, sem Emotion                                                                                                                                        |
| **[`@industry/mobile`](packages/design-system/industry/mobile/README.md)** | 35 componentes React Native. Sem React Native Paper                                                                                                                               |

O ponto interessante não são os componentes, é a fronteira entre eles. React Native não resolve `oklch()` nem `color-mix()` em tempo de execução, então os mesmos valores de origem passam por um gerador que os resolve para hex e rgba concretos. Uma mudança de token é uma mudança nas duas plataformas ao mesmo tempo — por construção, não por disciplina.

Ambos publicam Storybook a cada push: [web][sb-web] · [mobile][sb-mobile], com regressão visual no Chromatic.

## Arquitetura

Todo app aqui segue a mesma separação, e as dependências apontam para dentro:

```
screens/  ──▶  services/  ──▶  domain/
   │                              ▲
   └──────────────────────────────┘

domain/    TypeScript puro. Sem React, sem Firebase. Testável com zero mocks
services/  O único lugar que fala com Firebase
screens/   Composição e apresentação
```

Regra de teste que vem junto: o mock fica na **fronteira de serviço** ou externa — Firebase, `expo-*`. Nunca um provider ou componente do próprio app. Renderizar o provider de verdade foi o que revelou um bug latente no AppointMate, onde um teste capturava um listener obsoleto e passava por acidente.

A arquitetura completa — incluindo as regras de segurança do Firestore, os índices compostos e as armadilhas de build — vive em um documento à parte, referenciado pelo [`CLAUDE.md`](CLAUDE.md).

## Qualidade

|                         |                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| **907 testes**          | 238 tickets-app · 225 appointmate · 289 `@industry/mobile` · 155 `@industry/web`                      |
| **Cobertura**           | Gate de 95% em linhas, statements, funções e branches — aplicado só aos arquivos alterados em cada PR |
| **Regras de segurança** | Testadas contra o emulador real do Firestore, não simuladas                                           |
| **Lint**                | `--max-warnings 0`. Todo aviso quebra o build                                                         |
| **Regressão visual**    | Chromatic nos dois Storybooks                                                                         |

Um exemplo do que esse rigor pega: os testes das regras do Firestore do Tickets App expuseram uma escalada de privilégio real — qualquer usuário autenticado conseguia se promover a admin e entrar em qualquer workspace cujo ID conhecesse. Corrigido, testado e publicado em produção.

## Rodando localmente

**Yarn v1 é obrigatório.** O lockfile e a resolução de workspaces são específicos dele; `npm` e `pnpm` quebram o monorepo.

```sh
yarn install                              # instala todos os workspaces de uma vez
yarn build                                # respeita a ordem topológica do Turborepo
yarn workspace @app/appointmate start     # ou @app/tickets
```

Storybook, por pacote:

```sh
yarn workspace @industry/web storybook     # :6010
yarn workspace @industry/mobile storybook  # :6011
```

Cada app mobile precisa do próprio `.env` com credenciais do Firebase — veja o `.env.example` de cada um.

## Estrutura

```
platform/
├── apps/mobile/
│   ├── appointmate/        # Expo — diário de saúde mental (LGPD)
│   └── tickets-app/        # Expo — chamados multi-tenant (Play Store)
├── packages/
│   ├── design-system/industry/
│   │   ├── tokens/         # @industry/tokens — a fonte de verdade
│   │   ├── web/            # @industry/web — componentes React
│   │   └── mobile/         # @industry/mobile — componentes React Native
│   ├── eslint-config/      # @repo/eslint-config
│   └── typescript-config/  # @repo/typescript-config
└── .github/workflows/      # 9 workflows: testes, cobertura, Chromatic, Vercel
```

## Stack

| Camada        | Tecnologia                                                          |
| ------------- | ------------------------------------------------------------------- |
| Monorepo      | Turborepo + Yarn Workspaces v1                                      |
| Mobile        | Expo SDK 57 · React Native 0.86 · React 19.2                        |
| Backend       | Firebase Auth + Firestore                                           |
| Estado        | Zustand (Tickets App) · Context API + react-hook-form (AppointMate) |
| Design System | `@industry/tokens` · `@industry/web` · `@industry/mobile`           |
| Testes        | Jest 30 + Testing Library · emulador do Firestore                   |
| Visual        | Storybook 8 + Chromatic, publicados no Vercel                       |
| Linguagem     | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess`               |

---

## Licença

Uso interno — código aberto para leitura, sem licença de reuso.

[typescript-shield]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org
[reactnative-shield]: https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[reactnative-url]: https://reactnative.dev
[expo-shield]: https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white
[expo-url]: https://expo.dev
[firebase-shield]: https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black
[firebase-url]: https://firebase.google.com
[turborepo-shield]: https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white
[turborepo-url]: https://turborepo.dev
[sb-web]: https://industry-web-ds.vercel.app
[sb-mobile]: https://industry-mobile-ds.vercel.app
