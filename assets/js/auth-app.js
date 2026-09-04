/**
 * auth-app.js — Etapa 3
 *
 * Este arquivo NAO reconstroi o CRM. Ele so decide o que aparece na tela:
 *  - Sem sessao valida  -> telas de login / cadastro / recuperacao de senha
 *  - Com sessao valida  -> o CRM original (funcao App(), de app.js), com uma
 *    barrinha fina no topo mostrando o e-mail logado e o botao "Sair"
 *
 * Reaproveita os componentes visuais que ja existem em app.js (GoldButton,
 * GhostButton, Field, TextInput, Card, Icon) e os tokens de cor (GOLD, INK,
 * PANEL, etc.) para manter a mesma identidade visual do CRM. Como app.js e
 * este arquivo sao carregados como <script> classicos (nao modulos), eles
 * compartilham o mesmo escopo global — por isso da para usar essas funcoes
 * aqui sem reimportar nada.
 */

/* ============================================================
   TEXTOS DE ERRO DO SUPABASE TRADUZIDOS PARA PT-BR
   ============================================================ */
function translateAuthError(error) {
  const msg = (error && error.message) || "";
  const map = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "User already registered": "Este e-mail ja esta cadastrado. Tente entrar ou recuperar a senha.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
    "Password should be at least 6 characters": "A senha precisa ter pelo menos 6 caracteres.",
    "Unable to validate email address: invalid format": "Digite um e-mail valido.",
    "For security purposes, you can only request this after": "Aguarde um pouco antes de tentar de novo, por seguranca.",
    "signups not allowed for this instance": "Cadastro desabilitado neste momento."
  };
  for (const key in map) {
    if (msg.includes(key)) return map[key];
  }
  return msg || "Algo deu errado. Tente novamente.";
}

/* ============================================================
   MULTI-TENANT: garante que o usuario logado tenha uma conta/empresa
   ============================================================ */
async function ensureAccountForUser(user) {
  const client = window.supabaseClient;
  const { data, error } = await client.rpc("ensure_account_for_current_user");
  if (error) throw error;
  return data;
}

/* ============================================================
   COMPONENTES VISUAIS
   ============================================================ */
function GoogleIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: 16,
    height: 16,
    viewBox: "0 0 18 18"
  },
    React.createElement("path", { fill: "#4285F4", d: "M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z" }),
    React.createElement("path", { fill: "#34A853", d: "M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" }),
    React.createElement("path", { fill: "#FBBC05", d: "M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" }),
    React.createElement("path", { fill: "#EA4335", d: "M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" })
  );
}

function AuthShell({ children }) {
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full min-h-screen flex items-center justify-center px-4",
    style: { background: INK, fontFamily: '"Inter", sans-serif' }
  },
    React.createElement("div", { className: "w-full", style: { maxWidth: "380px" } },
      React.createElement("div", { className: "flex flex-col items-center gap-2 mb-6" },
        React.createElement("div", {
          className: "w-8 h-8 rounded-full flex items-center justify-center text-xs",
          style: { border: `1px solid ${GOLD}`, color: GOLD, fontWeight: 600 }
        }, "A"),
        React.createElement("span", {
          className: "text-xs uppercase",
          style: { color: MUTED, letterSpacing: "0.25em" }
        }, "Atelier — Gestao da Loja")
      ),
      React.createElement(Card, { className: "p-6" }, children)
    )
  );
}

function LoadingScreen(message, isError) {
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full min-h-screen flex items-center justify-center",
    style: { background: INK }
  },
    React.createElement("div", { className: "flex flex-col items-center gap-3 text-center", style: { padding: "0 24px" } },
      !isError && React.createElement(Icon, { name: "loader", size: 26, className: "spin", style: { color: GOLD } }),
      React.createElement("span", {
        className: "text-xs uppercase",
        style: { color: isError ? RED : MUTED, letterSpacing: "0.2em" }
      }, message)
    )
  );
}

function AuthMessage({ error, info }) {
  if (!error && !info) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "text-xs px-3 py-2 rounded-sm mb-4",
    style: {
      background: error ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
      border: `1px solid ${error ? "#5a2a2a" : "#1f4f33"}`,
      color: error ? RED : GREEN
    }
  }, error || info);
}

function GoogleButton({ onClick, disabled }) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    disabled: disabled,
    className: "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
    style: { background: "#f0ede2", color: "#1c1b18" }
  }, React.createElement(GoogleIcon), "Continuar com Google");
}

function LoginView({ onSignup, onForgot }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) setError(translateAuthError(error));
  }

  async function handleGoogle() {
    setError("");
    const { error } = await window.supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) setError(translateAuthError(error));
  }

  return /*#__PURE__*/React.createElement("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4" },
    React.createElement("h1", { className: "text-lg text-center mb-1", style: { color: "#f0ede2", fontWeight: 600 } }, "Entrar"),
    React.createElement(AuthMessage, { error }),
    React.createElement(Field, { label: "E-mail" },
      React.createElement(TextInput, { type: "email", required: true, value: email, onChange: e => setEmail(e.target.value), placeholder: "voce@email.com" })
    ),
    React.createElement(Field, { label: "Senha" },
      React.createElement(TextInput, { type: "password", required: true, value: senha, onChange: e => setSenha(e.target.value), placeholder: "********" })
    ),
    React.createElement("button", {
      type: "button",
      onClick: onForgot,
      className: "text-xs text-left",
      style: { color: MUTED, marginTop: "-8px" }
    }, "Esqueci minha senha"),
    React.createElement(GoldButton, { type: "submit", disabled: loading, className: "w-full justify-center" },
      loading ? React.createElement(Icon, { name: "loader", size: 14, className: "spin" }) : null,
      loading ? "Entrando…" : "Entrar"
    ),
    React.createElement("div", { className: "flex items-center gap-3", style: { margin: "4px 0" } },
      React.createElement("div", { className: "flex-1", style: { height: 1, background: LINE } }),
      React.createElement("span", { style: { color: MUTED, fontSize: "11px" } }, "ou"),
      React.createElement("div", { className: "flex-1", style: { height: 1, background: LINE } })
    ),
    React.createElement(GoogleButton, { onClick: handleGoogle }),
    React.createElement("p", { className: "text-xs text-center mt-2", style: { color: MUTED } },
      "Nao tem conta? ",
      React.createElement("button", { type: "button", onClick: onSignup, style: { color: GOLD_SOFT }, className: "font-medium" }, "Criar conta")
    )
  );
}

function SignupView({ onSwitch }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!nome.trim()) { setError("Digite seu nome."); return; }
    if (senha !== confirmar) { setError("As senhas nao coincidem."); return; }
    if (senha.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return; }

    setLoading(true);
    const { data, error } = await window.supabaseClient.auth.signUp({
      email,
      password: senha,
      options: { data: { full_name: nome } }
    });
    setLoading(false);

    if (error) { setError(translateAuthError(error)); return; }

    if (!data.session) {
      setInfo(`Enviamos um e-mail de confirmacao para ${email}. Confirme para poder entrar.`);
    }
  }

  return /*#__PURE__*/React.createElement("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4" },
    React.createElement("h1", { className: "text-lg text-center mb-1", style: { color: "#f0ede2", fontWeight: 600 } }, "Criar conta"),
    React.createElement(AuthMessage, { error, info }),
    React.createElement(Field, { label: "Nome" },
      React.createElement(TextInput, { required: true, value: nome, onChange: e => setNome(e.target.value), placeholder: "Seu nome" })
    ),
    React.createElement(Field, { label: "E-mail" },
      React.createElement(TextInput, { type: "email", required: true, value: email, onChange: e => setEmail(e.target.value), placeholder: "voce@email.com" })
    ),
    React.createElement(Field, { label: "Senha" },
      React.createElement(TextInput, { type: "password", required: true, value: senha, onChange: e => setSenha(e.target.value), placeholder: "Minimo 6 caracteres" })
    ),
    React.createElement(Field, { label: "Confirmar senha" },
      React.createElement(TextInput, { type: "password", required: true, value: confirmar, onChange: e => setConfirmar(e.target.value), placeholder: "Repita a senha" })
    ),
    React.createElement(GoldButton, { type: "submit", disabled: loading, className: "w-full justify-center" },
      loading ? React.createElement(Icon, { name: "loader", size: 14, className: "spin" }) : null,
      loading ? "Criando…" : "Criar conta"
    ),
    React.createElement("p", { className: "text-xs text-center mt-2", style: { color: MUTED } },
      "Ja tem conta? ",
      React.createElement("button", { type: "button", onClick: onSwitch, style: { color: GOLD_SOFT }, className: "font-medium" }, "Entrar")
    )
  );
}

function ForgotPasswordView({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });
    setLoading(false);
    if (error) { setError(translateAuthError(error)); return; }
    setInfo("Se esse e-mail estiver cadastrado, enviamos um link de recuperacao.");
  }

  return /*#__PURE__*/React.createElement("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4" },
    React.createElement("h1", { className: "text-lg text-center mb-1", style: { color: "#f0ede2", fontWeight: 600 } }, "Recuperar senha"),
    React.createElement(AuthMessage, { error, info }),
    React.createElement(Field, { label: "E-mail" },
      React.createElement(TextInput, { type: "email", required: true, value: email, onChange: e => setEmail(e.target.value), placeholder: "voce@email.com" })
    ),
    React.createElement(GoldButton, { type: "submit", disabled: loading, className: "w-full justify-center" },
      loading ? React.createElement(Icon, { name: "loader", size: 14, className: "spin" }) : null,
      loading ? "Enviando…" : "Enviar link de recuperacao"
    ),
    React.createElement("button", {
      type: "button",
      onClick: onBack,
      className: "text-xs text-center",
      style: { color: MUTED, marginTop: "4px" }
    }, "Voltar para o login")
  );
}

function ResetPasswordView() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (senha !== confirmar) { setError("As senhas nao coincidem."); return; }
    if (senha.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    const { error } = await window.supabaseClient.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) { setError(translateAuthError(error)); return; }
    setInfo("Senha atualizada! Redirecionando…");
    setTimeout(() => window.location.reload(), 1500);
  }

  return /*#__PURE__*/React.createElement("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4" },
    React.createElement("h1", { className: "text-lg text-center mb-1", style: { color: "#f0ede2", fontWeight: 600 } }, "Definir nova senha"),
    React.createElement(AuthMessage, { error, info }),
    React.createElement(Field, { label: "Nova senha" },
      React.createElement(TextInput, { type: "password", required: true, value: senha, onChange: e => setSenha(e.target.value), placeholder: "Minimo 6 caracteres" })
    ),
    React.createElement(Field, { label: "Confirmar nova senha" },
      React.createElement(TextInput, { type: "password", required: true, value: confirmar, onChange: e => setConfirmar(e.target.value), placeholder: "Repita a senha" })
    ),
    React.createElement(GoldButton, { type: "submit", disabled: loading, className: "w-full justify-center" },
      loading ? React.createElement(Icon, { name: "loader", size: 14, className: "spin" }) : null,
      loading ? "Salvando…" : "Salvar nova senha"
    )
  );
}

function planStatusLabel(accountStatus) {
  if (!accountStatus) return "";
  if (accountStatus.is_exempt) return "Conta isenta";
  const map = {
    trialing: "Período de teste",
    active: "Assinatura ativa",
    pending: "Pagamento pendente",
    paused: "Assinatura pausada",
    canceled: "Assinatura cancelada",
    expired: "Assinatura expirada"
  };
  return map[accountStatus.subscription_status] || "Sem assinatura";
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const diffMs = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function SubscriptionPanel({ accountStatus, onClose }) {
  const days = daysUntil(accountStatus && accountStatus.current_period_end);
  return /*#__PURE__*/React.createElement("div", {
    className: "absolute z-50 rounded-sm p-4 text-xs",
    style: { right: "16px", top: "40px", width: "320px", background: PANEL, border: `1px solid ${LINE}`, color: MUTED, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }
  },
    React.createElement("div", { className: "flex items-center justify-between mb-3" },
      React.createElement("span", { style: { color: "#e7e3d6", fontWeight: 600 } }, "Minha assinatura"),
      React.createElement("button", { onClick: onClose, style: { color: MUTED } }, "✕")
    ),
    React.createElement("div", { className: "flex flex-col gap-1.5" },
      React.createElement("div", null, "Conta: ", React.createElement("strong", { style: { color: "#d8d4c8" } }, accountStatus?.account_name || "—")),
      React.createElement("div", null, "Plano: ", React.createElement("strong", { style: { color: "#d8d4c8" } }, accountStatus?.plan_name || "—")),
      React.createElement("div", null, "Status: ", React.createElement("strong", { style: { color: accountStatus?.has_access ? GREEN : RED } }, planStatusLabel(accountStatus))),
      !accountStatus?.is_exempt && accountStatus?.current_period_end && React.createElement("div", null,
        accountStatus.subscription_status === "trialing" ? "Teste termina em: " : "Próxima renovação: ",
        React.createElement("strong", { style: { color: "#d8d4c8" } },
          new Date(accountStatus.current_period_end).toLocaleDateString("pt-BR"),
          days !== null && days >= 0 ? ` (${days} dia${days === 1 ? "" : "s"})` : ""
        )
      )
    ),
    accountStatus?.is_exempt && React.createElement(AdminActivatePanel)
  );
}

function UserBar({ email, onLogout, accountStatus }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  async function handleClick() {
    setLoggingOut(true);
    await onLogout();
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full flex items-center justify-between px-4 py-1.5 text-xs relative",
    style: { background: PANEL2, borderBottom: `1px solid ${LINE}`, color: MUTED }
  },
    React.createElement("span", null, "Conectado como ", React.createElement("strong", { style: { color: "#d8d4c8" } }, email)),
    React.createElement("div", { className: "flex items-center gap-3" },
      accountStatus && React.createElement("button", {
        onClick: () => setShowPanel(v => !v),
        className: "px-2 py-0.5 rounded-sm",
        style: { border: `1px solid ${LINE}`, color: accountStatus.has_access ? GREEN : RED }
      }, planStatusLabel(accountStatus)),
      React.createElement("button", {
        onClick: handleClick,
        style: {
          padding: "4px 10px",
          fontSize: "11px",
          borderRadius: "2px",
          border: `1px solid ${LINE}`,
          color: "#d8d4c8",
          background: "transparent"
        }
      }, loggingOut ? "Saindo…" : "Sair")
    ),
    showPanel && React.createElement(SubscriptionPanel, { accountStatus, onClose: () => setShowPanel(false) })
  );
}

function daysLabel(dateString) {
  const d = daysUntil(dateString);
  if (d === null) return "—";
  if (d < 0) return "vencido";
  if (d === 0) return "vence hoje";
  return `${d} dia${d === 1 ? "" : "s"}`;
}

function AdminCustomerList({ refreshKey }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    window.supabaseClient.rpc("admin_list_customers").then(({ data, error }) => {
      if (!mounted) return;
      setLoading(false);
      if (error) { setError(error.message); return; }
      setCustomers((data || []).filter(c => !c.is_exempt));
    });
    return () => { mounted = false; };
  }, [refreshKey]);

  if (loading) {
    return React.createElement("div", { className: "text-xs", style: { color: MUTED } }, "Carregando clientes…");
  }
  if (error) {
    return React.createElement(AuthMessage, { error });
  }
  if (customers.length === 0) {
    return React.createElement("div", { className: "text-xs", style: { color: MUTED } }, "Nenhum cliente cadastrado ainda.");
  }

  return /*#__PURE__*/React.createElement("div", { className: "flex flex-col gap-2", style: { maxHeight: "220px", overflowY: "auto" } },
    customers.map(c => React.createElement("div", {
      key: c.account_id,
      className: "flex items-center justify-between px-2 py-1.5 rounded-sm",
      style: { background: PANEL2, border: `1px solid ${LINE}` }
    },
      React.createElement("div", { style: { minWidth: 0 } },
        React.createElement("div", { style: { color: "#d8d4c8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, c.account_name),
        React.createElement("div", { style: { color: MUTED, fontSize: "10px" } }, c.owner_email)
      ),
      React.createElement("div", {
        style: { color: c.has_access ? GREEN : RED, fontSize: "10px", whiteSpace: "nowrap", marginLeft: "8px" }
      }, daysLabel(c.current_period_end))
    ))
  );
}

function AdminActivatePanel() {
  const [email, setEmail] = useState("");
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showList, setShowList] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleActivate(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { data, error } = await window.supabaseClient.rpc("admin_activate_subscription", {
      p_customer_email: email.trim(),
      p_days: parseInt(days, 10) || 30
    });
    setLoading(false);
    if (error) {
      setError(error.message.includes("customer_not_found")
        ? "Não encontrei nenhuma conta com esse e-mail."
        : "Não foi possível ativar agora: " + error.message);
      return;
    }
    const row = data && data[0];
    setMessage(row
      ? `Ativado! ${row.out_account_name} tem acesso até ${new Date(row.out_new_period_end).toLocaleDateString("pt-BR")}.`
      : "Ativado!");
    setEmail("");
    setRefreshKey(k => k + 1);
  }

  return /*#__PURE__*/React.createElement("div", { style: { marginTop: "8px" } },
    React.createElement("form", { onSubmit: handleActivate, className: "flex flex-col gap-3 text-xs" },
      React.createElement("div", { style: { color: "#e7e3d6", fontWeight: 600 } }, "Ativar cliente manualmente"),
      React.createElement(AuthMessage, { error, info: message }),
      React.createElement(Field, { label: "E-mail do cliente (o que ele usou pra criar conta)" },
        React.createElement(TextInput, { type: "email", required: true, value: email, onChange: e => setEmail(e.target.value), placeholder: "cliente@email.com" })
      ),
      React.createElement(Field, { label: "Dias de acesso" },
        React.createElement(TextInput, { type: "number", min: 1, value: days, onChange: e => setDays(e.target.value) })
      ),
      React.createElement(GoldButton, { type: "submit", disabled: loading, className: "w-full justify-center" },
        loading ? React.createElement(Icon, { name: "loader", size: 14, className: "spin" }) : null,
        loading ? "Ativando…" : "Ativar acesso"
      )
    ),
    React.createElement("button", {
      type: "button",
      onClick: () => setShowList(v => !v),
      className: "text-xs w-full text-center",
      style: { color: GOLD_SOFT, marginTop: "10px", marginBottom: "6px" }
    }, showList ? "Esconder lista de clientes" : "Ver todos os clientes"),
    showList && React.createElement(AdminCustomerList, { refreshKey })
  );
}

function SubscriptionBlockedScreen({ accountStatus, onLogout }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await onLogout();
  }

  const statusMessages = {
    pending: "O pagamento da sua assinatura está pendente. Entre em contato para regularizar.",
    paused: "Sua assinatura está pausada. Entre em contato para reativar.",
    canceled: "Sua assinatura foi cancelada. Entre em contato para assinar novamente.",
    expired: "Seu período de teste ou assinatura expirou. Entre em contato para continuar usando o CRM."
  };
  const message = statusMessages[accountStatus?.subscription_status] ||
    "Sua conta não tem uma assinatura ativa no momento.";

  return /*#__PURE__*/React.createElement(AuthShell, null,
    React.createElement("div", { className: "flex flex-col gap-4 text-center" },
      React.createElement("h1", { className: "text-lg", style: { color: "#f0ede2", fontWeight: 600 } }, "Assinatura necessária"),
      React.createElement("p", { className: "text-sm", style: { color: MUTED } }, message),
      React.createElement("div", {
        className: "text-xs px-3 py-2 rounded-sm text-left",
        style: { background: PANEL2, border: `1px solid ${LINE}`, color: MUTED }
      },
        React.createElement("div", null, "Plano: ", React.createElement("strong", { style: { color: "#d8d4c8" } }, accountStatus?.plan_name || "—")),
        React.createElement("div", null, "Status: ", React.createElement("strong", { style: { color: RED } }, planStatusLabel(accountStatus)))
      ),
      React.createElement(GhostButton, { onClick: handleLogout, className: "w-full justify-center" },
        loggingOut ? "Saindo…" : "Sair"
      )
    )
  );
}

/* ============================================================
   PORTAO DE AUTENTICACAO (AuthGate)
   ============================================================ */
function AuthGate() {
  const [status, setStatus] = useState("loading");
  const [session, setSession] = useState(null);
  const [accountReady, setAccountReady] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountStatus, setAccountStatus] = useState(null);
  const [view, setView] = useState("login");

  useEffect(() => {
    let mounted = true;

    window.supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) {
        setSession(data.session);
        setStatus("signedIn");
      } else {
        setStatus("signedOut");
      }
    });

    const { data: sub } = window.supabaseClient.auth.onAuthStateChange((event, newSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("recovery");
        return;
      }
      if (newSession) {
        setSession(newSession);
        setStatus("signedIn");
      } else {
        setSession(null);
        setAccountReady(false);
        setStatus("signedOut");
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (status !== "signedIn" || !session || !session.user || accountReady) return;

    let cancelled = false;

    async function prepareAccountWithRetry(maxTries = 4) {
      for (let attempt = 1; attempt <= maxTries; attempt++) {
        try {
          await ensureAccountForUser(session.user);
          const { data, error } = await window.supabaseClient.rpc("get_my_account_status");
          if (error) throw error;
          if (cancelled) return;
          setAccountStatus(data && data[0] ? data[0] : null);
          setAccountReady(true);
          return;
        } catch (e) {
          if (attempt === maxTries) {
            if (!cancelled) setAccountError(e.message || "Erro ao preparar sua conta.");
            return;
          }
          // Espera um pouco e tenta de novo — logo após confirmar o
          // e-mail, às vezes a sessão ainda não está 100% pronta.
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    }

    prepareAccountWithRetry();
    return () => { cancelled = true; };
  }, [status, session, accountReady]);

  async function handleLogout() {
    await window.supabaseClient.auth.signOut();
  }

  if (status === "loading") {
    return LoadingScreen("Carregando…");
  }

  if (status === "recovery") {
    return React.createElement(AuthShell, null, React.createElement(ResetPasswordView));
  }

  if (status === "signedOut") {
    let inner;
    if (view === "signup") {
      inner = React.createElement(SignupView, { onSwitch: () => setView("login") });
    } else if (view === "forgot") {
      inner = React.createElement(ForgotPasswordView, { onBack: () => setView("login") });
    } else {
      inner = React.createElement(LoginView, { onSignup: () => setView("signup"), onForgot: () => setView("forgot") });
    }
    return React.createElement(AuthShell, null, inner);
  }

  if (accountError) {
    return LoadingScreen(accountError, true);
  }
  if (!accountReady) {
    return LoadingScreen("Preparando sua conta…");
  }

  if (accountStatus && !accountStatus.has_access) {
    return React.createElement(SubscriptionBlockedScreen, { accountStatus, onLogout: handleLogout });
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    React.createElement(UserBar, { email: session.user.email, onLogout: handleLogout, accountStatus }),
    React.createElement(App, null)
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(AuthGate, null));
