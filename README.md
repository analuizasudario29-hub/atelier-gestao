# Atelier — Gestão da Loja (CRM)

CRM da loja Atelier, construído em **HTML + CSS (Tailwind) + JavaScript (React 18)**,
rodando inteiramente no navegador, sem back-end. Todos os dados são persistidos em
`localStorage`.

Este repositório está na **Etapa 1** de um plano de evolução para transformar o CRM
em um produto SaaS. Nesta etapa, o objetivo foi **apenas organizar o projeto e
prepará-lo para o GitHub** — nenhuma funcionalidade nova foi adicionada e nenhum
comportamento existente foi alterado.

## Como rodar o projeto

Não é necessário build nem instalação de dependências. Basta servir a pasta como
um site estático:

```bash
# Opção 1: Python
python3 -m http.server 8000

# Opção 2: Node (npx)
npx serve .
```

Depois, abra `http://localhost:8000` no navegador.

> Abrir o `index.html` direto com duplo clique (`file://`) também funciona na
> maioria dos navegadores, já que não há chamadas de API externas.

## Estrutura do projeto

```
atelier-gestao/
├── index.html                 # Ponto de entrada da aplicação
├── .gitignore                 # Arquivos/segredos que não vão para o GitHub
├── .env.example                # Modelo de variáveis de ambiente (futuras etapas)
├── README.md
├── assets/
│   ├── css/
│   │   ├── tailwind.css       # CSS gerado pelo Tailwind (build original)
│   │   └── styles.css         # Estilos customizados (scrollbar, fontes, etc.)
│   ├── js/
│   │   ├── app.js             # Código da aplicação (componentes React do CRM)
│   │   └── vendor/
│   │       ├── react.production.min.js
│   │       └── react-dom.production.min.js
│   ├── images/                # Reservado para imagens futuras
│   ├── icons/                 # Reservado para ícones futuros
│   └── fonts/                 # Reservado para fontes locais futuras (se saírem do Google Fonts)
├── src/
│   └── config/                # Reservado para configuração de Supabase/Auth/Pagamento (próximas etapas)
└── docs/                      # Documentação adicional do projeto
```

### O que mudou em relação ao arquivo original

O projeto começou como um único arquivo `atelier-gestao.html` (~3.400 linhas) com
todo o CSS e JavaScript embutidos inline. Nesta etapa, o conteúdo foi **extraído
sem nenhuma modificação** para arquivos separados:

| Conteúdo original (inline) | Novo arquivo |
|---|---|
| 1º bloco `<style>` (CSS gerado pelo Tailwind) | `assets/css/tailwind.css` |
| 2º bloco `<style>` (estilos customizados) | `assets/css/styles.css` |
| 1º bloco `<script>` (biblioteca React) | `assets/js/vendor/react.production.min.js` |
| 2º bloco `<script>` (biblioteca ReactDOM) | `assets/js/vendor/react-dom.production.min.js` |
| 3º bloco `<script>` (código do CRM/componentes) | `assets/js/app.js` |

O `index.html` agora apenas referencia esses arquivos com `<link>` e `<script src>`,
mantendo exatamente o mesmo layout, identidade visual e funcionalidades.

Cada arquivo extraído foi conferido byte a byte contra o conteúdo original e o
app foi testado (renderização via DOM simulado) para confirmar que continua
funcionando de forma idêntica.

## Próximas etapas (ainda não implementadas)

Esta etapa **não** incluiu (propositalmente):

- Login / cadastro
- Login com Google
- Supabase / banco de dados
- Estrutura multi-tenant
- Pagamentos / assinatura mensal

A estrutura de pastas (`src/config/`, `.env.example`) já está preparada para
que essas integrações sejam adicionadas nas próximas etapas sem precisar
reorganizar o projeto novamente.

## Segurança

- Nenhuma credencial secreta está versionada neste repositório.
- O `.gitignore` já bloqueia arquivos `.env`, chaves e pastas de segredos.
- A única chave presente no código (`assets/js/config.js`) é a **publishable/anon
  key** do Supabase, que é pública por design e protegida pelas políticas de
  RLS do banco — ver seção abaixo.
  
---

## Etapa 2 — Supabase (banco de dados, multi-tenant e preparação de Auth)

### 1. Projeto Supabase conectado

- **Nome:** `atelier-gestao`
- **Região:** `sa-east-1` (São Paulo)
- **URL:** `https://aevonlnpvppmvtspmizk.supabase.co`
- A chave pública (anon/publishable) está em `assets/js/config.js` e a
  inicialização do cliente em `src/config/supabaseClient.js`.
- **Nenhuma tela do CRM usa o Supabase ainda** — só a infraestrutura de
  conexão foi preparada. O CRM continua 100% funcional com `localStorage`,
  exatamente como antes.

### 2. Tabelas criadas

| Tabela | O que guarda |
|---|---|
| `profiles` | Dados de perfil de cada usuário (nome, e-mail, avatar). As senhas ficam só no sistema interno do Supabase Auth (`auth.users`), nunca em uma tabela nossa. |
| `accounts` | Cada linha é uma empresa/cliente (tenant) do sistema. |
| `account_members` | Liga usuários a contas, com um papel (`owner`, `admin`, `member`). Um usuário pode pertencer a mais de uma conta. |
| `customers` | Clientes da loja (do CRM em si). |
| `products` | Produtos/itens vendidos, com preço, custo e quantidade em estoque. |
| `stock_movements` | Histórico de entradas/saídas/ajustes de estoque. |
| `sales` | Vendas realizadas. |
| `sale_items` | Itens de cada venda (liga `sales` a `products`). |
| `monthly_history` | Histórico mensal consolidado: faturamento, custo, lucro, nº de vendas, novos clientes. |

### 3. Como elas se relacionam (multi-tenant)

Toda tabela do CRM tem uma coluna `account_id`, que aponta para a empresa
dona daquele dado. É essa coluna, junto com as políticas de RLS, que garante
a separação entre clientes.

### 4. Separação entre clientes (regra de ouro do multi-tenant)

Um usuário só enxerga dados de contas às quais pertence (via `account_members`).
Isso é garantido **pelo próprio banco de dados**, não pela interface — ou seja,
mesmo que alguém tente acessar a API diretamente, o Postgres bloqueia.

### 5. Políticas de RLS criadas

RLS está **ativado em todas as 9 tabelas**. Resumo das políticas:

- **profiles:** cada usuário só lê/edita o próprio perfil.
- **accounts:** só membros veem a conta; só o dono (`owner_id`) edita ou exclui.
- **account_members:** só vê membros das próprias contas; só o dono da conta adiciona/remove membros.
- **customers, products, stock_movements, sales, monthly_history:** acesso liberado (leitura e escrita) apenas para quem pertence à `account_id` daquela linha.
- **sale_items:** mesma regra, verificada através da venda (`sales`) à qual pertence.

Toda a checagem usa uma função auxiliar `is_account_member(account_id)`, que
consulta se o usuário logado (`auth.uid()`) está em `account_members` para
aquela conta. Rodei também o verificador automático de segurança do Supabase
("Advisors") depois de aplicar tudo — sem alertas críticos.

### 6. Senhas e autenticação

- Nenhuma tabela própria guarda senha em texto — isso é proibido e não foi feito.
- As credenciais ficam inteiramente sob gestão do **Supabase Auth** (`auth.users`), que já cuida de hash de senha, tokens, sessões, etc.
- Um gatilho (`on_auth_user_created`) já está pronto: assim que alguém se cadastrar via Supabase Auth, um registro correspondente é criado automaticamente em `profiles`.
- **E-mail/senha:** o Supabase Auth já vem habilitado por padrão para isso — não precisa de configuração extra.
- **Login com Google:** precisa ser ativado manualmente no painel do Supabase (Authentication → Providers → Google), usando um Client ID e Client Secret gerados no Google Cloud Console. Isso é intencional: essas credenciais são secretas e não devem passar pelo código-fonte — ficam configuradas direto no painel do Supabase.
- Cadastro, login, logout e recuperação de senha (as telas em si) ainda não foram implementados no CRM — isso é o objetivo de uma próxima etapa.

### 7. O que ainda falta (próximas etapas)

- ~~Telas de cadastro, login, logout e recuperação de senha no CRM.~~ **Feito na Etapa 3.**
- ~~Ativar o provedor Google no painel do Supabase (Client ID/Secret).~~ **Configuração manual explicada na Etapa 3 — precisa ser feita por você.**
- Trocar o `localStorage` pelas chamadas reais ao Supabase (`customers`, `products`, `sales`, etc.) — os dados do CRM em si continuam no navegador por enquanto.
- Fluxo de edição/renomeação da conta/empresa (hoje ela é criada automaticamente com o nome do usuário).
- Pagamentos, assinatura mensal e bloqueio por inadimplência (fora do escopo desta etapa, como combinado).

---

## Etapa 3 — Login, cadastro, Google e proteção do CRM

### 1. Fluxo implementado

USUÁRIO → TELA DE LOGIN → SUPABASE AUTH → IDENTIFICAÇÃO DO USUÁRIO → CONTA/EMPRESA → CRM

O CRM não é mais acessível sem autenticação. Um novo arquivo,
`assets/js/auth-app.js`, decide o que aparece na tela:

- **Sem sessão válida** → tela de login (e-mail/senha, "Esqueci minha senha",
  "Criar conta", "Continuar com Google").
- **Com sessão válida** → o CRM original (`App()`, de `app.js`, sem nenhuma
  alteração interna), com uma barra fina no topo mostrando o e-mail logado e
  o botão "Sair".

### 2. Cadastro

Ao criar conta (nome, e-mail, senha, confirmação), o sistema:

1. Cria o usuário no Supabase Auth (`auth.users`).
2. Um gatilho do banco (já criado na Etapa 2) cria o `profile` automaticamente.
3. Assim que a sessão fica ativa (imediatamente, ou após confirmar o e-mail e
   fazer login — depende da configuração do seu projeto), o app cria a
   `account` (empresa) e o vínculo em `account_members` com papel `owner`,
   automaticamente, na primeira vez que o usuário entra.
4. A partir daí, o usuário tem acesso ao CRM.

> Hoje a conta/empresa é criada com o nome da pessoa (ex: "Empresa de Ana").
> Um fluxo para renomear a empresa fica para uma próxima etapa.

### 3. Login com Google

O botão "Continuar com Google" usa o fluxo oficial de OAuth do Supabase
(`signInWithOAuth`). O Supabase nunca vê nem armazena a senha do Google — ele
recebe apenas a confirmação de identidade do próprio Google. Se o e-mail do
Google já existir como usuário, ele entra na conta existente; se for novo, o
mesmo fluxo de criação automática de conta (item 2, passo 3) entra em ação.

**Importante:** por segurança, o Google exige credenciais (Client ID/Secret)
que não podem estar no código-fonte. Por isso, o provedor Google **ainda
precisa ser ativado manualmente** — veja o passo a passo mais abaixo.

### 4. Recuperação de senha

"Esqueci minha senha" envia um e-mail via Supabase Auth
(`resetPasswordForEmail`). Ao clicar no link do e-mail, a pessoa volta para o
site já autenticada em modo de recuperação, e uma tela própria
("Definir nova senha") aparece para ela escolher a nova senha
(`updateUser`).

### 5. Sessão

- **Login persistente:** o Supabase guarda a sessão no navegador; ao fechar e
  reabrir o site, a pessoa continua logada (até a sessão expirar ou fazer logout).
- **Logout:** botão "Sair" na barra superior, chama `signOut()`.
- **Verificação de sessão:** `auth-app.js` escuta mudanças de sessão em tempo
  real (`onAuthStateChange`) e sempre redireciona para a tela de login quando
  não há sessão válida.
- **Proteção do CRM:** o componente `App()` (o CRM) só é renderizado depois
  que existe uma sessão válida **e** a conta/empresa do usuário já foi
  identificada/criada.

### 6. Multi-tenant na prática

Depois do login, a conta (`account_id`) do usuário é identificada via
`account_members`. Essa identificação, junto com as políticas de RLS já
criadas na Etapa 2, é o que impede um cliente de acessar dados de outro —
tanto em qualquer chamada futura ao banco quanto nas tabelas já existentes
(`accounts`, `account_members`, `customers`, `products`, etc.).

**Importante sobre o CRM em si:** as telas de estoque, vendas, clientes, etc.
ainda leem e gravam no `localStorage` do navegador (não mudou nesta etapa).
Ou seja, a separação multi-tenant já está garantida na camada de conta/login/
banco de dados, mas os *dados do CRM* propriamente ditos só vão migrar do
`localStorage` para o Supabase (respeitando essa mesma separação) em uma
próxima etapa.

### 7. O que você precisa configurar manualmente

Estas etapas envolvem credenciais que não podem — e não devem — ficar no
código-fonte:

**No Supabase Dashboard (Authentication → URL Configuration):**
- Defina o **Site URL** para a URL do seu site (ex: a do GitHub Pages ou seu domínio final).
- Em **Redirect URLs**, adicione essa mesma URL (necessário para o login com Google e o link de recuperação de senha funcionarem corretamente).

**No Google Cloud Console + Supabase Dashboard (Authentication → Providers → Google), para ativar "Continuar com Google":**
1. No Google Cloud Console (console.cloud.google.com), crie/selecione um projeto.
2. Configure a tela de consentimento OAuth (OAuth consent screen).
3. Em "Credentials", crie um **OAuth Client ID** do tipo **Web application**.
4. Em **Authorized JavaScript origins**, adicione a URL do seu site.
5. Em **Authorized redirect URIs**, adicione exatamente:
   `https://aevonlnpvppmvtspmizk.supabase.co/auth/v1/callback`
6. Copie o **Client ID** e o **Client Secret** gerados.
7. No painel do Supabase, vá em Authentication → Providers → Google, ative o provedor e cole o Client ID e Client Secret ali (nunca no código).

Enquanto isso não for feito, o botão "Continuar com Google" aparece
normalmente, mas o login por e-mail/senha funciona já hoje sem precisar de
nenhuma configuração extra.

### 8. Testes realizados

Testei automaticamente (simulação de navegador) antes de considerar a etapa
concluída:

- Tela de login renderiza corretamente (e-mail, senha, "Esqueci minha senha", "Criar conta", "Continuar com Google").
- Login com e-mail/senha funciona e libera o CRM.
- Ao logar pela primeira vez, a conta/empresa é criada automaticamente e vinculada ao usuário (`accounts` + `account_members`).
- Logout funciona e volta para a tela de login.
- Alternância entre as telas de login, cadastro, "esqueci minha senha" e "definir nova senha" funciona.
- O CRM em si continua renderizando exatamente igual a antes.

Os testes que dependem de credenciais reais do Google e de dois usuários de
verdade (criar duas contas e confirmar que uma não vê os dados da outra)
precisam ser feitos por você, já em produção, seguindo o passo a passo que
combinamos na conversa.
