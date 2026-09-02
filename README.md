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

- Nenhuma credencial, chave ou token está versionado neste repositório.
- O arquivo `.env.example` mostra quais variáveis serão necessárias no futuro,
  mas não contém valores reais.
- O `.gitignore` já bloqueia arquivos `.env`, chaves e pastas de segredos.
