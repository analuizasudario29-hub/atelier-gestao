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
          className: "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
          style: { border: `1px solid ${GOLD}`, color: GOLD }
        }, "A"),
        React.createElement("span", {
          className: "text-xs uppercase tracking-[0.25em]",
          style: { color: MUTED }
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
    React.createElement("div", { className: "flex flex-col items-center gap-3 text-center px-6" },
      !isError && React.createElement(Icon, { name: "loader", size: 26, className: "spin", style: { color: GOLD } }),
      React.createElement("span", {
        className: "text-xs uppercase tracking-[0.2em]",
        style: { color: isError ? RED : MUTED }
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
    React.createElement("h1", { className: "text-lg font-semibold text-center mb-1", style: { color: "#f0ede2" } }, "Entrar"),
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
      className: "text-xs text-left -mt-2",
      style: { color: MUTED }
    }, "Esqueci minha senha"),
    React.createElement(GoldButton, { type: "submit", disabled: loading, className: "w-full justify-center" },
      loading ? React.createElement(Icon, { name: "loader", size: 14, className: "spin" }) : null,
      loading ? "Entrando…" : "Entrar"
    ),
    React.createElement("div", { className: "flex items-center gap-3 my-1" },
      React.createElement("div", { className: "flex-1", style: { height: 1, background: LINE } }),
      React.createElement("span", { className: "text-[11px]", style: { color: MUTED } }, "ou"),
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
    React.createElement("h1", { className: "text-lg font-semibold text-center mb-1", style: { color: "#f0ede2" } }, "Criar conta"),
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
    React.createElement("h1", { className: "text-lg font-semibold text-center mb-1", style: { color: "#f0ede2" } }, "Recuperar senha"),
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
      className: "text-xs text-center mt-1",
      style: { color: MUTED }
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
    React.createElement("h1", { className: "text-lg font-semibold text-center mb-1", style: { color: "#f0ede2" } }, "Definir nova senha"),
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
    className: "absolute right-4 sm:right-6 top-10 z-50 w-72 rounded-sm p-4 text-xs",
    style: { background: PANEL, border: `1px solid ${LINE}`, color: MUTED, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }
  },
    React.createElement("div", { className: "flex items-center justify-between mb-3" },
      React.createElement("span", { className: "font-semibold", style: { color: "#e7e3d6" } }, "Minha assinatura"),
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
    )
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
    className: "w-full flex items-center justify-between px-4 sm:px-6 py-1.5 text-xs relative",
    style: { background: PANEL2, borderBottom: `1px solid ${LINE}`, color: MUTED }
  },
    React.createElement("span", null, "Conectado como ", React.createElement("strong", { style: { color: "#d8d4c8" } }, email)),
    React.createElement("div", { className: "flex items-center gap-3" },
      accountStatus && React.createElement("button", {
        onClick: () => setShowPanel(v => !v),
        className: "px-2 py-0.5 rounded-sm",
        style: { border: `1px solid ${LINE}`, color: accountStatus.has_access ? GREEN : RED }
      }, planStatusLabel(accountStatus)),
      React.createElement(GhostButton, { onClick: handleClick, className: "!py-1 !px-2.5 !text-[11px]" }, loggingOut ? "Saindo…" : "Sair")
    ),
    showPanel && React.createElement(SubscriptionPanel, { accountStatus, onClose: () => setShowPanel(false) })
  );
}

function PixPaymentView({ onBack, onConfirmed }) {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pix, setPix] = useState(null); // { qr_code, qr_code_base64 }
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) { setError("Digite um CPF válido (11 números)."); return; }
    setLoading(true);
    const { data, error } = await window.supabaseClient.functions.invoke("create-pix-charge", {
      method: "POST",
      body: { cpf: digits }
    });
    setLoading(false);
    if (error || !data?.qr_code) {
      setError("Não foi possível gerar o Pix agora. Tente novamente em instantes.");
      return;
    }
    setPix(data);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(pix.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Depois de gerar o Pix, fica consultando se já foi pago
  useEffect(() => {
    if (!pix) return;
    let tries = 0;
    const interval = setInterval(async () => {
      tries += 1;
      const { data } = await window.supabaseClient.rpc("get_my_account_status");
      const fresh = data && data[0];
      if (fresh?.has_access) {
        clearInterval(interval);
        onConfirmed(fresh);
      } else if (tries >= 40) {
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pix]);

  if (pix) {
    return /*#__PURE__*/React.createElement("div", { className: "flex flex-col gap-4 text-center" },
      React.createElement("h1", { className: "text-lg font-semibold", style: { color: "#f0ede2" } }, "Escaneie ou copie o código Pix"),
      pix.qr_code_base64 && React.createElement("img", {
        src: `data:image/png;base64,${pix.qr_code_base64}`,
        alt: "QR Code Pix",
        className: "mx-auto rounded-sm",
        style: { width: 200, height: 200, background: "#fff", padding: 8 }
      }),
      React.createElement("div", {
        className: "text-[10px] break-all px-3 py-2 rounded-sm text-left",
        style: { background: PANEL2, border: `1px solid ${LINE}`, color: MUTED }
      }, pix.qr_code),
      React.createElement(GhostButton, { onClick: handleCopy, className: "w-full justify-center" },
        copied ? "Copiado!" : "Copiar código Pix"
      ),
      React.createElement("p", { className: "text-xs", style: { color: MUTED } },
        "Assim que o pagamento for aprovado pelo Mercado Pago, seu acesso é liberado automaticamente — não precisa fazer mais nada nesta tela."
      ),
      React.createElement(Icon, { name: "loader", size: 18, className: "spin mx-auto", style: { color: GOLD } })
    );
  }

  return /*#__PURE__*/React.createElement("form", { onSubmit: handleGenerate, className: "flex flex-col gap-4" },
    React.createElement("h1", { className: "text-lg font-semibold text-center", style: { color: "#f0ede2" } }, "Pagar com Pix"),
    React.createElement(AuthMessage, { error }),
    React.createElement(Field, { label: "Seu CPF (necessário para gerar o Pix)" },
      React.createElement(TextInput, { value: cpf, onChange: e => setCpf(e.target.value), placeholder: "000.000.000-00" })
    ),
    React.createElement(GoldButton, { type: "submit", disabled: loading, className: "w-full justify-center" },
      loading ? React.createElement(Icon, { name: "loader", size: 14, className: "spin" }) : null,
      loading ? "Gerando Pix…" : "Gerar Pix"
    ),
    React.createElement(GhostButton, { type: "button", onClick: onBack, className: "w-full justify-center" }, "Voltar")
  );
}

function SubscriptionBlockedScreen({ accountStatus, onLogout, onSubscribed }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const [view, setView] = useState("options"); // options | pix
  const [waitingConfirmation, setWaitingConfirmation] = useState(
    () => new URLSearchParams(window.location.search).get("mp_return") === "1"
  );

  async function handleLogout() {
    setLoggingOut(true);
    await onLogout();
  }

  async function handleSubscribeCard() {
    setSubscribeError("");
    setSubscribing(true);
    const { data, error } = await window.supabaseClient.functions.invoke("create-mp-subscription", {
      method: "POST"
    });
    setSubscribing(false);
    if (error || !data?.init_point) {
      setSubscribeError("Não foi possível iniciar a assinatura agora. Tente novamente em instantes.");
      return;
    }
    window.location.href = data.init_point;
  }

  // Depois de voltar do checkout do Mercado Pago (cartão), o status ainda
  // depende do webhook confirmar — então ficamos consultando por um tempo.
  useEffect(() => {
    if (!waitingConfirmation) return;
    let tries = 0;
    const interval = setInterval(async () => {
      tries += 1;
      const { data } = await window.supabaseClient.rpc("get_my_account_status");
      const fresh = data && data[0];
      if (fresh?.has_access) {
        clearInterval(interval);
        onSubscribed(fresh);
      } else if (tries >= 10) {
        clearInterval(interval);
        setWaitingConfirmation(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [waitingConfirmation]);

  if (waitingConfirmation) {
    return LoadingScreen("Confirmando seu pagamento com o Mercado Pago…");
  }

  if (view === "pix") {
    return React.createElement(AuthShell, null,
      React.createElement(PixPaymentView, { onBack: () => setView("options"), onConfirmed: onSubscribed })
    );
  }

  const statusMessages = {
    pending: "O pagamento da sua assinatura está pendente. Regularize para voltar a ter acesso completo.",
    paused: "Sua assinatura está pausada. Reative para voltar a ter acesso ao CRM.",
    canceled: "Sua assinatura foi cancelada. Assine novamente para voltar a ter acesso ao CRM.",
    expired: "Seu período de teste ou assinatura expirou. Assine um plano para continuar."
  };
  const message = statusMessages[accountStatus?.subscription_status] ||
    "Sua conta não tem uma assinatura ativa no momento.";

  return /*#__PURE__*/React.createElement(AuthShell, null,
    React.createElement("div", { className: "flex flex-col gap-4 text-center" },
      React.createElement("h1", { className: "text-lg font-semibold", style: { color: "#f0ede2" } }, "Assinatura necessária"),
      React.createElement("p", { className: "text-sm", style: { color: MUTED } }, message),
      React.createElement("div", {
        className: "text-xs px-3 py-2 rounded-sm text-left",
        style: { background: PANEL2, border: `1px solid ${LINE}`, color: MUTED }
      },
        React.createElement("div", null, "Plano: ", React.createElement("strong", { style: { color: "#d8d4c8" } }, accountStatus?.plan_name || "—")),
        React.createElement("div", null, "Status: ", React.createElement("strong", { style: { color: RED } }, planStatusLabel(accountStatus)))
      ),
      React.createElement(AuthMessage, { error: subscribeError }),
      React.createElement(GoldButton, { onClick: handleSubscribeCard, disabled: subscribing, className: "w-full justify-center" },
        subscribing ? React.createElement(Icon, { name: "loader", size: 14, className: "spin" }) : null,
        subscribing ? "Abrindo o Mercado Pago…" : "Assinar com cartão (Mercado Pago)"
      ),
      React.createElement(GhostButton, { onClick: () => setView("pix"), className: "w-full justify-center" },
        "Pagar com Pix"
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
    if (status === "signedIn" && session && session.user && !accountReady) {
      ensureAccountForUser(session.user)
        .then(() => window.supabaseClient.rpc("get_my_account_status"))
        .then(({ data, error }) => {
          if (error) throw error;
          setAccountStatus(data && data[0] ? data[0] : null);
          setAccountReady(true);
        })
        .catch(e => setAccountError(e.message || "Erro ao preparar sua conta."));
    }
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
    return React.createElement(SubscriptionBlockedScreen, {
      accountStatus,
      onLogout: handleLogout,
      onSubscribed: (freshStatus) => {
        setAccountStatus(freshStatus);
        window.history.replaceState({}, "", window.location.pathname);
      }
    });
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    React.createElement(UserBar, { email: session.user.email, onLogout: handleLogout, accountStatus }),
    React.createElement(App, null)
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(AuthGate, null));
