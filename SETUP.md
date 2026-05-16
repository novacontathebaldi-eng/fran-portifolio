# Setup: Arquitetura White-Label Template

Este repositório foi convertido para atuar como um **Template White-Label** para escritórios de arquitetura e design.
Siga os passos abaixo para instanciar um novo site/cliente a partir desta base.

## 1. Duplicação de Repositório
1. Clone este repositório base.
2. Altere o `name` e `description` no `package.json`.
3. Suba o código para um novo repositório isolado no GitHub pertencente ao cliente.

## 2. Configuração do Supabase
1. Crie um novo projeto no Supabase.
2. Replique a estrutura do banco (tabelas de perfis, projetos, etc).
3. **Storage:** Crie os buckets necessários: `projects`, `storage-Fran` (ou outro nome, mas ajuste os caminhos), `budget-attachments`, `avatars`, e `documents`.
4. **Edge Functions:** Implante as Edge Functions do diretório `supabase/functions`.
   - Lembre-se de configurar os secrets (`WUZAPI_URL`, `WUZAPI_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `OPENAI_API_KEY`, etc).
   - Se for usar servidor WuzAPI dedicado, ajuste as variáveis locais `VPS_RESTART_URL` e `WUZAPI_RESTART_SECRET`.

## 3. Ambiente Local (.env) e Vercel
Crie um arquivo `.env` com base no que for aplicável e adicione as mesmas chaves no projeto da Vercel:
```env
VITE_SUPABASE_URL=seu-novo-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-nova-anon-key

# Opcional: Variáveis para configuração de estáticos (injeta no index.html)
VITE_APP_TITLE=Nome do Escritório
VITE_APP_DESCRIPTION=Descrição curta
VITE_APP_AUTHOR=Nome do Profissional
VITE_APP_URL=https://seudominio.com.br

# Opcional: Chave do LocalStorage (Auth)
# Mantém os logins separados caso múltiplos sites rodem no mesmo domínio local
VITE_APP_STORAGE_KEY=nome-do-cliente-auth
```

## 4. Substituições Manuais de SEO (Arquivos Estáticos)
Atualmente, o projeto utiliza valores padrão hardcoded no `index.html` (ex: "Fran Siller Arquitetura") para evitar que placeholders quebrem caso o `.env` não seja configurado. Para uma indexação correta no Google e boa experiência de Progressive Web App (PWA), você **precisa** editar manualmente os seguintes arquivos estáticos:

1. **`index.html`**:
   - Edite diretamente as tags `<title>`, `<meta name="description">`, `og:title`, etc. com os dados do cliente, OU configure as variáveis `VITE_APP_*` no `.env` (se usar plugin vite-plugin-html).

2. **`public/manifest.json`**:
   - Atualize `name`, `short_name`, `description` e `theme_color`.
3. **`public/robots.txt`** (se aplicável):
   - Atualize o link do sitemap para apontar para o domínio correto do novo cliente.
4. **`public/sitemap.xml`**:
   - Troque as URLs base (`https://fransiller.com/` ou genéricas) para as URLs oficiais do novo site.
5. **Imagens de marcação/Favicon**:
   - Substitua os arquivos `public/favicon.ico`, `public/assets/icons/apple-touch-icon.png`, `og-image.png`, etc., com a marca do cliente.

## 5. Personalização via Painel Admin
Após o primeiro login via Admin:
1. Acesse `Configurações do Site`.
2. Configure **Identidade** (Nome do Site, Iniciais, URL da logo).
3. Configure **Tema** (Cores principais e de fundo).
4. As alterações refletirão imediatamente na interface, substituindo os fallbacks padrão (ex: "Escritório de Arquitetura", "FS").
