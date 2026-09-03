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

- Telas de cadastro, login, logout e recuperação de senha no CRM.
- Ativar o provedor Google no painel do Supabase (Client ID/Secret).
- Trocar o `localStorage` pelas chamadas reais ao Supabase (`customers`, `products`, `sales`, etc.).
- Fluxo de criação de conta/empresa (`accounts`) no primeiro acesso de um novo usuário.
- Pagamentos, assinatura mensal e bloqueio por inadimplência (fora do escopo desta etapa, como combinado).
