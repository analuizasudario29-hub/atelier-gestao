const {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} = React;

/* ============================================================
   TOKENS
   ============================================================ */
const GOLD = "#2f8fef";
const GOLD_SOFT = "#5fc4ff";
const YELLOW = "#eab308";
const GREEN = "#22c55e";
const RED = "#ef4444";
const INK = "#0b0b0a";
const PANEL = "#141412";
const PANEL2 = "#1c1b18";
const LINE = "#2b2a25";
const MUTED = "#9a9686";
const K = {
  products: "atelier_products_v1",
  clients: "atelier_clients_v1",
  sales: "atelier_sales_v1",
  settings: "atelier_settings_v1"
};
const DEFAULT_SETTINGS = {
  banner: null,
  lowStockThreshold: 2,
  saleCounter: 0,
  storeName: "ATELIER"
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const brl = v => (Number(v) || 0).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});
const pct = v => `${v >= 0 ? "+" : ""}${v.toFixed(1).replace(".", ",")}%`;
const todayISO = () => new Date().toISOString();
const monthKey = iso => iso.slice(0, 7);
const fmtDate = iso => new Date(iso).toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});
const fmtDateTime = iso => new Date(iso).toLocaleString("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});
const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
function monthLabel(mk) {
  const [y, m] = mk.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]}/${y}`;
}
function addMonths(mk, delta) {
  let [y, m] = mk.split("-").map(Number);
  m += delta;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

/* ============================================================
   STORAGE (localStorage — persiste no navegador, sem servidor)
   ============================================================ */
async function storageGet(key, fallback) {
  try {
    const v = window.localStorage.getItem(key);
    if (v === null || v === undefined) return fallback;
    return JSON.parse(v);
  } catch (e) {
    console.error("Erro ao ler", key, e);
    return fallback;
  }
}
async function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("Erro ao salvar", key, e);
    return false;
  }
}

/* ============================================================
   ICONS (SVG simples, sem dependências externas)
   ============================================================ */
function Icon({
  name,
  size = 16,
  style,
  className
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style,
    className
  };
  const paths = {
    home: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 11l9-8 9 8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 10v10h14V10"
    })),
    package: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 8L12 3 3 8v8l9 5 9-5V8z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 8l9 5 9-5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 13v8"
    })),
    shoppingBag: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M6 8h12l-1 12H7L6 8z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 8V6a3 3 0 016 0v2"
    })),
    users: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "8",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 20c0-4 3-6 7-6s7 2 7 6"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "17",
      cy: "9",
      r: "2.3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M23 20c0-3-2-5-5-5.3"
    })),
    wallet: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "6",
      width: "18",
      height: "13",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 12h3"
    })),
    barChart3: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 20V10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 20V4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 20v-7"
    })),
    settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 12a7 7 0 00-.2-1.6l2-1.6-2-3.4-2.4.6a7 7 0 00-2.8-1.6L15 2H9l-.6 2.4a7 7 0 00-2.8 1.6l-2.4-.6-2 3.4 2 1.6A7 7 0 003 12a7 7 0 00.2 1.6l-2 1.6 2 3.4 2.4-.6a7 7 0 002.8 1.6L9 22h6l.6-2.4a7 7 0 002.8-1.6l2.4.6 2-3.4-2-1.6c.1-.5.2-1 .2-1.6z"
    })),
    plus: /*#__PURE__*/React.createElement("path", {
      d: "M12 5v14M5 12h14"
    }),
    edit: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 20h9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
    })),
    trash: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 6h18"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 6V4h8v2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6l-1 14H6L5 6"
    })),
    search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 21l-4.3-4.3"
    })),
    x: /*#__PURE__*/React.createElement("path", {
      d: "M18 6L6 18M6 6l12 12"
    }),
    chevronRight: /*#__PURE__*/React.createElement("path", {
      d: "M9 6l6 6-6 6"
    }),
    chevronLeft: /*#__PURE__*/React.createElement("path", {
      d: "M15 6l-6 6 6 6"
    }),
    alert: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 2L1 21h22L12 2z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 9v5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 17h.01"
    })),
    save: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 3v6h8V3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 21v-8h10v8"
    })),
    check: /*#__PURE__*/React.createElement("path", {
      d: "M20 6L9 17l-5-5"
    }),
    image: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "8.5",
      cy: "8.5",
      r: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 15l-5-5L5 21"
    })),
    arrowUpRight: /*#__PURE__*/React.createElement("path", {
      d: "M7 17L17 7M7 7h10v10"
    }),
    arrowDownRight: /*#__PURE__*/React.createElement("path", {
      d: "M7 7l10 10M17 7v10H7"
    }),
    phone: /*#__PURE__*/React.createElement("path", {
      d: "M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.7a2 2 0 01-.5 2.1L8 9.7a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.8.5 2.7.6a2 2 0 011.7 2z"
    }),
    mail: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "4",
      width: "20",
      height: "16",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 6l10 7 10-7"
    })),
    instagram: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "2",
      width: "20",
      height: "20",
      rx: "5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "4"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "17.3",
      cy: "6.7",
      r: "1"
    })),
    card: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "5",
      width: "20",
      height: "14",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 10h20"
    })),
    calendar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 2v4M8 2v4M3 10h18"
    })),
    archive: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "3",
      width: "20",
      height: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 8v13h16V8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 12h4"
    })),
    trendingUp: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 17l6-6 4 4 8-8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 7h-6v6"
    })),
    menu: /*#__PURE__*/React.createElement("path", {
      d: "M4 6h16M4 12h16M4 18h16"
    }),
    loader: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9",
      opacity: "0.25"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 12a9 9 0 00-9-9"
    }))
  };
  return /*#__PURE__*/React.createElement("svg", common, paths[name] || null);
}

/* ============================================================
   SMALL UI PRIMITIVES
   ============================================================ */
function GoldButton({
  children,
  onClick,
  icon,
  className = "",
  type = "button",
  disabled
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    onClick: onClick,
    disabled: disabled,
    className: `inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`,
    style: {
      background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD})`,
      color: INK
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16
  }), children);
}
function GhostButton({
  children,
  onClick,
  icon,
  className = "",
  danger
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    className: `inline-flex items-center gap-2 px-3.5 py-2 rounded-sm text-sm font-medium border transition-colors ${className}`,
    style: {
      borderColor: danger ? "#5a2a2a" : LINE,
      color: danger ? RED : "#d8d4c8",
      background: "transparent"
    },
    onMouseEnter: e => e.currentTarget.style.borderColor = danger ? "#8a3a38" : GOLD,
    onMouseLeave: e => e.currentTarget.style.borderColor = danger ? "#5a2a2a" : LINE
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 14
  }), children);
}
function Field({
  label,
  children,
  hint
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "flex flex-col gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] uppercase tracking-[0.12em]",
    style: {
      color: MUTED
    }
  }, label), children, hint && /*#__PURE__*/React.createElement("span", {
    className: "text-[11px]",
    style: {
      color: "#7a7668"
    }
  }, hint));
}
function inputStyle() {
  return {
    background: PANEL2,
    border: `1px solid ${LINE}`,
    color: "#f0ede2"
  };
}
function TextInput(props) {
  return /*#__PURE__*/React.createElement("input", {
    ...props,
    className: `px-3 py-2 rounded-sm text-sm outline-none transition-colors w-full ${props.className || ""}`,
    style: {
      ...inputStyle(),
      ...(props.style || {})
    }
  });
}
function SelectInput(props) {
  return /*#__PURE__*/React.createElement("select", {
    ...props,
    className: `px-3 py-2 rounded-sm text-sm outline-none transition-colors w-full ${props.className || ""}`,
    style: {
      ...inputStyle(),
      ...(props.style || {})
    }
  }, props.children);
}
function Card({
  children,
  className = "",
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `rounded-sm ${className}`,
    style: {
      background: PANEL,
      border: `1px solid ${LINE}`,
      ...style
    }
  }, children);
}
function SectionTitle({
  eyebrow,
  title,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-end justify-between flex-wrap gap-3 mb-5"
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.2em] mb-1",
    style: {
      color: GOLD
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl",
    style: {
      color: "#f5f2e8"
    }
  }, title)), right);
}
function Modal({
  title,
  onClose,
  children,
  wide
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6",
    style: {
      background: "rgba(5,5,4,0.72)"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: `w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[88vh] overflow-y-auto rounded-sm`,
    style: {
      background: PANEL,
      border: `1px solid ${LINE}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between px-5 py-4 sticky top-0",
    style: {
      background: PANEL,
      borderBottom: `1px solid ${LINE}`
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg",
    style: {
      color: "#f5f2e8"
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "p-1 rounded-sm hover:opacity-70",
    style: {
      color: MUTED
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-5"
  }, children)));
}
function ConfirmModal({
  text,
  onConfirm,
  onCancel
}) {
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Confirmar exclusão",
    onClose: onCancel
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm mb-5",
    style: {
      color: "#d8d4c8"
    }
  }, text), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end gap-2"
  }, /*#__PURE__*/React.createElement(GhostButton, {
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement(GoldButton, {
    onClick: onConfirm,
    icon: "trash"
  }, "Excluir")));
}
function Toast({
  text
}) {
  if (!text) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-5 right-5 z-[60] px-4 py-3 rounded-sm text-sm flex items-center gap-2 shadow-lg",
    style: {
      background: PANEL,
      border: `1px solid ${GOLD}`,
      color: "#f5f2e8"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 15,
    style: {
      color: GOLD
    }
  }), " ", text);
}
function StatCard({
  label,
  value,
  sub,
  icon,
  accent
}) {
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-4 sm:p-5 flex flex-col gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] uppercase tracking-[0.14em]",
    style: {
      color: MUTED
    }
  }, label), icon && /*#__PURE__*/React.createElement("div", {
    className: "p-1.5 rounded-sm",
    style: {
      background: "rgba(47,143,239,0.1)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15,
    style: {
      color: GOLD
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl sm:text-[26px] leading-none",
    style: {
      color: accent || "#f5f2e8"
    }
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: MUTED
    }
  }, sub));
}
function EmptyState({
  text,
  icon
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center justify-center py-14 text-center gap-2"
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 28,
    style: {
      color: LINE
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm",
    style: {
      color: MUTED
    }
  }, text));
}
/* Gráficos simples, sem bibliotecas externas */
function SimpleLineChart({
  data,
  series,
  height = 220
}) {
  if (!data || data.length === 0) return /*#__PURE__*/React.createElement(EmptyState, {
    text: "Sem dados no período selecionado."
  });
  const W = 600,
    H = height,
    PAD = 30;
  const allVals = data.flatMap(d => series.map(s => Number(d[s.key]) || 0));
  const max = Math.max(1, ...allVals);
  const stepX = (W - PAD * 2) / Math.max(1, data.length - 1);
  const pt = (i, v) => {
    const x = PAD + i * stepX;
    const y = H - PAD - v / max * (H - PAD * 2);
    return `${x},${y}`;
  };
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    className: "w-full",
    style: {
      height
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: PAD,
    y1: H - PAD,
    x2: W - PAD,
    y2: H - PAD,
    stroke: LINE
  }), series.map(s => /*#__PURE__*/React.createElement("polyline", {
    key: s.key,
    fill: "none",
    stroke: s.color,
    strokeWidth: "2",
    points: data.map((d, i) => pt(i, Number(d[s.key]) || 0)).join(" ")
  })), data.map((d, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: PAD + i * stepX,
    y: H - 8,
    fontSize: "9",
    fill: MUTED,
    textAnchor: "middle"
  }, data.length > 10 && i % Math.ceil(data.length / 10) !== 0 ? "" : d.label)), /*#__PURE__*/React.createElement("g", {
    transform: `translate(${W - PAD - 90}, 14)`
  }, series.map((s, i) => /*#__PURE__*/React.createElement("g", {
    key: s.key,
    transform: `translate(0, ${i * 14})`
  }, /*#__PURE__*/React.createElement("rect", {
    width: "9",
    height: "9",
    fill: s.color,
    rx: "2"
  }), /*#__PURE__*/React.createElement("text", {
    x: "13",
    y: "8",
    fontSize: "10",
    fill: "#c9c5b7"
  }, s.label)))));
}
function SimpleBarList({
  data,
  valueFmt
}) {
  if (!data || data.length === 0) return /*#__PURE__*/React.createElement(EmptyState, {
    text: "Sem dados."
  });
  const max = Math.max(1, ...data.map(d => d.value));
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5"
  }, data.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-xs mb-1"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#c9c5b7"
    }
  }, d.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: GOLD_SOFT
    }
  }, valueFmt ? valueFmt(d.value) : d.value)), /*#__PURE__*/React.createElement("div", {
    className: "h-2 rounded-full overflow-hidden",
    style: {
      background: PANEL2
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full rounded-full",
    style: {
      width: `${d.value / max * 100}%`,
      background: `linear-gradient(90deg, ${GOLD_SOFT}, ${GOLD})`
    }
  })))));
}

/* ============================================================
   APP
   ============================================================ */
function App() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);
  useEffect(() => {
    (async () => {
      const [p, c, s, st] = await Promise.all([storageGet(K.products, []), storageGet(K.clients, []), storageGet(K.sales, []), storageGet(K.settings, DEFAULT_SETTINGS)]);
      setProducts(p);
      setClients(c);
      setSales(s);
      setSettings({
        ...DEFAULT_SETTINGS,
        ...st
      });
      setLoading(false);
    })();
  }, []);
  const notify = useCallback(msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }, []);
  const persist = useCallback(async (key, value, setter) => {
    setter(value);
    const ok = await storageSet(key, value);
    if (!ok) notify("Falha ao salvar. Tente novamente.");
    return ok;
  }, [notify]);
  const saveProducts = v => persist(K.products, v, setProducts);
  const saveClients = v => persist(K.clients, v, setClients);
  const saveSales = v => persist(K.sales, v, setSales);
  const saveSettings = v => persist(K.settings, v, setSettings);
  const logoRef = useRef(null);
  const onLogo = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await saveSettings({
        ...settings,
        banner: reader.result
      });
      notify("Imagem atualizada");
    };
    reader.readAsDataURL(file);
  };
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: "w-full min-h-screen flex items-center justify-center",
      style: {
        background: INK
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-center gap-3"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "loader",
      size: 26,
      className: "spin",
      style: {
        color: GOLD
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-xs uppercase tracking-[0.2em]",
      style: {
        color: MUTED
      }
    }, "Carregando ateliê…")));
  }
  const NAV = [{
    id: "dashboard",
    label: "Dashboard",
    icon: "home"
  }, {
    id: "estoque",
    label: "Estoque",
    icon: "package"
  }, {
    id: "vendas",
    label: "Vendas",
    icon: "shoppingBag"
  }, {
    id: "clientes",
    label: "Clientes",
    icon: "users"
  }, {
    id: "financeiro",
    label: "Financeiro",
    icon: "wallet"
  }, {
    id: "relatorios",
    label: "Relatórios",
    icon: "barChart3"
  }, {
    id: "config",
    label: "Configurações",
    icon: "settings"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full min-h-screen",
    style: {
      background: INK,
      fontFamily: "'Inter', sans-serif"
    }
  }, /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-40",
    style: {
      background: "rgba(11,11,10,0.92)",
      borderBottom: `1px solid ${LINE}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => logoRef.current?.click(),
    className: "w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer overflow-hidden",
    style: {
      border: `1px solid ${GOLD}`,
      color: GOLD,
      background: settings.banner ? `url(${settings.banner}) center/cover no-repeat` : "transparent"
    },
    title: "Alterar imagem"
  }, !settings.banner && (settings.storeName?.[0] || "A"), /*#__PURE__*/React.createElement("input", {
    ref: logoRef,
    type: "file",
    accept: "image/*",
    className: "hidden",
    onChange: onLogo
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-lg tracking-[0.15em]",
    style: {
      color: "#f5f2e8"
    }
  }, settings.storeName || "ATELIER")), /*#__PURE__*/React.createElement("nav", {
    className: "hidden md:flex items-center gap-1"
  }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    onClick: () => setTab(n.id),
    className: "flex items-center gap-1.5 px-3 py-2 rounded-sm text-[13px] tracking-wide transition-colors",
    style: {
      color: tab === n.id ? INK : "#c9c5b7",
      background: tab === n.id ? GOLD : "transparent"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.icon,
    size: 14
  }), " ", n.label))), /*#__PURE__*/React.createElement("button", {
    className: "md:hidden p-2",
    onClick: () => setMobileMenu(m => !m),
    style: {
      color: GOLD_SOFT
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 22
  }))), mobileMenu && /*#__PURE__*/React.createElement("div", {
    className: "md:hidden px-4 pb-3 flex flex-col gap-1",
    style: {
      borderTop: `1px solid ${LINE}`
    }
  }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    onClick: () => {
      setTab(n.id);
      setMobileMenu(false);
    },
    className: "flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm text-left",
    style: {
      color: tab === n.id ? INK : "#c9c5b7",
      background: tab === n.id ? GOLD : "transparent"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.icon,
    size: 15
  }), " ", n.label)))), /*#__PURE__*/React.createElement("main", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
  }, tab === "dashboard" && /*#__PURE__*/React.createElement(Dashboard, {
    products: products,
    clients: clients,
    sales: sales,
    settings: settings,
    saveSettings: saveSettings,
    notify: notify,
    setTab: setTab
  }), tab === "estoque" && /*#__PURE__*/React.createElement(Estoque, {
    products: products,
    saveProducts: saveProducts,
    settings: settings,
    notify: notify,
    setConfirm: setConfirm
  }), tab === "vendas" && /*#__PURE__*/React.createElement(Vendas, {
    products: products,
    saveProducts: saveProducts,
    clients: clients,
    saveClients: saveClients,
    sales: sales,
    saveSales: saveSales,
    settings: settings,
    saveSettings: saveSettings,
    notify: notify,
    setConfirm: setConfirm
  }), tab === "clientes" && /*#__PURE__*/React.createElement(Clientes, {
    clients: clients,
    saveClients: saveClients,
    sales: sales,
    notify: notify,
    setConfirm: setConfirm
  }), tab === "financeiro" && /*#__PURE__*/React.createElement(Financeiro, {
    sales: sales,
    products: products
  }), tab === "relatorios" && /*#__PURE__*/React.createElement(Relatorios, {
    products: products,
    sales: sales,
    clients: clients,
    settings: settings
  }), tab === "config" && /*#__PURE__*/React.createElement(Config, {
    settings: settings,
    saveSettings: saveSettings,
    notify: notify,
    products: products,
    clients: clients,
    sales: sales
  })), /*#__PURE__*/React.createElement(Toast, {
    text: toast
  }), confirm && /*#__PURE__*/React.createElement(ConfirmModal, {
    text: confirm.text,
    onConfirm: () => {
      confirm.onConfirm();
      setConfirm(null);
    },
    onCancel: () => setConfirm(null)
  }));
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard({
  products,
  clients,
  sales,
  settings,
  saveSettings,
  notify,
  setTab
}) {
  const fileRef = useRef(null);
  const activeSales = useMemo(() => sales.filter(s => s.active !== false), [sales]);
  const now = new Date();
  const curMK = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevMK = addMonths(curMK, -1);
  const monthAgg = mk => {
    const list = activeSales.filter(s => monthKey(s.date) === mk);
    return {
      faturamento: list.reduce((a, s) => a + s.finalTotal, 0),
      lucro: list.reduce((a, s) => a + s.profit, 0),
      vendas: list.length
    };
  };
  const cur = monthAgg(curMK);
  const prev = monthAgg(prevMK);
  const variation = (c, p) => p === 0 ? c === 0 ? 0 : 100 : (c - p) / p * 100;
  const totalQty = products.reduce((a, p) => a + Number(p.qty || 0), 0);
  const stockCost = products.reduce((a, p) => a + Number(p.qty || 0) * Number(p.cost || 0), 0);
  const stockPotential = products.reduce((a, p) => a + Number(p.qty || 0) * Number(p.price || 0), 0);
  const potentialProfit = stockPotential - stockCost;
  const onBanner = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await saveSettings({
        ...settings,
        banner: reader.result
      });
      notify("Banner atualizado");
    };
    reader.readAsDataURL(file);
  };
  const lowStock = products.filter(p => Number(p.qty) <= Number(settings.lowStockThreshold) && Number(p.qty) > 0);
  const outStock = products.filter(p => Number(p.qty) <= 0);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Painel geral",
    title: "Dashboard"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Faturamento do mês",
    value: brl(cur.faturamento),
    icon: "wallet"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Lucro do mês",
    value: brl(cur.lucro),
    icon: "trendingUp",
    accent: GREEN
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Peças em estoque",
    value: totalQty,
    icon: "package"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Vendas no mês",
    value: cur.vendas,
    icon: "shoppingBag"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Valor do estoque (custo)",
    value: brl(stockCost),
    sub: "Preço de custo",
    icon: "wallet"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Valor do estoque (venda)",
    value: brl(stockPotential),
    sub: "Preço de venda",
    icon: "wallet"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Potencial de faturamento",
    value: brl(stockPotential),
    sub: "Se vender todo o estoque",
    icon: "trendingUp"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Potencial de lucro",
    value: brl(potentialProfit),
    sub: "Estoque total pelo lucro",
    icon: "trendingUp",
    accent: GREEN
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-5 lg:col-span-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Comparação entre meses"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-6"
  }, [{
    mk: curMK,
    data: cur
  }, {
    mk: prevMK,
    data: prev
  }].map(m => /*#__PURE__*/React.createElement("div", {
    key: m.mk
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm mb-3",
    style: {
      color: "#d8d4c8"
    }
  }, monthLabel(m.mk).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 text-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Faturamento"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#f0ede2"
    }
  }, brl(m.data.faturamento))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Lucro"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: GREEN
    }
  }, brl(m.data.lucro))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Vendas"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#f0ede2"
    }
  }, m.data.vendas)))))), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 pt-4 grid grid-cols-3 gap-3",
    style: {
      borderTop: `1px solid ${LINE}`
    }
  }, [{
    label: "Faturamento",
    v: variation(cur.faturamento, prev.faturamento)
  }, {
    label: "Lucro",
    v: variation(cur.lucro, prev.lucro)
  }, {
    label: "Vendas",
    v: variation(cur.vendas, prev.vendas)
  }].map(x => /*#__PURE__*/React.createElement("div", {
    key: x.label,
    className: "flex flex-col gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px]",
    style: {
      color: MUTED
    }
  }, x.label), /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-1 text-sm font-medium",
    style: {
      color: x.v >= 0 ? GREEN : RED
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: x.v >= 0 ? "arrowUpRight" : "arrowDownRight",
    size: 14
  }), " ", pct(x.v)))))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Clientes"), /*#__PURE__*/React.createElement("div", {
    className: "text-3xl mb-1",
    style: {
      color: "#f5f2e8"
    }
  }, clients.length), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mb-4",
    style: {
      color: MUTED
    }
  }, "cadastrados no total"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab("clientes"),
    className: "text-xs flex items-center gap-1",
    style: {
      color: GOLD
    }
  }, "Ver todos ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 13
  })))), (lowStock.length > 0 || outStock.length > 0) && /*#__PURE__*/React.createElement(Card, {
    className: "p-5",
    style: {
      borderColor: "#1e3a5c"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-3"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert",
    size: 16,
    style: {
      color: GOLD
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-medium",
    style: {
      color: "#f0ede2"
    }
  }, "Alertas de estoque")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, outStock.map(p => /*#__PURE__*/React.createElement("span", {
    key: p.id,
    className: "text-xs px-2.5 py-1 rounded-sm",
    style: {
      background: "rgba(239,68,68,0.12)",
      color: RED
    }
  }, "Sem estoque · ", p.name, " ", p.color, " ", p.size)), lowStock.map(p => /*#__PURE__*/React.createElement("span", {
    key: p.id,
    className: "text-xs px-2.5 py-1 rounded-sm",
    style: {
      background: "rgba(47,143,239,0.12)",
      color: GOLD_SOFT
    }
  }, "Estoque baixo (", p.qty, ") · ", p.name, " ", p.color, " ", p.size)))));
}

/* ============================================================
   ESTOQUE
   ============================================================ */
function emptyProduct() {
  return {
    id: null,
    name: "",
    color: "",
    size: "",
    qty: "",
    cost: "",
    price: ""
  };
}
function Estoque({
  products,
  saveProducts,
  settings,
  notify,
  setConfirm
}) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [expanded, setExpanded] = useState({});
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = products.filter(p => !q || p.name.toLowerCase().includes(q) || p.color.toLowerCase().includes(q) || p.size.toLowerCase().includes(q));
    const map = {};
    filtered.forEach(p => {
      if (!map[p.name]) map[p.name] = [];
      map[p.name].push(p);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products, search]);
  const openNew = () => setModal({
    mode: "new",
    data: emptyProduct()
  });
  const openEdit = p => setModal({
    mode: "edit",
    data: {
      ...p
    }
  });
  const submit = async data => {
    if (!data.name || !data.color || !data.size || data.qty === "" || data.cost === "" || data.price === "") {
      notify("Preencha todos os campos obrigatórios");
      return;
    }
    const clean = {
      ...data,
      qty: Math.max(0, Math.round(Number(data.qty))),
      cost: Number(data.cost),
      price: Number(data.price)
    };
    if (modal.mode === "new") {
      await saveProducts([...products, {
        ...clean,
        id: uid()
      }]);
      notify("Produto adicionado");
    } else {
      await saveProducts(products.map(p => p.id === clean.id ? clean : p));
      notify("Alterações salvas com sucesso");
    }
    setModal(null);
  };
  const remove = p => {
    setConfirm({
      text: `Tem certeza que deseja excluir "${p.name} — ${p.color} — ${p.size}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        await saveProducts(products.filter(x => x.id !== p.id));
        notify("Produto excluído");
      }
    });
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Inventário",
    title: "Estoque",
    right: /*#__PURE__*/React.createElement(GoldButton, {
      icon: "plus",
      onClick: openNew
    }, "Adicionar produto")
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-5 max-w-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15,
    className: "absolute left-3 top-1/2 -translate-y-1/2",
    style: {
      color: MUTED
    }
  }), /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Pesquisar por nome, cor ou tamanho…",
    value: search,
    onChange: e => setSearch(e.target.value),
    className: "pl-9"
  }))), grouped.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "package",
    text: "Nenhum produto cadastrado ainda."
  }) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, grouped.map(([name, variants]) => {
    const totalQty = variants.reduce((a, v) => a + Number(v.qty), 0);
    const totalValue = variants.reduce((a, v) => a + Number(v.qty) * Number(v.price), 0);
    const isOpen = expanded[name] ?? true;
    return /*#__PURE__*/React.createElement(Card, {
      key: name,
      className: "overflow-hidden"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setExpanded(s => ({
        ...s,
        [name]: !isOpen
      })),
      className: "w-full flex items-center justify-between px-5 py-3.5",
      style: {
        borderBottom: isOpen ? `1px solid ${LINE}` : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 15,
      style: {
        color: GOLD,
        transform: isOpen ? "rotate(90deg)" : "none",
        transition: "transform .15s"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 17,
        color: "#f5f2e8"
      }
    }, name), /*#__PURE__*/React.createElement("span", {
      className: "text-xs px-2 py-0.5 rounded-sm",
      style: {
        background: PANEL2,
        color: MUTED
      }
    }, variants.length, " variações")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-4 text-xs",
      style: {
        color: MUTED
      }
    }, /*#__PURE__*/React.createElement("span", null, totalQty, " un."), /*#__PURE__*/React.createElement("span", {
      className: "hidden sm:inline"
    }, brl(totalValue)))), isOpen && /*#__PURE__*/React.createElement("div", {
      className: "overflow-x-auto"
    }, /*#__PURE__*/React.createElement("table", {
      className: "w-full text-sm"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        color: MUTED
      }
    }, /*#__PURE__*/React.createElement("th", {
      className: "text-left font-normal px-5 py-2 text-xs uppercase tracking-wide"
    }, "Cor"), /*#__PURE__*/React.createElement("th", {
      className: "text-left font-normal px-2 py-2 text-xs uppercase tracking-wide"
    }, "Tamanho"), /*#__PURE__*/React.createElement("th", {
      className: "text-right font-normal px-2 py-2 text-xs uppercase tracking-wide"
    }, "Qtd"), /*#__PURE__*/React.createElement("th", {
      className: "text-right font-normal px-2 py-2 text-xs uppercase tracking-wide"
    }, "Custo"), /*#__PURE__*/React.createElement("th", {
      className: "text-right font-normal px-2 py-2 text-xs uppercase tracking-wide"
    }, "Venda"), /*#__PURE__*/React.createElement("th", {
      className: "text-right font-normal px-2 py-2 text-xs uppercase tracking-wide"
    }, "Margem"), /*#__PURE__*/React.createElement("th", {
      className: "text-right font-normal px-5 py-2 text-xs uppercase tracking-wide"
    }, "Ações"))), /*#__PURE__*/React.createElement("tbody", null, variants.map(v => {
      const margin = v.price > 0 ? (v.price - v.cost) / v.price * 100 : 0;
      const low = Number(v.qty) <= Number(settings.lowStockThreshold);
      return /*#__PURE__*/React.createElement("tr", {
        key: v.id,
        style: {
          borderTop: `1px solid ${LINE}`
        }
      }, /*#__PURE__*/React.createElement("td", {
        className: "px-5 py-2.5",
        style: {
          color: "#e8e4d8"
        }
      }, v.color), /*#__PURE__*/React.createElement("td", {
        className: "px-2 py-2.5",
        style: {
          color: "#e8e4d8"
        }
      }, v.size), /*#__PURE__*/React.createElement("td", {
        className: "px-2 py-2.5 text-right"
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: v.qty <= 0 ? RED : low ? GOLD : "#e8e4d8"
        }
      }, v.qty), v.qty <= 0 && /*#__PURE__*/React.createElement("span", {
        className: "ml-1.5 text-[10px]",
        style: {
          color: RED
        }
      }, "sem estoque"), v.qty > 0 && low && /*#__PURE__*/React.createElement("span", {
        className: "ml-1.5 text-[10px]",
        style: {
          color: GOLD
        }
      }, "baixo")), /*#__PURE__*/React.createElement("td", {
        className: "px-2 py-2.5 text-right",
        style: {
          color: "#c9c5b7"
        }
      }, brl(v.cost)), /*#__PURE__*/React.createElement("td", {
        className: "px-2 py-2.5 text-right",
        style: {
          color: "#c9c5b7"
        }
      }, brl(v.price)), /*#__PURE__*/React.createElement("td", {
        className: "px-2 py-2.5 text-right",
        style: {
          color: GOLD_SOFT
        }
      }, margin.toFixed(0), "%"), /*#__PURE__*/React.createElement("td", {
        className: "px-5 py-2.5"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-end gap-1.5"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => openEdit(v),
        className: "p-1.5 rounded-sm hover:opacity-70",
        style: {
          color: MUTED
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "edit",
        size: 14
      })), /*#__PURE__*/React.createElement("button", {
        onClick: () => remove(v),
        className: "p-1.5 rounded-sm hover:opacity-70",
        style: {
          color: MUTED
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "trash",
        size: 14
      })))));
    })))));
  })), modal && /*#__PURE__*/React.createElement(Modal, {
    title: modal.mode === "new" ? "Adicionar produto" : "Editar produto",
    onClose: () => setModal(null)
  }, /*#__PURE__*/React.createElement(ProductForm, {
    data: modal.data,
    onSubmit: submit,
    onCancel: () => setModal(null)
  })));
}
function ProductForm({
  data,
  onSubmit,
  onCancel
}) {
  const [f, setF] = useState(data);
  const set = k => e => setF(s => ({
    ...s,
    [k]: e.target.value
  }));
  const margin = f.price > 0 && f.cost !== "" ? ((Number(f.price) - Number(f.cost)) / Number(f.price) * 100).toFixed(1) : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nome da peça *"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: f.name,
    onChange: set("name"),
    placeholder: "Ex: Camiseta Essencial"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Cor *"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: f.color,
    onChange: set("color"),
    placeholder: "Preta"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Tamanho *"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: f.size,
    onChange: set("size"),
    placeholder: "M"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Quantidade *"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    min: "0",
    value: f.qty,
    onChange: set("qty"),
    placeholder: "0"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Preço de custo *"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    min: "0",
    step: "0.01",
    value: f.cost,
    onChange: set("cost"),
    placeholder: "0,00"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Preço de venda *"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    min: "0",
    step: "0.01",
    value: f.price,
    onChange: set("price"),
    placeholder: "0,00"
  }))), margin !== null && /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: MUTED
    }
  }, "Margem de lucro estimada: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: GOLD_SOFT
    }
  }, margin, "%")), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end gap-2 pt-2"
  }, /*#__PURE__*/React.createElement(GhostButton, {
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement(GoldButton, {
    icon: "save",
    onClick: () => onSubmit(f)
  }, "Salvar alterações")));
}

/* ============================================================
   VENDAS
   ============================================================ */
function Vendas({
  products,
  saveProducts,
  clients,
  saveClients,
  sales,
  saveSales,
  settings,
  saveSettings,
  notify,
  setConfirm
}) {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [detail, setDetail] = useState(null);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter(s => showArchived ? true : s.active !== false).filter(s => {
      if (!q) return true;
      const client = clients.find(c => c.id === s.clientId);
      return s.number.toLowerCase().includes(q) || client && client.name.toLowerCase().includes(q) || s.items.some(i => i.name.toLowerCase().includes(q) || i.color.toLowerCase().includes(q) || i.size.toLowerCase().includes(q));
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sales, search, showArchived, clients]);
  const archiveSale = sale => {
    setConfirm({
      text: `Arquivar a venda ${sale.number}? O estoque das peças será restituído e ela sairá dos relatórios ativos.`,
      onConfirm: async () => {
        const restored = products.map(p => {
          const item = sale.items.find(i => i.productId === p.id);
          return item ? {
            ...p,
            qty: Number(p.qty) + item.qty
          } : p;
        });
        await saveProducts(restored);
        await saveSales(sales.map(s => s.id === sale.id ? {
          ...s,
          active: false
        } : s));
        notify("Venda arquivada e estoque restituído");
      }
    });
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Ponto de venda",
    title: "Vendas",
    right: /*#__PURE__*/React.createElement(GoldButton, {
      icon: "plus",
      onClick: () => setModal("new")
    }, "Nova venda")
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-2 mb-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative max-w-sm flex-1 min-w-[220px]"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15,
    className: "absolute left-3 top-1/2 -translate-y-1/2",
    style: {
      color: MUTED
    }
  }), /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Pesquisar venda, cliente ou produto…",
    value: search,
    onChange: e => setSearch(e.target.value),
    className: "pl-9"
  })), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-2 text-xs cursor-pointer select-none",
    style: {
      color: MUTED
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showArchived,
    onChange: e => setShowArchived(e.target.checked)
  }), " Mostrar arquivadas")), filtered.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "shoppingBag",
    text: "Nenhuma venda registrada ainda."
  }) : /*#__PURE__*/React.createElement(Card, {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-sm"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: MUTED
    }
  }, /*#__PURE__*/React.createElement("th", {
    className: "text-left font-normal px-5 py-3 text-xs uppercase tracking-wide"
  }, "Venda"), /*#__PURE__*/React.createElement("th", {
    className: "text-left font-normal px-2 py-3 text-xs uppercase tracking-wide"
  }, "Data"), /*#__PURE__*/React.createElement("th", {
    className: "text-left font-normal px-2 py-3 text-xs uppercase tracking-wide"
  }, "Cliente"), /*#__PURE__*/React.createElement("th", {
    className: "text-right font-normal px-2 py-3 text-xs uppercase tracking-wide"
  }, "Itens"), /*#__PURE__*/React.createElement("th", {
    className: "text-right font-normal px-2 py-3 text-xs uppercase tracking-wide"
  }, "Total"), /*#__PURE__*/React.createElement("th", {
    className: "text-right font-normal px-2 py-3 text-xs uppercase tracking-wide"
  }, "Lucro"), /*#__PURE__*/React.createElement("th", {
    className: "text-right font-normal px-5 py-3 text-xs uppercase tracking-wide"
  }, "Ações"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(s => {
    const client = clients.find(c => c.id === s.clientId);
    return /*#__PURE__*/React.createElement("tr", {
      key: s.id,
      style: {
        borderTop: `1px solid ${LINE}`,
        opacity: s.active === false ? 0.5 : 1
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-5 py-3",
      style: {
        color: GOLD_SOFT
      }
    }, s.number, s.active === false && /*#__PURE__*/React.createElement("span", {
      className: "ml-1.5 text-[10px]",
      style: {
        color: MUTED
      }
    }, "arquivada")), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-3",
      style: {
        color: "#c9c5b7"
      }
    }, fmtDate(s.date)), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-3",
      style: {
        color: "#e8e4d8"
      }
    }, client ? client.name : "—"), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-3 text-right",
      style: {
        color: "#c9c5b7"
      }
    }, s.items.reduce((a, i) => a + i.qty, 0)), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-3 text-right",
      style: {
        color: "#f0ede2"
      }
    }, brl(s.finalTotal)), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-3 text-right",
      style: {
        color: GREEN
      }
    }, brl(s.profit)), /*#__PURE__*/React.createElement("td", {
      className: "px-5 py-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-end gap-1.5"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setDetail(s),
      className: "p-1.5 rounded-sm hover:opacity-70",
      style: {
        color: MUTED
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 14
    })), s.active !== false && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      onClick: () => setModal(s),
      className: "p-1.5 rounded-sm hover:opacity-70",
      style: {
        color: MUTED
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "edit",
      size: 14
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => archiveSale(s),
      className: "p-1.5 rounded-sm hover:opacity-70",
      style: {
        color: MUTED
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "archive",
      size: 14
    }))))));
  })))), modal && /*#__PURE__*/React.createElement(SaleForm, {
    existing: modal === "new" ? null : modal,
    products: products,
    saveProducts: saveProducts,
    clients: clients,
    saveClients: saveClients,
    sales: sales,
    saveSales: saveSales,
    settings: settings,
    saveSettings: saveSettings,
    notify: notify,
    onClose: () => setModal(null)
  }), detail && /*#__PURE__*/React.createElement(Modal, {
    title: `Venda ${detail.number}`,
    onClose: () => setDetail(null)
  }, /*#__PURE__*/React.createElement(SaleDetail, {
    sale: detail,
    clients: clients
  })));
}
function SaleDetail({
  sale,
  clients
}) {
  const client = clients.find(c => c.id === sale.clientId);
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4 text-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Data"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#e8e4d8"
    }
  }, fmtDateTime(sale.date))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Cliente"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#e8e4d8"
    }
  }, client ? client.name : "—")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs uppercase tracking-wide mb-2",
    style: {
      color: MUTED
    }
  }, "Itens"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5"
  }, sale.items.map((i, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "flex justify-between px-3 py-2 rounded-sm",
    style: {
      background: PANEL2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#e8e4d8"
    }
  }, i.name, " · ", i.color, " · ", i.size, " × ", i.qty), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#f0ede2"
    }
  }, brl(i.qty * i.price)))))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 space-y-1.5",
    style: {
      borderTop: `1px solid ${LINE}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Valor bruto"), /*#__PURE__*/React.createElement("span", null, brl(sale.grossTotal))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Desconto"), /*#__PURE__*/React.createElement("span", null, brl(sale.discount))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between font-medium"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#e8e4d8"
    }
  }, "Total final"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#f0ede2"
    }
  }, brl(sale.finalTotal))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Custo"), /*#__PURE__*/React.createElement("span", null, brl(sale.totalCost))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Lucro"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: GREEN
    }
  }, brl(sale.profit)))));
}
function SaleForm({
  existing,
  products,
  saveProducts,
  clients,
  saveClients,
  sales,
  saveSales,
  settings,
  saveSettings,
  notify,
  onClose
}) {
  const workingStock = useMemo(() => {
    if (!existing) return products;
    return products.map(p => {
      const item = existing.items.find(i => i.productId === p.id);
      return item ? {
        ...p,
        qty: Number(p.qty) + item.qty
      } : p;
    });
  }, [products, existing]);
  const [clientId, setClientId] = useState(existing?.clientId || "");
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    cpf: "",
    email: "",
    instagram: ""
  });
  const [items, setItems] = useState(existing ? existing.items.map(i => ({
    ...i
  })) : []);
  const [pickProductId, setPickProductId] = useState("");
  const [pickQty, setPickQty] = useState(1);
  const [discount, setDiscount] = useState(existing?.discount || 0);
  const [clientSearch, setClientSearch] = useState("");
  function itemsQtyFor(list, productId) {
    return list.filter(i => i.productId === productId).reduce((a, i) => a + i.qty, 0);
  }
  const availableForPick = workingStock.filter(p => Number(p.qty) - itemsQtyFor(items, p.id) > 0);
  const addItem = () => {
    const p = workingStock.find(x => x.id === pickProductId);
    if (!p) return;
    const qty = Math.max(1, Math.round(Number(pickQty)));
    const already = itemsQtyFor(items, p.id);
    if (already + qty > Number(p.qty)) {
      notify("Estoque insuficiente. Não é possível concluir esta venda.");
      return;
    }
    const existingIdx = items.findIndex(i => i.productId === p.id);
    if (existingIdx >= 0) {
      const copy = [...items];
      copy[existingIdx] = {
        ...copy[existingIdx],
        qty: copy[existingIdx].qty + qty
      };
      setItems(copy);
    } else setItems([...items, {
      productId: p.id,
      name: p.name,
      color: p.color,
      size: p.size,
      qty,
      price: Number(p.price),
      cost: Number(p.cost)
    }]);
    setPickProductId("");
    setPickQty(1);
  };
  const updateItemQty = (idx, qty) => {
    const p = workingStock.find(x => x.id === items[idx].productId);
    const others = items.filter((_, i) => i !== idx).reduce((a, i) => i.productId === items[idx].productId ? a + i.qty : a, 0);
    const q = Math.max(1, Math.round(Number(qty) || 1));
    if (p && q > Number(p.qty) - others) {
      notify("Estoque insuficiente para essa quantidade.");
      return;
    }
    const copy = [...items];
    copy[idx] = {
      ...copy[idx],
      qty: q
    };
    setItems(copy);
  };
  const updateItemPrice = (idx, price) => {
    const copy = [...items];
    copy[idx] = {
      ...copy[idx],
      price: Number(price)
    };
    setItems(copy);
  };
  const removeItem = idx => setItems(items.filter((_, i) => i !== idx));
  const grossTotal = items.reduce((a, i) => a + i.qty * i.price, 0);
  const totalCost = items.reduce((a, i) => a + i.qty * i.cost, 0);
  const finalTotal = Math.max(0, grossTotal - Number(discount || 0));
  const profit = finalTotal - totalCost;
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
  const submit = async () => {
    if (items.length === 0) {
      notify("Adicione ao menos um item à venda");
      return;
    }
    let finalClientId = clientId;
    let updatedClients = clients;
    if (newClientMode) {
      if (!newClient.name) {
        notify("Informe o nome do cliente");
        return;
      }
      const c = {
        ...newClient,
        id: uid(),
        createdAt: todayISO()
      };
      updatedClients = [...clients, c];
      finalClientId = c.id;
      await saveClients(updatedClients);
    }
    let stock = existing ? products.map(p => {
      const old = existing.items.find(i => i.productId === p.id);
      return old ? {
        ...p,
        qty: Number(p.qty) + old.qty
      } : p;
    }) : products.map(p => ({
      ...p
    }));
    for (const it of items) {
      const idx = stock.findIndex(p => p.id === it.productId);
      if (idx < 0) continue;
      if (Number(stock[idx].qty) < it.qty) {
        notify("Estoque insuficiente. Não é possível concluir esta venda.");
        return;
      }
    }
    stock = stock.map(p => {
      const it = items.find(i => i.productId === p.id);
      return it ? {
        ...p,
        qty: Number(p.qty) - it.qty
      } : p;
    });
    await saveProducts(stock);
    if (existing) {
      const updated = {
        ...existing,
        clientId: finalClientId,
        items,
        discount: Number(discount || 0),
        grossTotal,
        totalCost,
        finalTotal,
        profit
      };
      await saveSales(sales.map(s => s.id === existing.id ? updated : s));
      notify("Venda atualizada com sucesso");
    } else {
      const counter = settings.saleCounter + 1;
      const sale = {
        id: uid(),
        number: `#${String(counter).padStart(3, "0")}`,
        date: todayISO(),
        clientId: finalClientId || null,
        items,
        discount: Number(discount || 0),
        grossTotal,
        totalCost,
        finalTotal,
        profit,
        active: true
      };
      await saveSales([...sales, sale]);
      await saveSettings({
        ...settings,
        saleCounter: counter
      });
      notify("Venda registrada com sucesso");
    }
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    title: existing ? `Editar venda ${existing.number}` : "Nova venda",
    onClose: onClose,
    wide: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] uppercase tracking-[0.12em]",
    style: {
      color: MUTED
    }
  }, "Cliente"), /*#__PURE__*/React.createElement("button", {
    className: "text-xs",
    style: {
      color: GOLD
    },
    onClick: () => setNewClientMode(v => !v)
  }, newClientMode ? "Selecionar existente" : "+ Novo cliente")), !newClientMode ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Pesquisar cliente…",
    value: clientSearch,
    onChange: e => setClientSearch(e.target.value),
    className: "mb-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "max-h-32 overflow-y-auto rounded-sm",
    style: {
      border: `1px solid ${LINE}`
    }
  }, filteredClients.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "px-3 py-2 text-xs",
    style: {
      color: MUTED
    }
  }, "Nenhum cliente encontrado"), filteredClients.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    onClick: () => setClientId(c.id),
    className: "w-full text-left px-3 py-2 text-sm flex items-center justify-between",
    style: {
      background: clientId === c.id ? "rgba(47,143,239,0.12)" : "transparent",
      color: "#e8e4d8"
    }
  }, c.name, " ", clientId === c.id && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13,
    style: {
      color: GOLD
    }
  }))))) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Nome *",
    value: newClient.name,
    onChange: e => setNewClient({
      ...newClient,
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Telefone",
    value: newClient.phone,
    onChange: e => setNewClient({
      ...newClient,
      phone: e.target.value
    })
  }), /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "CPF",
    value: newClient.cpf,
    onChange: e => setNewClient({
      ...newClient,
      cpf: e.target.value
    })
  }), /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "E-mail",
    value: newClient.email,
    onChange: e => setNewClient({
      ...newClient,
      email: e.target.value
    })
  }), /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Instagram",
    value: newClient.instagram,
    onChange: e => setNewClient({
      ...newClient,
      instagram: e.target.value
    }),
    className: "col-span-2"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] uppercase tracking-[0.12em]",
    style: {
      color: MUTED
    }
  }, "Itens da venda"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mt-2 mb-3"
  }, /*#__PURE__*/React.createElement(SelectInput, {
    value: pickProductId,
    onChange: e => setPickProductId(e.target.value),
    className: "flex-1 min-w-[200px]"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione um produto…"), availableForPick.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name, " · ", p.color, " · ", p.size, " (", Number(p.qty) - itemsQtyFor(items, p.id), " disp.)"))), /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    min: "1",
    value: pickQty,
    onChange: e => setPickQty(e.target.value),
    style: {
      width: 80
    }
  }), /*#__PURE__*/React.createElement(GhostButton, {
    icon: "plus",
    onClick: addItem
  }, "Adicionar item")), items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-xs px-3 py-4 text-center rounded-sm",
    style: {
      background: PANEL2,
      color: MUTED
    }
  }, "Nenhum item adicionado") : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, items.map((it, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "flex flex-wrap items-center gap-2 px-3 py-2 rounded-sm",
    style: {
      background: PANEL2
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm flex-1 min-w-[140px]",
    style: {
      color: "#e8e4d8"
    }
  }, it.name, " · ", it.color, " · ", it.size), /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    min: "1",
    value: it.qty,
    onChange: e => updateItemQty(idx, e.target.value),
    style: {
      width: 64
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "×"), /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    min: "0",
    step: "0.01",
    value: it.price,
    onChange: e => updateItemPrice(idx, e.target.value),
    style: {
      width: 90
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-sm w-20 text-right",
    style: {
      color: "#f0ede2"
    }
  }, brl(it.qty * it.price)), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeItem(idx),
    style: {
      color: MUTED
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 15
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Desconto (R$)"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    min: "0",
    step: "0.01",
    value: discount,
    onChange: e => setDiscount(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col justify-end gap-1 text-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Valor bruto"), /*#__PURE__*/React.createElement("span", null, brl(grossTotal))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between font-medium"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#e8e4d8"
    }
  }, "Total final"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#f0ede2"
    }
  }, brl(finalTotal))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, "Lucro estimado"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: GREEN
    }
  }, brl(profit))))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end gap-2 pt-2",
    style: {
      borderTop: `1px solid ${LINE}`
    }
  }, /*#__PURE__*/React.createElement(GhostButton, {
    onClick: onClose
  }, "Cancelar"), /*#__PURE__*/React.createElement(GoldButton, {
    icon: "save",
    onClick: submit
  }, existing ? "Salvar alterações" : "Concluir venda"))));
}

/* ============================================================
   CLIENTES / CRM
   ============================================================ */
function emptyClient() {
  return {
    id: null,
    name: "",
    phone: "",
    cpf: "",
    email: "",
    instagram: ""
  };
}
function Clientes({
  clients,
  saveClients,
  sales,
  notify,
  setConfirm
}) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sortBy, setSortBy] = useState("recent");
  const stats = useCallback(clientId => {
    const list = sales.filter(s => s.clientId === clientId && s.active !== false);
    const total = list.reduce((a, s) => a + s.finalTotal, 0);
    const dates = list.map(s => s.date).sort();
    return {
      count: list.length,
      total,
      first: dates[0] || null,
      last: dates[dates.length - 1] || null,
      sales: list
    };
  }, [sales]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = clients.filter(c => !q || c.name.toLowerCase().includes(q) || (c.phone || "").includes(q) || (c.cpf || "").includes(q) || (c.email || "").toLowerCase().includes(q) || (c.instagram || "").toLowerCase().includes(q));
    if (sortBy === "mostBought") list = [...list].sort((a, b) => stats(b.id).count - stats(a.id).count);
    if (sortBy === "mostSpent") list = [...list].sort((a, b) => stats(b.id).total - stats(a.id).total);
    if (sortBy === "recent") list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [clients, search, sortBy, stats]);
  const submit = async data => {
    if (!data.name) {
      notify("Informe o nome do cliente");
      return;
    }
    if (data.id) {
      await saveClients(clients.map(c => c.id === data.id ? data : c));
      notify("Alterações salvas com sucesso");
    } else {
      await saveClients([...clients, {
        ...data,
        id: uid(),
        createdAt: todayISO()
      }]);
      notify("Cliente adicionado");
    }
    setModal(null);
  };
  const remove = c => {
    setConfirm({
      text: `Tem certeza que deseja excluir o cliente "${c.name}"? O histórico de vendas será mantido, mas desvinculado.`,
      onConfirm: async () => {
        await saveClients(clients.filter(x => x.id !== c.id));
        notify("Cliente excluído");
      }
    });
  };
  if (profile) {
    const st = stats(profile.id);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      onClick: () => setProfile(null),
      className: "flex items-center gap-1.5 text-xs mb-4",
      style: {
        color: GOLD
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronLeft",
      size: 14
    }), " Voltar para clientes"), /*#__PURE__*/React.createElement(Card, {
      className: "p-6 mb-5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between flex-wrap gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      className: "text-2xl mb-1",
      style: {
        color: "#f5f2e8"
      }
    }, profile.name), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm",
      style: {
        color: "#c9c5b7"
      }
    }, profile.phone && /*#__PURE__*/React.createElement("span", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "phone",
      size: 13,
      style: {
        color: GOLD
      }
    }), profile.phone), profile.cpf && /*#__PURE__*/React.createElement("span", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "card",
      size: 13,
      style: {
        color: GOLD
      }
    }), profile.cpf), profile.email && /*#__PURE__*/React.createElement("span", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 13,
      style: {
        color: GOLD
      }
    }), profile.email), profile.instagram && /*#__PURE__*/React.createElement("span", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "instagram",
      size: 13,
      style: {
        color: GOLD
      }
    }), profile.instagram))), /*#__PURE__*/React.createElement(GhostButton, {
      icon: "edit",
      onClick: () => setModal(profile)
    }, "Editar"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Total de compras",
      value: st.count,
      icon: "shoppingBag"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Total gasto",
      value: brl(st.total),
      icon: "wallet"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Primeira compra",
      value: st.first ? fmtDate(st.first) : "—",
      icon: "calendar"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Última compra",
      value: st.last ? fmtDate(st.last) : "—",
      icon: "calendar"
    })), /*#__PURE__*/React.createElement(Card, {
      className: "p-5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] uppercase tracking-[0.16em] mb-4",
      style: {
        color: GOLD
      }
    }, "Histórico de compras"), st.sales.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
      text: "Ainda não há compras registradas."
    }) : /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, st.sales.sort((a, b) => new Date(b.date) - new Date(a.date)).map(s => /*#__PURE__*/React.createElement("div", {
      key: s.id,
      className: "rounded-sm px-4 py-3",
      style: {
        background: PANEL2
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between text-sm mb-2"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: GOLD_SOFT
      }
    }, s.number, " · ", fmtDate(s.date)), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#f0ede2"
      }
    }, brl(s.finalTotal))), /*#__PURE__*/React.createElement("div", {
      className: "text-xs space-y-1",
      style: {
        color: MUTED
      }
    }, s.items.map((i, idx) => /*#__PURE__*/React.createElement("div", {
      key: idx
    }, i.name, " · ", i.color, " · ", i.size, " × ", i.qty, " — ", brl(i.qty * i.price)))))))), modal && /*#__PURE__*/React.createElement(Modal, {
      title: "Editar cliente",
      onClose: () => setModal(null)
    }, /*#__PURE__*/React.createElement(ClientForm, {
      data: modal,
      onSubmit: d => {
        submit(d);
        setProfile(d);
      },
      onCancel: () => setModal(null)
    })));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Relacionamento",
    title: "Clientes",
    right: /*#__PURE__*/React.createElement(GoldButton, {
      icon: "plus",
      onClick: () => setModal(emptyClient())
    }, "Novo cliente")
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mb-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1 min-w-[220px] max-w-sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15,
    className: "absolute left-3 top-1/2 -translate-y-1/2",
    style: {
      color: MUTED
    }
  }), /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Nome, telefone, CPF, e-mail ou Instagram…",
    value: search,
    onChange: e => setSearch(e.target.value),
    className: "pl-9"
  })), /*#__PURE__*/React.createElement(SelectInput, {
    value: sortBy,
    onChange: e => setSortBy(e.target.value),
    className: "w-auto"
  }, /*#__PURE__*/React.createElement("option", {
    value: "recent"
  }, "Mais recentes"), /*#__PURE__*/React.createElement("option", {
    value: "mostBought"
  }, "Que mais compraram"), /*#__PURE__*/React.createElement("option", {
    value: "mostSpent"
  }, "Que mais gastaram"))), filtered.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "users",
    text: "Nenhum cliente cadastrado ainda."
  }) : /*#__PURE__*/React.createElement(Card, {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-sm"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: MUTED
    }
  }, /*#__PURE__*/React.createElement("th", {
    className: "text-left font-normal px-5 py-3 text-xs uppercase tracking-wide"
  }, "Nome"), /*#__PURE__*/React.createElement("th", {
    className: "text-left font-normal px-2 py-3 text-xs uppercase tracking-wide"
  }, "Telefone"), /*#__PURE__*/React.createElement("th", {
    className: "text-right font-normal px-2 py-3 text-xs uppercase tracking-wide"
  }, "Compras"), /*#__PURE__*/React.createElement("th", {
    className: "text-right font-normal px-2 py-3 text-xs uppercase tracking-wide"
  }, "Total gasto"), /*#__PURE__*/React.createElement("th", {
    className: "text-right font-normal px-5 py-3 text-xs uppercase tracking-wide"
  }, "Ações"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(c => {
    const st = stats(c.id);
    return /*#__PURE__*/React.createElement("tr", {
      key: c.id,
      style: {
        borderTop: `1px solid ${LINE}`
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-5 py-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setProfile(c),
      className: "text-left hover:underline",
      style: {
        color: "#f0ede2"
      }
    }, c.name)), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-3",
      style: {
        color: "#c9c5b7"
      }
    }, c.phone || "—"), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-3 text-right",
      style: {
        color: "#c9c5b7"
      }
    }, st.count), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-3 text-right",
      style: {
        color: GOLD_SOFT
      }
    }, brl(st.total)), /*#__PURE__*/React.createElement("td", {
      className: "px-5 py-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-end gap-1.5"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setModal(c),
      className: "p-1.5 rounded-sm hover:opacity-70",
      style: {
        color: MUTED
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "edit",
      size: 14
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => remove(c),
      className: "p-1.5 rounded-sm hover:opacity-70",
      style: {
        color: MUTED
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash",
      size: 14
    })))));
  })))), modal && /*#__PURE__*/React.createElement(Modal, {
    title: modal.id ? "Editar cliente" : "Novo cliente",
    onClose: () => setModal(null)
  }, /*#__PURE__*/React.createElement(ClientForm, {
    data: modal,
    onSubmit: submit,
    onCancel: () => setModal(null)
  })));
}
function ClientForm({
  data,
  onSubmit,
  onCancel
}) {
  const [f, setF] = useState(data);
  const set = k => e => setF(s => ({
    ...s,
    [k]: e.target.value
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nome *"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: f.name,
    onChange: set("name")
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Telefone"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: f.phone,
    onChange: set("phone")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "CPF"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: f.cpf,
    onChange: set("cpf")
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "E-mail"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "email",
    value: f.email,
    onChange: set("email")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Instagram"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: f.instagram,
    onChange: set("instagram"),
    placeholder: "@usuario"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end gap-2 pt-2"
  }, /*#__PURE__*/React.createElement(GhostButton, {
    onClick: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement(GoldButton, {
    icon: "save",
    onClick: () => onSubmit(f)
  }, "Salvar alterações")));
}

/* ============================================================
   FINANCEIRO
   ============================================================ */
function Financeiro({
  sales,
  products
}) {
  const [period, setPeriod] = useState("month");
  const [custom, setCustom] = useState({
    from: "",
    to: ""
  });
  const active = sales.filter(s => s.active !== false);
  const range = useMemo(() => {
    const now = new Date();
    let from,
      to = new Date(now);
    if (period === "today") from = new Date(now.getFullYear(), now.getMonth(), now.getDate());else if (period === "7d") {
      from = new Date(now);
      from.setDate(from.getDate() - 6);
    } else if (period === "month") from = new Date(now.getFullYear(), now.getMonth(), 1);else if (period === "lastMonth") {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === "3m") from = new Date(now.getFullYear(), now.getMonth() - 2, 1);else if (period === "custom") {
      from = custom.from ? new Date(custom.from) : new Date(now.getFullYear(), now.getMonth(), 1);
      to = custom.to ? new Date(custom.to + "T23:59:59") : now;
    }
    return {
      from,
      to
    };
  }, [period, custom]);
  const filteredSales = active.filter(s => {
    const d = new Date(s.date);
    return d >= range.from && d <= range.to;
  });
  const faturamento = filteredSales.reduce((a, s) => a + s.finalTotal, 0);
  const lucro = filteredSales.reduce((a, s) => a + s.profit, 0);
  const cmv = filteredSales.reduce((a, s) => a + s.totalCost, 0);
  const vendasCount = filteredSales.length;
  const ticketMedio = vendasCount ? faturamento / vendasCount : 0;
  const stockValue = products.reduce((a, p) => a + Number(p.qty) * Number(p.cost), 0);
  const potentialRevenue = products.reduce((a, p) => a + Number(p.qty) * Number(p.price), 0);
  const potentialProfit = potentialRevenue - stockValue;
  const dailySeries = useMemo(() => {
    const map = {};
    filteredSales.forEach(s => {
      const day = s.date.slice(0, 10);
      if (!map[day]) map[day] = {
        day,
        faturamento: 0,
        lucro: 0
      };
      map[day].faturamento += s.finalTotal;
      map[day].lucro += s.profit;
    });
    return Object.values(map).sort((a, b) => a.day.localeCompare(b.day)).map(d => ({
      ...d,
      label: fmtDate(d.day + "T00:00:00")
    }));
  }, [filteredSales]);
  const productSales = useMemo(() => {
    const map = {};
    filteredSales.forEach(s => s.items.forEach(i => {
      const key = `${i.name} ${i.color}/${i.size}`;
      map[key] = (map[key] || 0) + i.qty;
    }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredSales]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Movimento financeiro",
    title: "Financeiro"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mb-6"
  }, [{
    id: "today",
    label: "Hoje"
  }, {
    id: "7d",
    label: "Últimos 7 dias"
  }, {
    id: "month",
    label: "Este mês"
  }, {
    id: "lastMonth",
    label: "Mês anterior"
  }, {
    id: "3m",
    label: "Últimos 3 meses"
  }, {
    id: "custom",
    label: "Personalizado"
  }].map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => setPeriod(p.id),
    className: "px-3 py-1.5 rounded-sm text-xs tracking-wide",
    style: {
      background: period === p.id ? GOLD : "transparent",
      color: period === p.id ? INK : "#c9c5b7",
      border: `1px solid ${period === p.id ? GOLD : LINE}`
    }
  }, p.label))), period === "custom" && /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mb-6 max-w-sm"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "date",
    value: custom.from,
    onChange: e => setCustom({
      ...custom,
      from: e.target.value
    })
  }), /*#__PURE__*/React.createElement(TextInput, {
    type: "date",
    value: custom.to,
    onChange: e => setCustom({
      ...custom,
      to: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Faturamento",
    value: brl(faturamento),
    icon: "wallet"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Lucro",
    value: brl(lucro),
    icon: "trendingUp",
    accent: GREEN
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Custo (CMV)",
    value: brl(cmv),
    icon: "package"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Ticket médio",
    value: brl(ticketMedio),
    icon: "shoppingBag"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Vendas no período",
    value: vendasCount,
    icon: "shoppingBag"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Valor atual do estoque",
    value: brl(stockValue),
    icon: "package"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Potencial de faturamento",
    value: brl(potentialRevenue),
    icon: "trendingUp"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Potencial de lucro",
    value: brl(potentialProfit),
    icon: "trendingUp",
    accent: GREEN
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Faturamento e lucro"), /*#__PURE__*/React.createElement(SimpleLineChart, {
    data: dailySeries,
    series: [{
      key: "faturamento",
      color: "#c9c5b7",
      label: "Faturamento"
    }, {
      key: "lucro",
      color: GREEN,
      label: "Lucro"
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Produtos mais vendidos"), /*#__PURE__*/React.createElement(SimpleBarList, {
    data: productSales,
    valueFmt: v => `${v} un.`
  }))));
}

/* ============================================================
   RELATORIOS
   ============================================================ */
function Relatorios({
  products,
  sales,
  clients,
  settings
}) {
  const active = sales.filter(s => s.active !== false);
  const totalQty = products.reduce((a, p) => a + Number(p.qty), 0);
  const stockCost = products.reduce((a, p) => a + Number(p.qty) * Number(p.cost), 0);
  const stockPotential = products.reduce((a, p) => a + Number(p.qty) * Number(p.price), 0);
  const potentialProfit = stockPotential - stockCost;
  const lowStock = products.filter(p => Number(p.qty) <= Number(settings.lowStockThreshold) && Number(p.qty) > 0);
  const outStock = products.filter(p => Number(p.qty) <= 0);
  const totalSold = active.reduce((a, s) => a + s.items.reduce((x, i) => x + i.qty, 0), 0);
  const faturamento = active.reduce((a, s) => a + s.finalTotal, 0);
  const lucro = active.reduce((a, s) => a + s.profit, 0);
  const topProducts = useMemo(() => {
    const map = {};
    active.forEach(s => s.items.forEach(i => {
      const key = `${i.name} · ${i.color} · ${i.size}`;
      map[key] = (map[key] || 0) + i.qty;
    }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [active]);
  const clientStats = clients.map(c => {
    const list = active.filter(s => s.clientId === c.id);
    return {
      c,
      count: list.length,
      total: list.reduce((a, s) => a + s.finalTotal, 0)
    };
  });
  const topByCount = [...clientStats].sort((a, b) => b.count - a.count).filter(x => x.count > 0).slice(0, 5);
  const topBySpent = [...clientStats].sort((a, b) => b.total - a.total).filter(x => x.total > 0).slice(0, 5);
  const avgPurchases = clients.length ? (active.length / clients.length).toFixed(1) : "0";
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Visão consolidada",
    title: "Relatórios"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Estoque"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 text-sm"
  }, /*#__PURE__*/React.createElement(Row, {
    l: "Peças totais",
    v: totalQty
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Valor pelo custo",
    v: brl(stockCost)
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Valor potencial de venda",
    v: brl(stockPotential)
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Lucro potencial",
    v: brl(potentialProfit),
    kind: "profit"
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Produtos com estoque baixo",
    v: lowStock.length,
    warn: lowStock.length > 0
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Produtos sem estoque",
    v: outStock.length,
    danger: outStock.length > 0
  }))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Vendas"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 text-sm"
  }, /*#__PURE__*/React.createElement(Row, {
    l: "Número de vendas",
    v: active.length
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Peças vendidas",
    v: totalSold
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Faturamento",
    v: brl(faturamento)
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Lucro",
    v: brl(lucro),
    kind: "profit"
  }))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Clientes"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 text-sm"
  }, /*#__PURE__*/React.createElement(Row, {
    l: "Total de clientes",
    v: clients.length
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Média de compras por cliente",
    v: avgPurchases
  })))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-4"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Produtos mais vendidos"), topProducts.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    text: "Sem vendas registradas."
  }) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, topProducts.map(([name, qty], i) => /*#__PURE__*/React.createElement("div", {
    key: name,
    className: "flex justify-between text-sm"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#c9c5b7"
    }
  }, i + 1, ". ", name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: GOLD_SOFT
    }
  }, qty, " un."))))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Clientes que mais compraram"), topByCount.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    text: "Sem dados."
  }) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, topByCount.map((x, i) => /*#__PURE__*/React.createElement("div", {
    key: x.c.id,
    className: "flex justify-between text-sm"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#c9c5b7"
    }
  }, i + 1, ". ", x.c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: GOLD_SOFT
    }
  }, x.count, " compras"))))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Clientes que mais gastaram"), topBySpent.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    text: "Sem dados."
  }) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, topBySpent.map((x, i) => /*#__PURE__*/React.createElement("div", {
    key: x.c.id,
    className: "flex justify-between text-sm"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#c9c5b7"
    }
  }, i + 1, ". ", x.c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: GOLD_SOFT
    }
  }, brl(x.total))))))));
}
function Row({
  l,
  v,
  kind,
  warn,
  danger
}) {
  let color = "#f0ede2";
  if (kind === "profit") color = GREEN;
  if (warn) color = GOLD;
  if (danger) color = RED;
  return /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      color
    }
  }, v));
}

/* ============================================================
   CONFIGURAÇÕES
   ============================================================ */
function Config({
  settings,
  saveSettings,
  notify,
  products,
  clients,
  sales
}) {
  const [f, setF] = useState(settings);
  const fileRef = useRef(null);
  const onBanner = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setF(s => ({
      ...s,
      banner: reader.result
    }));
    reader.readAsDataURL(file);
  };
  const submit = async () => {
    await saveSettings(f);
    notify("Configurações salvas com sucesso");
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Preferências",
    title: "Configurações"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-5 space-y-4"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nome da loja"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: f.storeName,
    onChange: e => setF({
      ...f,
      storeName: e.target.value
    })
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Limite para alerta de estoque baixo",
    hint: "Quantidade igual ou inferior gera um alerta"
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "number",
    min: "0",
    value: f.lowStockThreshold,
    onChange: e => setF({
      ...f,
      lowStockThreshold: Number(e.target.value)
    })
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Banner da loja"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-24 h-14 rounded-sm flex items-center justify-center",
    style: {
      background: f.banner ? `url(${f.banner}) center/cover no-repeat` : PANEL2,
      border: `1px solid ${LINE}`
    }
  }, !f.banner && /*#__PURE__*/React.createElement(Icon, {
    name: "image",
    size: 16,
    style: {
      color: MUTED
    }
  })), /*#__PURE__*/React.createElement(GhostButton, {
    icon: "image",
    onClick: () => fileRef.current?.click()
  }, "Escolher imagem"), /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: "image/*",
    className: "hidden",
    onChange: onBanner
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end pt-2"
  }, /*#__PURE__*/React.createElement(GoldButton, {
    icon: "save",
    onClick: submit
  }, "Salvar alterações"))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] uppercase tracking-[0.16em] mb-4",
    style: {
      color: GOLD
    }
  }, "Resumo do sistema"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 text-sm"
  }, /*#__PURE__*/React.createElement(Row, {
    l: "Produtos cadastrados",
    v: products.length
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Clientes cadastrados",
    v: clients.length
  }), /*#__PURE__*/React.createElement(Row, {
    l: "Vendas registradas",
    v: sales.length
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-4",
    style: {
      color: MUTED
    }
  }, "Todos os dados ficam salvos automaticamente neste navegador (localStorage) e continuam disponíveis mesmo após fechar e reabrir o arquivo."))));
}
/* O root.render agora fica em assets/js/auth-app.js, que decide entre
   mostrar a tela de login ou o App (CRM), dependendo da sessão. */
