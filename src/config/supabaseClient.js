/**
 * Cliente Supabase da aplicação.
 *
 * Depende de dois arquivos carregados ANTES deste, via <script> no index.html:
 *  1. A biblioteca @supabase/supabase-js (via CDN), que expõe `window.supabase`
 *  2. assets/js/config.js, que define `window.__SUPABASE_CONFIG__`
 *
 * Nesta etapa (Etapa 2), este arquivo só prepara o cliente e o deixa
 * disponível globalmente como `window.supabaseClient`. Ele ainda NÃO é
 * usado por nenhuma tela do CRM — as telas de login/cadastro e a troca do
 * localStorage pelo banco de dados serão feitas em uma próxima etapa.
 */
(function () {
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error(
      "[Supabase] Biblioteca @supabase/supabase-js não encontrada. " +
      "Confira se o <script> do CDN está incluído antes deste arquivo no index.html."
    );
    return;
  }

  const config = window.__SUPABASE_CONFIG__;
  if (!config || !config.url || !config.anonKey) {
    console.error(
      "[Supabase] Configuração ausente. Confira assets/js/config.js."
    );
    return;
  }

  window.supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  console.log("[Supabase] Cliente inicializado e pronto para uso nas próximas etapas.");
})();
