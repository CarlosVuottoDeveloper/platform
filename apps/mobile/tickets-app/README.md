# Tickets App

**Sistema de chamados multi-tenant, publicado na Google Play Store.** Cada empresa vive no seu próprio workspace, com papéis de admin e membro, e nenhum dado atravessa essa fronteira.

Expo · React Native · Firebase · Zustand · `@industry/mobile`

## Multi-tenancy: o modelo

Tudo pende de um workspace:

```
workspaces/{workspaceId}/tickets/{ticketId}/comments/{commentId}
users/{userId}  →  { role: 'admin' | 'member', workspace_id }
```

| Papel      | O que vê                                                | O que pode                                                              |
| ---------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Admin**  | Todos os chamados do workspace                          | Criar usuários, designar responsáveis, editar e apagar qualquer chamado |
| **Membro** | Os chamados que criou **e** os que lhe foram designados | Criar chamados e comentar                                               |

Aquele "**e** os que lhe foram designados" corrigiu um furo real: antes, um membro nunca via um chamado que um admin tivesse designado para ele.

## Funcionalidades

- **Dashboard** com contagem por status, gráfico de pizza e os chamados recentes
- **Chamados** com status, prioridade, responsável e comentários
- **Gestão de usuários** — admin convida membros para o próprio workspace
- **Registro cria workspace** — quem se registra vira admin de um workspace novo
- **Filtro por status** navegável a partir dos cartões do dashboard

## Segurança

As regras do Firestore são a única camada de controle de acesso, e são testadas contra o **emulador real** — 47 testes só nesse arquivo.

Vale registrar por que isso importa. Quando essa cobertura foi escrita, ela expôs uma **escalada de privilégio real em produção**: a regra de escrita em `users/{userId}` deixava qualquer usuário autenticado gravar qualquer campo do próprio documento de perfil — inclusive `role` e `workspace_id`. Na prática: promover-se a admin e entrar em qualquer workspace cujo ID conhecesse, com leitura e escrita completas sobre os chamados de lá. Um segundo furo deixava qualquer membro, não só admin, alterar ou apagar o documento do workspace.

Os dois foram corrigidos, testados e publicados em produção, com verificação depois do deploy. Hoje:

- `create` em `users` só permite auto-registro como admin de um workspace que **ainda não existe**, ou um admin convidando membro para o **próprio** workspace
- `update` só permite editar o próprio `name`, ou um admin editando membros do próprio workspace
- `update` e `delete` em `workspaces` exigem `isAdmin()`

O `.firebaserc` aponta deliberadamente para o emulador. Deploy em produção exige `--project <id>` explícito.

## Arquitetura

```
screens/  ──▶  hooks/  ──▶  services/  ──▶  domain/
```

- **`domain/`** — TypeScript puro: modelo de chamado e usuário, formatação, validação. Zero mocks para testar
- **`services/`** — o único lugar que fala com o Firebase. `createUser` sobe uma **instância secundária** do Firebase de propósito, para criar um usuário sem derrubar a sessão do admin que está criando
- **`hooks/`** — `useTicketList`, `useTicketDetails`, `useUserList` encapsulam assinatura e estado
- **`store/useAuthStore`** — Zustand, a única fonte de estado transversal. O estado de auth **não** é cacheado: é re-derivado de `onAuthStateChanged` a cada abertura do app, que também busca o documento do usuário para papel e workspace

## Desenvolvimento

```sh
# da raiz do monorepo
yarn workspace @app/tickets start

yarn workspace @app/tickets test        # 238 testes
yarn workspace @app/tickets test:rules  # regras contra o emulador
yarn workspace @app/tickets lint        # --max-warnings 0
yarn workspace @app/tickets check-types
```

Precisa de um `.env` local com credenciais do Firebase — veja o `.env.example`.

## Build e publicação

```sh
yarn workspace @app/tickets build:android   # EAS build de produção
yarn workspace @app/tickets build:preview
```

O bump de versão vive no `app.json` (`version` e `android.versionCode`, este último único por upload no Play Console) e entra numa branch `chore/` como qualquer outra mudança. O `eas build` compila a partir da árvore local, sem precisar do PR mergeado.

**`eas submit` não está configurado** — não há service account key do Google Play neste projeto EAS. Até que haja, subir o `.aab` para o Play Console é passo manual.

## Stack

| Camada    | Tecnologia                                            |
| --------- | ----------------------------------------------------- |
| Framework | Expo SDK 57 · React Native 0.86 · New Architecture    |
| Linguagem | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess` |
| Estado    | Zustand 5                                             |
| Backend   | Firebase Auth + Firestore                             |
| Navegação | React Navigation 7 (native-stack)                     |
| Interface | `@industry/mobile` + `@industry/tokens`               |
| Animação  | Reanimated 4 + Worklets                               |
| Testes    | Jest 30 + Testing Library + emulador do Firestore     |
