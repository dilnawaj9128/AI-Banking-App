import { useState, useEffect, useRef, useCallback } from "react";

// ── API CONFIG ────────────────────────────────────────────────────
// Change this to your backend URL when deploying
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── API HELPER ────────────────────────────────────────────────────
async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

// ── Styles ────────────────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Mono:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy:   #0a0e1a; --navy2:  #0f1629; --navy3:  #151d35;
      --gold:   #c9a84c; --gold2:  #e8c97a; --gold3:  #f5e0a0;
      --silver: #8892aa; --white:  #eef1f8; --red:    #e05252;
      --green:  #52c07a; --border: rgba(201,168,76,0.18);
    }
    html, body, #root { height: 100%; background: var(--navy); }
    body { font-family: 'DM Mono', monospace; color: var(--white); overflow-x: hidden; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--navy2); }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }
    .grid-bg {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image: linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
    .orb1 { width: 400px; height: 400px; background: rgba(201,168,76,0.06); top: -100px; right: -100px; }
    .orb2 { width: 300px; height: 300px; background: rgba(82,192,122,0.04); bottom: 100px; left: -80px; }

    /* Auth */
    .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; padding: 24px; }
    .auth-card { width: 100%; max-width: 420px; background: var(--navy2); border: 1px solid var(--border); border-radius: 2px; padding: 48px 40px; position: relative; animation: fadeUp 0.6s ease both; }
    .auth-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
    .auth-logo { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: var(--gold2); text-align: center; margin-bottom: 6px; }
    .auth-tagline { text-align: center; font-size: 10px; letter-spacing: 3px; color: var(--silver); text-transform: uppercase; margin-bottom: 40px; }
    .auth-tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
    .auth-tab { flex: 1; padding: 10px; background: none; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--silver); transition: all 0.2s; }
    .auth-tab.active { color: var(--gold2); border-bottom: 2px solid var(--gold); margin-bottom: -1px; }
    .field { margin-bottom: 20px; }
    .field label { display: block; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--silver); margin-bottom: 8px; }
    .field input { width: 100%; background: var(--navy3); border: 1px solid var(--border); border-radius: 1px; padding: 12px 16px; color: var(--white); font-family: 'DM Mono', monospace; font-size: 13px; outline: none; transition: border-color 0.2s; }
    .field input:focus { border-color: var(--gold); }
    .btn-gold { width: 100%; padding: 14px; background: linear-gradient(135deg, var(--gold), var(--gold2)); border: none; border-radius: 1px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--navy); font-weight: 500; transition: all 0.2s; margin-top: 8px; }
    .btn-gold:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(201,168,76,0.3); }
    .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }
    .err { color: var(--red); font-size: 11px; margin-top: 12px; text-align: center; letter-spacing: 1px; }

    /* App layout */
    .app-layout { display: flex; min-height: 100vh; position: relative; z-index: 1; }
    .sidebar { width: 220px; flex-shrink: 0; background: var(--navy2); border-right: 1px solid var(--border); display: flex; flex-direction: column; animation: slideRight 0.4s ease both; }
    .sidebar-logo { padding: 28px 24px 20px; border-bottom: 1px solid var(--border); }
    .sidebar-logo .mark { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: var(--gold2); }
    .sidebar-logo .sub { font-size: 8px; letter-spacing: 3px; color: var(--silver); text-transform: uppercase; }
    .sidebar-user { padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold2)); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--navy); flex-shrink: 0; }
    .user-name { font-size: 11px; color: var(--white); }
    .user-email { font-size: 9px; color: var(--silver); }
    .nav { flex: 1; padding: 16px 0; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 24px; cursor: pointer; transition: all 0.15s; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--silver); border-left: 2px solid transparent; }
    .nav-item:hover { color: var(--white); background: rgba(201,168,76,0.05); }
    .nav-item.active { color: var(--gold2); border-left-color: var(--gold); background: rgba(201,168,76,0.08); }
    .nav-icon { font-size: 15px; width: 18px; text-align: center; }
    .logout-btn { margin: 16px; padding: 10px; background: none; border: 1px solid rgba(224,82,82,0.3); border-radius: 1px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--red); transition: all 0.2s; }
    .logout-btn:hover { background: rgba(224,82,82,0.1); }
    .main { flex: 1; overflow-y: auto; padding: 32px; }
    .page-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; letter-spacing: 2px; color: var(--white); margin-bottom: 4px; }
    .page-sub { font-size: 10px; letter-spacing: 2px; color: var(--silver); text-transform: uppercase; margin-bottom: 32px; }

    /* Cards */
    .cards-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: var(--navy2); border: 1px solid var(--border); border-radius: 2px; padding: 24px; position: relative; overflow: hidden; animation: fadeUp 0.5s ease both; }
    .card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: 0.4; }
    .card-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--silver); margin-bottom: 12px; }
    .card-value { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 600; color: var(--gold2); letter-spacing: 1px; }
    .card-value.small { font-size: 24px; }
    .card-icon { position: absolute; top: 20px; right: 20px; font-size: 22px; opacity: 0.3; }

    /* Sections */
    .section { background: var(--navy2); border: 1px solid var(--border); border-radius: 2px; padding: 28px; margin-bottom: 24px; animation: fadeUp 0.5s ease both; }
    .section-title { font-family: 'Cormorant Garamond', serif; font-size: 18px; letter-spacing: 2px; color: var(--white); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    .transfer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .btn-outline { padding: 12px 28px; background: none; border: 1px solid var(--border); border-radius: 1px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--silver); transition: all 0.2s; }
    .btn-outline:hover { border-color: var(--gold); color: var(--gold2); }

    /* Transactions */
    .tx-list { display: flex; flex-direction: column; gap: 10px; }
    .tx-row { display: flex; align-items: center; gap: 16px; padding: 14px 16px; background: var(--navy3); border-radius: 1px; border: 1px solid rgba(201,168,76,0.08); transition: border-color 0.15s; }
    .tx-row:hover { border-color: var(--border); }
    .tx-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tx-dot.out { background: var(--red); box-shadow: 0 0 8px var(--red); }
    .tx-dot.in { background: var(--green); box-shadow: 0 0 8px var(--green); }
    .tx-info { flex: 1; }
    .tx-type { font-size: 11px; color: var(--white); text-transform: capitalize; }
    .tx-meta { font-size: 9px; color: var(--silver); margin-top: 2px; }
    .tx-amount { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; }
    .tx-amount.out { color: var(--red); }
    .tx-amount.in { color: var(--green); }
    .empty { text-align: center; padding: 40px; color: var(--silver); font-size: 11px; letter-spacing: 2px; }

    /* Chat */
    .chat-wrap { display: flex; flex-direction: column; height: 480px; }
    .chat-msgs { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .msg { display: flex; gap: 10px; animation: fadeUp 0.3s ease both; }
    .msg.user { flex-direction: row-reverse; }
    .msg-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; }
    .msg-avatar.bot { background: linear-gradient(135deg, var(--gold), var(--gold2)); color: var(--navy); }
    .msg-avatar.user-av { background: var(--navy3); border: 1px solid var(--border); }
    .bubble { max-width: 75%; padding: 10px 14px; border-radius: 1px; font-size: 12px; line-height: 1.6; }
    .bubble.bot { background: var(--navy3); border: 1px solid var(--border); color: var(--white); }
    .bubble.user-b { background: linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.1)); border: 1px solid rgba(201,168,76,0.3); color: var(--gold3); }
    .chat-input-row { display: flex; gap: 10px; padding: 16px; border-top: 1px solid var(--border); }
    .chat-input { flex: 1; background: var(--navy3); border: 1px solid var(--border); border-radius: 1px; padding: 10px 14px; color: var(--white); font-family: 'DM Mono', monospace; font-size: 12px; outline: none; transition: border-color 0.2s; }
    .chat-input:focus { border-color: var(--gold); }
    .btn-send { padding: 10px 20px; background: linear-gradient(135deg, var(--gold), var(--gold2)); border: none; border-radius: 1px; cursor: pointer; color: var(--navy); font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 1px; transition: all 0.2s; }
    .btn-send:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,168,76,0.3); }
    .typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
    .typing span { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; animation: bounce 1.2s infinite; }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }

    /* Badge */
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 1px; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
    .badge.success { background: rgba(82,192,122,0.1); color: var(--green); border: 1px solid rgba(82,192,122,0.3); }
    .badge.error { background: rgba(224,82,82,0.1); color: var(--red); border: 1px solid rgba(224,82,82,0.3); }

    /* Loading skeleton */
    .skeleton { background: linear-gradient(90deg, var(--navy3) 25%, var(--navy2) 50%, var(--navy3) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 2px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Connection status */
    .conn-status { position: fixed; bottom: 16px; right: 16px; z-index: 100; padding: 8px 14px; border-radius: 1px; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
    .conn-dot { width: 6px; height: 6px; border-radius: 50%; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; display: inline-block; }
    .flex-end { display: flex; justify-content: flex-end; margin-top: 16px; }
  `}</style>
);

// ── Connection Status Badge ───────────────────────────────────────
function ConnStatus({ online }) {
  return (
    <div className="conn-status" style={{
      background: online ? "rgba(82,192,122,0.1)" : "rgba(224,82,82,0.1)",
      border: `1px solid ${online ? "rgba(82,192,122,0.3)" : "rgba(224,82,82,0.3)"}`,
      color: online ? "var(--green)" : "var(--red)"
    }}>
      <div className="conn-dot" style={{ background: online ? "var(--green)" : "var(--red)" }} />
      {online ? "Backend Connected" : "Backend Offline"}
    </div>
  );
}

// ── Auth Page ─────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [backendOnline, setBackendOnline] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${API.replace("/api", "")}/health`)
      .then(r => r.json())
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      if (tab === "login") {
        const data = await apiFetch("/login", {
          method: "POST",
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        // Store token in localStorage for persistence
        localStorage.setItem("aurex_token", data.token);
        localStorage.setItem("aurex_user", JSON.stringify(data.user));
        onLogin(data.user, data.token);
      } else {
        await apiFetch("/register", {
          method: "POST",
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
        });
        setTab("login");
        setErr("");
        setForm(f => ({ ...f, password: "" }));
      }
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  const onKey = e => e.key === "Enter" && submit();

  return (
    <div className="auth-wrap">
      {backendOnline !== null && <ConnStatus online={backendOnline} />}
      <div className="auth-card">
        <div className="auth-logo">AUREX</div>
        <div className="auth-tagline">Private Digital Banking</div>

        {backendOnline === false && (
          <div style={{ background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.3)", borderRadius: 1, padding: "10px 14px", marginBottom: 20, fontSize: 10, color: "var(--red)", letterSpacing: 1 }}>
            ⚠ Backend offline — run: <code style={{ color: "var(--gold2)" }}>cd backend && npm start</code>
          </div>
        )}

        <div className="auth-tabs">
          <button className={`auth-tab ${tab==="login"?"active":""}`} onClick={() => { setTab("login"); setErr(""); }}>Sign In</button>
          <button className={`auth-tab ${tab==="register"?"active":""}`} onClick={() => { setTab("register"); setErr(""); }}>Register</button>
        </div>

        {tab === "register" && (
          <div className="field">
            <label>Full Name</label>
            <input placeholder="Dilnawaz Khan" value={form.name} onChange={set("name")} onKeyDown={onKey} />
          </div>
        )}
        <div className="field">
          <label>Email Address</label>
          <input type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} onKeyDown={onKey} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={onKey} />
        </div>
        {err && <div className="err">{err}</div>}
        <button className="btn-gold" onClick={submit} disabled={loading}>
          {loading ? <span className="spin">⟳</span> : tab === "login" ? "Access Account" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
function Dashboard({ user, token, transactions, balance, loadingData }) {
  const totalIn  = transactions.filter(t => t.type === "received").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === "transfer").reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div className="page-title">Good day, {user.name.split(" ")[0]}</div>
      <div className="page-sub">Account Overview</div>

      <div className="cards-row">
        {[
          { label: "Available Balance", value: `₹${balance.toLocaleString()}`, icon: "◈", color: "var(--gold2)", delay: 0 },
          { label: "Total Sent",        value: `₹${totalOut.toLocaleString()}`, icon: "↑", color: "var(--red)",   delay: 80 },
          { label: "Total Received",    value: `₹${totalIn.toLocaleString()}`,  icon: "↓", color: "var(--green)", delay: 160 },
          { label: "Transactions",      value: transactions.length,             icon: "≡", color: "var(--white)", delay: 240 },
        ].map(c => (
          <div className="card" key={c.label} style={{ animationDelay: `${c.delay}ms` }}>
            <div className="card-icon">{c.icon}</div>
            <div className="card-label">{c.label}</div>
            {loadingData
              ? <div className="skeleton" style={{ height: 40, width: "80%", marginTop: 8 }} />
              : <div className="card-value small" style={{ color: c.color }}>{c.value}</div>
            }
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-title">Recent Activity</div>
        {loadingData
          ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 10 }} />)
          : transactions.length === 0
            ? <div className="empty">No transactions yet</div>
            : <TxList items={[...transactions].reverse().slice(0, 5)} />
        }
      </div>
    </div>
  );
}

// ── Transfer ──────────────────────────────────────────────────────
function Transfer({ token, onTransferDone }) {
  const [form, setForm]   = useState({ email: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]     = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.email || !form.amount) return setMsg({ type: "error", text: "Fill all fields" });
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) return setMsg({ type: "error", text: "Invalid amount" });

    setLoading(true); setMsg(null);
    try {
      await apiFetch("/transfer", {
        method: "POST",
        body: JSON.stringify({ toEmail: form.email, amount: amt })
      }, token);
      setMsg({ type: "success", text: `₹${amt.toLocaleString()} sent to ${form.email}` });
      setForm({ email: "", amount: "" });
      onTransferDone(); // refresh balance + transactions
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-title">Transfer Funds</div>
      <div className="page-sub">Instant money transfer</div>
      <div className="section">
        <div className="section-title">Send Money</div>
        <div className="transfer-grid">
          <div className="field">
            <label>Recipient Email</label>
            <input placeholder="recipient@email.com" value={form.email} onChange={set("email")} />
          </div>
          <div className="field">
            <label>Amount (₹)</label>
            <input type="number" placeholder="0.00" value={form.amount} onChange={set("amount")} />
          </div>
        </div>
        {msg && <div className={`badge ${msg.type}`}>{msg.type === "success" ? "✓" : "✕"} {msg.text}</div>}
        <div className="flex-end">
          <button className="btn-gold" style={{ width: "auto", paddingLeft: 32, paddingRight: 32 }} onClick={submit} disabled={loading}>
            {loading ? <span className="spin">⟳</span> : "Send Transfer"}
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Quick Amount</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["500", "1000", "2000", "5000", "10000"].map(a => (
            <button key={a} className="btn-outline" onClick={() => setForm(f => ({ ...f, amount: a }))}>
              ₹{parseInt(a).toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Transactions ──────────────────────────────────────────────────
function TxList({ items }) {
  if (!items.length) return <div className="empty">No transactions found</div>;
  return (
    <div className="tx-list">
      {items.map((tx, i) => {
        const isOut = tx.type === "transfer";
        return (
          <div className="tx-row" key={i}>
            <div className={`tx-dot ${isOut ? "out" : "in"}`} />
            <div className="tx-info">
              <div className="tx-type">{isOut ? `Sent → ${tx.to}` : `Received ← ${tx.from}`}</div>
              <div className="tx-meta">{new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <div className={`tx-amount ${isOut ? "out" : "in"}`}>
              {isOut ? "−" : "+"} ₹{tx.amount.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Transactions({ transactions, loadingData }) {
  return (
    <div>
      <div className="page-title">Transactions</div>
      <div className="page-sub">{transactions.length} total records</div>
      <div className="section">
        <div className="section-title">All Transactions</div>
        {loadingData
          ? [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 10 }} />)
          : <TxList items={[...transactions].reverse()} />
        }
      </div>
    </div>
  );
}

// ── AI Chat (connected to /api/ai-chat) ───────────────────────────
function AIChat({ user, token, balance, transactions }) {
  const [msgs, setMsgs] = useState([
    { role: "bot", text: `Welcome, ${user.name}. I'm your Aurex AI assistant. Ask me about your balance, transactions, transfers, loans, or anything banking-related.` }
  ]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", text: userMsg }]);
    setTyping(true);

    try {
      // Call real backend AI endpoint
      const data = await apiFetch("/ai-chat", {
        method: "POST",
        body: JSON.stringify({ message: userMsg })
      }, token);
      setTyping(false);
      setMsgs(m => [...m, { role: "bot", text: data.reply }]);
    } catch (e) {
      setTyping(false);
      setMsgs(m => [...m, { role: "bot", text: `Error: ${e.message}. Make sure backend is running.` }]);
    }
  };

  return (
    <div>
      <div className="page-title">AI Assistant</div>
      <div className="page-sub">Powered by Aurex Intelligence</div>

      <div className="section" style={{ padding: 0 }}>
        <div className="chat-wrap">
          <div className="chat-msgs">
            {msgs.map((m, i) => (
              <div className={`msg ${m.role === "user" ? "user" : ""}`} key={i}>
                <div className={`msg-avatar ${m.role === "bot" ? "bot" : "user-av"}`}>
                  {m.role === "bot" ? "◉" : user.name[0]}
                </div>
                <div className={`bubble ${m.role === "bot" ? "bot" : "user-b"}`}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="msg">
                <div className="msg-avatar bot">◉</div>
                <div className="bubble bot"><div className="typing"><span /><span /><span /></div></div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="chat-input-row">
            <input className="chat-input" placeholder="Ask about balance, transactions, loans..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()} />
            <button className="btn-send" onClick={send}>Send</button>
          </div>
        </div>
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Quick Queries</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["What is my balance?", "Show my transactions", "How to transfer?", "Loan eligibility?", "Report fraud"].map(q => (
            <button key={q} className="btn-outline" style={{ fontSize: 9, padding: "8px 14px" }}
              onClick={() => setInput(q)}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",    icon: "◈", label: "Dashboard" },
  { id: "transfer",     icon: "↗", label: "Transfer" },
  { id: "transactions", icon: "≡", label: "History" },
  { id: "ai",           icon: "◉", label: "AI Assistant" },
];

function AppShell({ user, token, onLogout }) {
  const [page, setPage]           = useState("dashboard");
  const [balance, setBalance]     = useState(0);
  const [transactions, setTx]     = useState([]);
  const [loadingData, setLoading] = useState(true);

  // ── Fetch balance + transactions from backend ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [balData, txData] = await Promise.all([
        apiFetch("/balance", {}, token),
        apiFetch("/transactions", {}, token)
      ]);
      setBalance(balData.balance);
      setTx(txData);
    } catch (e) {
      console.error("Fetch error:", e.message);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("aurex_token");
    localStorage.removeItem("aurex_user");
    onLogout();
  };

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="mark">AUREX</div>
          <div className="sub">Private Banking</div>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map(n => (
            <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </div>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>⎋ Sign Out</button>
      </div>

      <div className="main">
        {page === "dashboard"    && <Dashboard user={user} token={token} transactions={transactions} balance={balance} loadingData={loadingData} />}
        {page === "transfer"     && <Transfer token={token} onTransferDone={fetchData} />}
        {page === "transactions" && <Transactions transactions={transactions} loadingData={loadingData} />}
        {page === "ai"           && <AIChat user={user} token={token} balance={balance} transactions={transactions} />}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("aurex_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("aurex_token"));

  const handleLogin  = (u, t) => { setUser(u); setToken(t); };
  const handleLogout = ()     => { setUser(null); setToken(null); };

  return (
    <>
      <G />
      <div className="grid-bg" />
      <div className="orb orb1" />
      <div className="orb orb2" />
      {!user
        ? <AuthPage onLogin={handleLogin} />
        : <AppShell user={user} token={token} onLogout={handleLogout} />
      }
    </>
  );
}
