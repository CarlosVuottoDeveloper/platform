# AppointMate

**Um diário estruturado para levar à consulta.** Registra humor, sono, energia, apetite, concentração, medicação e notas livres entre uma sessão e outra de saúde mental — e exporta tudo em PDF na hora de sentar com o profissional.

Expo · React Native · Firebase · `@industry/mobile`

## O problema

Quem faz acompanhamento em saúde mental costuma chegar à consulta tentando reconstruir de memória as últimas semanas. O que aconteceu, quando, o remédio novo fez efeito — tudo comprimido em cinco minutos de conversa.

O AppointMate transforma isso em registro contínuo. O formulário é longo de propósito, salvável como rascunho a qualquer momento, e vira um PDF organizado por seções no fim.

## Funcionalidades

- **Formulário completo por consulta** — panorama geral com escala de humor, dia a dia (sono, energia, apetite, concentração), medicação em lista dinâmica com aderência e efeitos, o que foi bem, o que foi difícil, contexto, perguntas para levar e foco do dia
- **Rascunho sem fricção** — "Salvar rascunho" ignora a validação de propósito; só "Enviar" exige tudo preenchido
- **Histórico com filtro por período**
- **Exportação em PDF** — gerado localmente e entregue à folha de compartilhamento do sistema
- **Máscara de data e validação** — a data da consulta não pode ser retroativa; a da última consulta, por definição, pode
- **Login com e-mail/senha ou Google** — o Google entra via `@react-native-google-signin` e vira credencial do Firebase Auth; nenhuma coleção de usuários é criada, o app persiste só o que o próprio Auth armazena

## Privacidade — e por que ela define a arquitetura

Os dados aqui são **dado sensível de saúde** sob a LGPD (Lei 13.709/2018, Art. 5º II). Isso não é um aviso no rodapé, é o que dita várias decisões do app:

- **Cada documento é do seu dono, e só.** Toda operação exige `userId == auth.uid`, nas regras do Firestore. **Não há bypass de admin neste ruleset** — ninguém, nem eu, lê o formulário de outra pessoa
- **Lista de campos permitidos na escrita.** Um `hasOnly([...])` impede que qualquer campo fora do schema declarado entre no documento. `createdAt` e `userId` são imutáveis depois de criados
- **`read` também governa `list`.** Uma consulta ao `forms` sem filtro por `userId` é negada de saída, não filtrada depois
- **Nenhum SDK de analytics, telemetria ou crash reporting.** Nenhum terceiro além do Firebase vê esses dados
- **O PDF nunca sai pela rede.** É escrito no cache local e entregue à folha de compartilhamento do sistema — o destino é escolha do usuário no momento, não do app
- **Conteúdo de formulário nunca é logado.** Nem em debug. IDs e códigos de erro, só

As regras são testadas contra o **emulador real do Firestore**, não simuladas.

## Arquitetura

```
screens/  ──▶  services/  ──▶  domain/
```

- **`domain/`** — TypeScript puro. Validação de data, formatação, filtro de período, montagem do HTML do PDF. Sem React, sem Firebase, testável com zero mocks
- **`services/`** — o único lugar que fala com o Firebase
- **`screens/` e `components/`** — composição e apresentação
- **`context/AuthContext`** — a única fonte de estado transversal

O formulário usa `react-hook-form`, com as regras de validação no `Controller`, nunca à mão em handlers de `onChange`.

## Desenvolvimento

```sh
# da raiz do monorepo
yarn workspace @app/appointmate start

yarn workspace @app/appointmate test          # 243 testes
yarn workspace @app/appointmate lint          # --max-warnings 0
yarn workspace @app/appointmate check-types
yarn workspace @app/appointmate emulators     # emulador do Firestore
```

Precisa de um `.env` local com credenciais do Firebase e o _Web client ID_ OAuth do login com Google — veja o `.env.example`.

**O app não roda mais no Expo Go.** O login com Google exige código nativo, então o desenvolvimento usa um _development build_ (`expo-dev-client`):

```sh
yarn workspace @app/appointmate build:dev      # gera o APK de desenvolvimento no EAS
yarn workspace @app/appointmate start          # Metro, conectado ao dev build instalado
```

Para o login com Google funcionar no Android, o SHA-1 do keystore gerenciado pelo EAS (`eas credentials -p android`) precisa estar registrado no app Android do projeto Firebase, e o provedor Google habilitado em Authentication → Sign-in method. iOS ainda não está configurado para esse fluxo.

**Nota sobre testes:** desde a reformulação da estratégia de mocks, telas como `Home` e `FormEntry` renderizam o **`AuthProvider` de verdade** e mockam apenas `subscribeToAuthChanges`, na fronteira de serviço. Nenhum componente do próprio app é substituído por stub. Foi isso que expôs um bug latente: com o `useAuth` mockado, um teste capturava um listener de foco obsoleto e passava por acidente.

## Build

```sh
yarn workspace @app/appointmate build:android   # bump de versão + EAS build de produção
yarn workspace @app/appointmate build:preview
```

O `.firebaserc` aponta deliberadamente para o **emulador**, não para produção. Deploy real exige `--project <id>` explícito — não existe caminho acidental para a base de verdade.

## Stack

| Camada    | Tecnologia                                            |
| --------- | ----------------------------------------------------- |
| Framework | Expo SDK 57 · React Native 0.86 · New Architecture    |
| Linguagem | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess` |
| Estado    | Context API + `react-hook-form`                       |
| Backend   | Firebase Auth + Firestore                             |
| Interface | `@industry/mobile` + `@industry/tokens`               |
| PDF       | `expo-print` + `expo-sharing`                         |
| Testes    | Jest 30 + Testing Library + emulador do Firestore     |
