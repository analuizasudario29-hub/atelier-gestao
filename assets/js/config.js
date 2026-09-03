/**
 * Configuração pública de conexão com o Supabase.
 *
 * IMPORTANTE — por que estes valores podem ficar aqui, versionados no GitHub:
 * A "publishable key" (também chamada de "anon key") do Supabase é uma chave
 * PÚBLICA por design. Ela é protegida pelas políticas de Row Level Security
 * (RLS) configuradas no banco — ou seja, mesmo que alguém veja essa chave,
 * só consegue ler/gravar exatamente o que as políticas do banco permitirem
 * para aquele usuário. Isso é diferente da "service_role key", que é SECRETA
 * e NUNCA deve aparecer no frontend nem ser versionada.
 *
 * Este projeto ainda não usa um bundler/build tool, então não há como usar
 * variáveis de ambiente reais (tipo process.env) direto no navegador. Este
 * arquivo cumpre esse papel por enquanto. Quando o projeto migrar para um
 * build tool (Vite, por exemplo), estes valores podem vir de VITE_SUPABASE_URL
 * e VITE_SUPABASE_ANON_KEY (veja .env.example).
 */
window.__SUPABASE_CONFIG__ = {
  url: "https://aevonlnpvppmvtspmizk.supabase.co",
 anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFldm9ubG5wdnBwbXZ0c3BtaXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzOTQyODIsImV4cCI6MjEwMzk3MDI4Mn0.dtV3gMHpgASHALHNwHCmr9zDwyA20pBZjEcogetJ7TI"
};
