# Landing page pessoal (portfólio) — design

Data: 2026-11-23. Referências: o layout "Leo Carter" que o Carlos enviou (pílula de navegação, topo com foto e brilho azul, cartões de projetos, serviços, processo, sobre com experiência, dúvidas, chamada final e rodapé com o nome grande) e a foto dele.

**[Decidido]** é o que o Carlos disse ou aprovou. **[Escolha do autor]** pode ser revertido na leitura.

## Intenção

Um site pessoal que serve a dois públicos **[Decidido]**:

- **Clientes de freela**: pequenos negócios como os cinco sites que ele já fez. Precisam ver trabalhos reais e falar com ele sem atrito.
- **Recrutadores**: precisam ver a trajetória (PicPay, Caju, Somei) e chegar ao LinkedIn.

Ele substitui o portfólio atual em carlos-vuotto.vercel.app **[Decidido]**.

## Objetivos, limites e anti-objetivos

- **[Decidido]** O nome no site é **Carlos Vuotto**: barra do topo, rodapé, `<title>`, Open Graph e monograma "CV" do favicon.
- **[Decidido]** Sem seção de números ("500+ clientes", "1M+ horas") e sem depoimentos. Nada de número ou depoimento inventado em lugar nenhum do site.
- **[Decidido]** Contato do freela pelo WhatsApp; recrutador pelo LinkedIn; sem currículo para baixar.
- **[Decidido]** A foto entra depois, com o fundo recortado pelo Carlos. Até lá, o espaço dela fica reservado no topo e em "Sobre mim".
- **[Decidido]** Visual com o `@industry/web` (e `@industry/tokens`), documentado no Storybook.
- **[Escolha do autor]** Todo em português (o Carlos prefere português; os clientes de freela são brasileiros).
- **[Escolha do autor]** Sem formulário, sem analytics, sem cookies, sem nenhum dado de visitante guardado. O site é estático; o único "envio" é abrir o WhatsApp ou o LinkedIn.
- Anti-objetivo: parecer template. Os textos têm que soar como o Carlos e os projetos têm que ser os dele, com link para o site no ar.

## Abordagens

1. **[Decidido]** App novo `apps/web/portfolio` (`@app/portfolio`), no molde do finance-app: Vite, React 19, TypeScript, Jest. Visual montado com o `@industry/web`; o que faltar nasce no design system com teste, story e changeset. Conteúdo em arquivos tipados no app; sem servidor.
2. Estilos e componentes próprios dentro do app: mais rápido, mas contraria o pedido (DS com Storybook) e a regra do `CLAUDE.md`.
3. Construtor de sites ou CMS: traria servidor e painel que um site estático não precisa e sairia do monorepo.

## Conteúdo e seções **[Escolha do autor, salvo o marcado]**

Textos reaproveitados do site atual sempre que eram fatos dele; o resto é rascunho para o Carlos revisar.

```
[ CARLOS VUOTTO ·   Projetos  Serviços  Sobre  Dúvidas   (Vamos conversar ▸ WhatsApp) ]

 Olá! Sou o Carlos Vuotto,                                 ╭────────────╮
 construindo experiências digitais.                   │  foto (vaga│
 Sites, apps web e mobile e design systems,           │  reservada)│ brilho azul
 com React e React Native.                            ╰────────────╯
 [Vamos conversar]  [Ver projetos]

 Onde já trabalhei:  PicPay · Caju · Somei
 Projetos recentes:  5 cartões (captura do site, nome, tipo, link ↗)
 Serviços:           4 cartões com ícone
 Como eu trabalho:   4 etapas numeradas + faixa "Tem um projeto?" [Vamos conversar]
 Sobre mim:          foto + selo "Disponível para novos projetos" + LinkedIn/GitHub
                     | bio + stack em selos + experiência (empresa, descrição, período)
 Dúvidas frequentes: 5 perguntas em acordeão
 Chamada final:      "Tem um produto para tirar do papel?" [Vamos conversar]
 Rodapé:             nome grande, links das seções, LinkedIn/GitHub/WhatsApp, © ano
```

- **Topo:** título em duas linhas no tamanho de exibição (o mesmo `clamp` do login do finance-app), subtítulo e dois botões. Sem os selos de números da referência. A foto fica num círculo com brilho azul atrás. Sem foto, o círculo mostra só o brilho e um monograma "CV" discreto, decorativo.
- **Onde já trabalhei:** os nomes em texto, não logos, porque são informação real e não dependem de marca de terceiros.
- **Projetos** (com link real, abrindo em nova aba):

  | Projeto                 | Tipo                       | Site                           |
  | ----------------------- | -------------------------- | ------------------------------ |
  | Barbearia JB            | Barbearia                  | barbeariajb1.com               |
  | Kalliamma Musicoterapia | Saúde e bem-estar          | kalliammamusicoterapia.com.br  |
  | Wanog Advocacia         | Advocacia                  | wanogadv.vercel.app            |
  | Dra. Fernanda Nakabara  | Psiquiatria                | drafernandanakabara.vercel.app |
  | Mistura & Sabores       | Cooperativa de alimentação | misturaesabores.vercel.app     |

  Uma frase curta por projeto, tirada do próprio site. Capturas em 1280×800, geradas uma vez pelo Chrome headless e salvas em `public/projects/*.webp`.

- **Serviços:** "Sites & Landing Pages", "Aplicativos Web", "Aplicativos Mobile" e "Design Systems", com os textos do site atual.
- **Como eu trabalho:** as quatro etapas do site atual (Entender o produto, Estrutura & design, Desenvolvimento, Publicação & suporte), com número grande em gradiente, como na referência.
- **Sobre mim:**
  - bio de 3 a 4 linhas;
  - stack em selos (React, React Native, TypeScript, Next.js, Storybook, Jest, React Testing Library, Figma);
  - experiência:

    | Empresa | Período   | Descrição                                                                                     |
    | ------- | --------- | --------------------------------------------------------------------------------------------- |
    | Caju    | 2024–2026 | Três produtos da plataforma de benefícios, arquitetura frontend e ~95% de cobertura de testes |
    | PicPay  | 2021–2024 | Design system cross-platform (web & mobile), 50+ componentes                                  |
    | Somei   | 2019–2021 | Base mobile em React Native para iOS e Android em fluxos de e-commerce                        |

  "~95%" e "50+" ficam porque são fatos do currículo dele, não a seção de números da referência.

- **Dúvidas:** cinco perguntas com respostas rascunhadas:
  - "Que tipo de projeto você faz?"
  - "Você aceita freela e também vagas CLT/PJ?"
  - "Como funciona um projeto comigo?"
  - "Quanto tempo leva um site?"
  - "Como começamos?"

  Sem preço.

- **WhatsApp:** `https://wa.me/5511964561982?text=` com mensagem pronta ("Olá, Carlos! Vi seu portfólio e quero conversar sobre um projeto."). O número é o que já está público no site atual.
- **Links:** LinkedIn `linkedin.com/in/kaduvuotto`, GitHub `github.com/CarlosAmorimDeveloper`.
- **Responsivo:**
  - abaixo de 768px, tudo vira uma coluna;
  - a navegação mostra só o nome e o botão "Vamos conversar". As seções ficam acessíveis rolando a página e pelos links do rodapé.
- **SEO e compartilhamento:**
  - `<title>`, `meta description`, `lang="pt-BR"`, `theme-color`;
  - Open Graph com uma imagem estática do topo;
  - favicon com o monograma "CV".

## Design system (`@industry/web`, changeset minor) **[Escolha do autor]**

O `Accordion`, o `Card`, o `Badge`, o `Button`, o `IconBubble`, o `GradientSurface` e o `Icon` (lucide) já cobrem a maior parte. Faltam três peças:

1. **`BrandIcon`**: ícones de marca que o lucide não tem.
   - Props: `name: 'linkedin' | 'github' | 'whatsapp'`, `size` (mesma escala do `Icon`) e `aria-label` opcional (sem ele, é decorativo).
   - Desenhos em SVG próprio, de domínio público (Simple Icons, CC0), sempre na cor do texto em volta (`currentColor`).
2. **`TopNav`**: a barra em pílula do topo da referência.
   - Props: `brand: ReactNode`, `links: { label: string; href: string }[]`, `action?: ReactNode` e `collapsed?: boolean` (só marca e ação, para telas estreitas).
   - Superfície translúcida com `backdrop-filter` e borda suave, presa no topo ao rolar.
3. **`MediaCard`**: cartão com imagem no topo.
   - Props: `image: { src: string; alt: string }`, `kicker?`, `title`, `body?` e `href?`.
   - Com `href`, o cartão inteiro vira um link que abre em nova aba (`rel="noopener noreferrer"`) e mostra o ícone `arrow-up-right`.
   - A imagem tem proporção fixa de 16:10 e carrega com `loading="lazy"`.

Cada peça ganha teste, story e changeset. Nenhum token novo.

## App `apps/web/portfolio` **[Escolha do autor]**

- **Camadas** (mesma regra do `CLAUDE.md`):
  - `src/domain/`: tipos do conteúdo e `whatsappLink(phone, message): string`, função pura;
  - `src/content/`: os dados tipados de projetos, serviços, etapas, experiência, stack e dúvidas;
  - `src/sections/`: uma seção por arquivo;
  - `src/components/`: `Section` (título e subtítulo centrados) e `PhotoFrame` (círculo com brilho, que mostra a foto se `src` existir).
  - Não há `services/`: o site não fala com nenhum sistema externo.
- **Foto:** `public/carlos.webp` quando chegar. O caminho fica numa constante. Enquanto a foto não existe, `PhotoFrame` recebe `src` vazio e mostra o monograma.
- **Testes:** Jest + Testing Library, como no finance-app; cobertura ≥ 95% nos arquivos alterados.
- **CI:**
  - entrada `portfolio` no `coverage.yml`, excluindo `src/main.tsx` e `vite.config.ts`;
  - job no `web-apps.yml` com lint, tipos, testes e build, mais a trava de 200 arquivos.
- **Deploy:** workflow `deploy-portfolio.yml`, igual ao do finance-app (`vercel deploy --prebuilt --prod --archive=tgz`), publicando no projeto **existente** `carlos-vuotto` do Vercel. Assim o endereço continua o mesmo e os deploys antigos ficam no histórico para voltar atrás. O id do projeto entra como secret novo (`VERCEL_PROJECT_ID_PORTFOLIO`).
  - Estado do projeto `carlos-vuotto`, verificado em 2026-11-23:
    - está no mesmo escopo do Vercel do finance-app, então os secrets `VERCEL_ORG_ID` e `VERCEL_TOKEN` servem;
    - não está ligado a nenhum repositório Git (foi publicado pela CLI);
    - não tem domínio próprio além de `carlos-vuotto.vercel.app`.
  - **[Decidido]** O workflow roda a cada push no `main` que toque o app, o `@industry/web` ou o `@industry/tokens` (os mesmos `paths` do finance-app), além do disparo manual. O primeiro merge já publica o site, com os textos rascunhados e o monograma no lugar da foto; ajustes de texto e a foto entram em merges seguintes.
- **Documentação:** o `CLAUDE.md` (visão do monorepo e tabela de workflows) e a página de arquitetura no Notion ganham o app novo.

## Restrições

- **[Decidido]** Nomes em inglês: projeto, pastas, arquivos, componentes, funções, tipos, ids de conteúdo, imagens, workflow e secrets. Só o texto que o visitante lê é em português. Exemplos:

  | O quê    | Nome                                                                                                                    |
  | -------- | ----------------------------------------------------------------------------------------------------------------------- |
  | App      | `apps/web/portfolio`                                                                                                    |
  | Pacote   | `@app/portfolio`                                                                                                        |
  | Seções   | `src/sections/{Hero,Companies,Projects,Services,Process,About,Faq,ContactCta,Footer}.tsx`                               |
  | Conteúdo | `src/content/{projects,services,process,experience,stack,faq,contact}.ts`                                               |
  | Capturas | `public/projects/{jb-barbershop,kalliamma-music-therapy,wanog-law,fernanda-nakabara-psychiatry,mistura-e-sabores}.webp` |
  | Workflow | `deploy-portfolio.yml`                                                                                                  |
  | Secret   | `VERCEL_PROJECT_ID_PORTFOLIO`                                                                                           |

- Cor, espaçamento e raio só de tokens; nenhum hex no app (exceto em SVG estático e no `theme-color`, como no favicon do finance-app).
- Zero comentários, sem `any`, lint com `--max-warnings 0`.
- Contraste: texto ≥ 4,5:1 e texto grande ≥ 3:1 sobre o fundo atrás dele. Os textos pequenos não ficam sobre a parte clara do brilho.
- O build deve ficar abaixo de 200 arquivos, por causa do limite diário do Vercel Hobby.
- Commits em português, sem `Co-Authored-By`.

## Verificação

- Testes do DS e do app; lint, tipos e cobertura.
- Capturas do build de produção em 1280px e 390px, comparadas com a referência; sem rolagem horizontal em 390px.
- Todos os links reais abrem o destino certo: WhatsApp com mensagem pronta, LinkedIn, GitHub e os cinco sites.

## Deixado para quem implementa

Espaçamentos exatos, a mensagem pronta do WhatsApp, a frase de cada projeto e a ordem dos cartões.
