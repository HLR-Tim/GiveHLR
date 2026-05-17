import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://pigive.onrender.com/api";

const CATEGORIES = ["All", "General", "Gaming", "Education", "Food", "Tech", "Music", "Sports", "Fashion", "Other"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --gold: #f5a623; --gold-dim: #c47f0f; --dark: #0b0b12; --card: #13131f;
    --card2: #1a1a2e; --border: rgba(245,166,35,0.2); --border-hot: rgba(245,166,35,0.7);
    --text: #e8e8f0; --muted: #7070a0; --radius: 16px; --nav-h: 64px; --tab-h: 64px;
  }
  body { background: var(--dark); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: var(--nav-h); background: rgba(11,11,18,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; }
  .nav-logo { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; background: linear-gradient(135deg, #f5a623, #ffcf70); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .nav-right { display: flex; align-items: center; gap: 10px; }
  .nav-user { font-size: 13px; font-weight: 500; color: var(--gold); background: rgba(245,166,35,0.1); border: 1px solid var(--border-hot); padding: 6px 12px; border-radius: 20px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
  .btn-login { background: var(--gold); color: #000; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: transform 0.15s; }
  .btn-login:active { transform: scale(0.96); }
  .btn-notif { background: transparent; border: 1px solid var(--border); color: var(--text); width: 38px; height: 38px; border-radius: 50%; cursor: pointer; font-size: 16px; position: relative; display: flex; align-items: center; justify-content: center; }
  .notif-badge { position: absolute; top: -4px; right: -4px; background: #ff3b5c; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .notif-drawer { position: fixed; top: var(--nav-h); right: 0; width: min(340px, 100vw); background: var(--card); border-left: 1px solid var(--border); border-bottom: 1px solid var(--border); border-radius: 0 0 0 var(--radius); z-index: 99; max-height: 60vh; overflow-y: auto; animation: slideIn 0.2s ease; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .notif-header { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .notif-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: var(--gold); }
  .btn-clear { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 12px; }
  .notif-item { padding: 12px 18px; border-bottom: 1px solid var(--border); }
  .notif-msg { font-size: 13px; line-height: 1.4; }
  .notif-time { font-size: 11px; color: var(--muted); margin-top: 4px; }
  .notif-empty { padding: 20px 18px; color: var(--muted); font-size: 14px; text-align: center; }
  .tab-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; height: var(--tab-h); background: rgba(11,11,18,0.92); backdrop-filter: blur(20px); border-top: 1px solid var(--border); display: flex; align-items: center; }
  .tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer; padding: 8px 0; border: none; background: transparent; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 10px; transition: color 0.2s; -webkit-tap-highlight-color: transparent; }
  .tab-item.active { color: var(--gold); }
  .tab-icon { font-size: 20px; line-height: 1; }
  .tab-fab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; border: none; background: transparent; -webkit-tap-highlight-color: transparent; }
  .tab-fab-inner { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #f5a623, #ffcf70); display: flex; align-items: center; justify-content: center; font-size: 24px; margin-top: -24px; box-shadow: 0 4px 20px rgba(245,166,35,0.5); transition: transform 0.15s; }
  .tab-fab-inner:active { transform: scale(0.93); }
  .page { padding: calc(var(--nav-h) + 20px) 16px calc(var(--tab-h) + 20px); max-width: 600px; margin: 0 auto; animation: fadeUp 0.3s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .page-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; margin-bottom: 6px; background: linear-gradient(135deg, #fff 40%, #f5a623); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .page-sub { color: var(--muted); font-size: 14px; margin-bottom: 24px; }
  .hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border: 1px solid var(--border-hot); border-radius: var(--radius); padding: 28px 24px; margin-bottom: 24px; position: relative; overflow: hidden; }
  .hero::before { content: '🎁'; position: absolute; right: -10px; top: -10px; font-size: 100px; opacity: 0.08; }
  .hero-label { font-size: 11px; font-weight: 600; letter-spacing: 2px; color: var(--gold); text-transform: uppercase; margin-bottom: 8px; }
  .hero-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
  .hero-sub { font-size: 14px; color: var(--muted); line-height: 1.5; margin-bottom: 20px; }
  .btn-hero { background: var(--gold); color: #000; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 14px; transition: border-color 0.2s; }
  .card:active { border-color: var(--border-hot); }
  .card-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--gold); margin-bottom: 8px; }
  .card-desc { font-size: 14px; color: var(--muted); line-height: 1.5; margin-bottom: 12px; }
  .card-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
  .pill { background: rgba(245,166,35,0.1); border: 1px solid var(--border); border-radius: 20px; padding: 4px 10px; font-size: 12px; color: var(--text); display: flex; align-items: center; gap: 4px; }
  .pill-gold { background: rgba(245,166,35,0.15); border-color: var(--border-hot); color: var(--gold); font-weight: 600; }
  .pill-cat { background: rgba(100,100,255,0.15); border-color: rgba(100,100,255,0.4); color: #aaaaff; font-weight: 600; }
  .progress-track { height: 6px; background: rgba(245,166,35,0.15); border-radius: 99px; overflow: hidden; margin-bottom: 14px; }
  .progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--gold-dim), var(--gold)); transition: width 0.4s ease; }
  .btn-primary { background: var(--gold); color: #000; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; width: 100%; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; }
  .btn-primary:active { opacity: 0.9; }
  .btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); padding: 10px 18px; border-radius: 10px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }
  .btn-outline.following { border-color: var(--gold); color: var(--gold); }
  .btn-disabled { background: rgba(255,255,255,0.08); color: var(--muted); border: none; padding: 12px 20px; border-radius: 10px; font-size: 14px; cursor: not-allowed; width: 100%; font-family: 'DM Sans', sans-serif; }
  .btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 8px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; }
  .btn-sm-gold { background: rgba(245,166,35,0.15); color: var(--gold); border: 1px solid var(--border-hot); }
  .btn-sm-muted { background: rgba(255,255,255,0.06); color: var(--muted); }
  .lb-item { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 20px; margin-bottom: 10px; display: flex; align-items: center; gap: 14px; }
  .lb-rank { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; min-width: 36px; text-align: center; }
  .lb-rank.gold { color: #FFD700; } .lb-rank.silver { color: #C0C0C0; } .lb-rank.bronze { color: #CD7F32; }
  .lb-name { flex: 1; font-weight: 500; font-size: 15px; }
  .lb-pi { color: var(--gold); font-weight: 700; font-size: 15px; }
  .celeb-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 14px; }
  .celeb-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #f5a623, #ff6b6b); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .celeb-info { flex: 1; }
  .celeb-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; }
  .celeb-badge { font-size: 11px; color: var(--gold); font-weight: 600; letter-spacing: 1px; }
  .celeb-followers { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .form-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px 20px; }
  .form-label { font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; display: block; }
  .form-input { width: 100%; padding: 14px 16px; background: var(--dark); color: var(--text); border: 1px solid var(--border); border-radius: 10px; font-size: 15px; font-family: 'DM Sans', sans-serif; margin-bottom: 18px; transition: border-color 0.2s; outline: none; }
  .form-input:focus { border-color: var(--gold); }
  .form-input::placeholder { color: var(--muted); }
  .form-textarea { width: 100%; padding: 14px 16px; background: var(--dark); color: var(--text); border: 1px solid var(--border); border-radius: 10px; font-size: 15px; font-family: 'DM Sans', sans-serif; margin-bottom: 18px; resize: vertical; min-height: 80px; outline: none; }
  .form-textarea:focus { border-color: var(--gold); }
  .form-textarea::placeholder { color: var(--muted); }
  .form-select { width: 100%; padding: 14px 16px; background: var(--dark); color: var(--text); border: 1px solid var(--border); border-radius: 10px; font-size: 15px; font-family: 'DM Sans', sans-serif; margin-bottom: 18px; outline: none; cursor: pointer; }
  .form-select:focus { border-color: var(--gold); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .empty { text-align: center; padding: 60px 20px; }
  .empty-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.6; }
  .empty-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .empty-sub { color: var(--muted); font-size: 14px; line-height: 1.5; }
  .section-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin: 24px 0 12px; }
  .cat-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 16px; scrollbar-width: none; }
  .cat-scroll::-webkit-scrollbar { display: none; }
  .cat-pill { padding: 7px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--muted); white-space: nowrap; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .cat-pill.active { background: var(--gold); color: #000; border-color: var(--gold); }
  .countdown { font-size: 12px; color: #ff6b6b; font-weight: 600; }
  .card-actions { display: flex; gap: 8px; margin-top: 10px; }
  .comments-section { margin-top: 16px; border-top: 1px solid var(--border); padding-top: 14px; }
  .comment-item { padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.08); }
  .comment-user { font-size: 12px; font-weight: 700; color: var(--gold); margin-bottom: 3px; }
  .comment-text { font-size: 13px; color: var(--text); line-height: 1.4; }
  .comment-time { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .comment-input-row { display: flex; gap: 8px; margin-top: 12px; }
  .comment-input { flex: 1; padding: 10px 14px; background: var(--dark); color: var(--text); border: 1px solid var(--border); border-radius: 10px; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; }
  .comment-input:focus { border-color: var(--gold); }
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; text-align: center; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--gold); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .profile-header { background: linear-gradient(135deg, #1a1a2e, #0f3460); border: 1px solid var(--border-hot); border-radius: var(--radius); padding: 24px 20px; margin-bottom: 20px; text-align: center; }
  .profile-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #f5a623, #ff6b6b); display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 12px; }
  .profile-name { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--gold); }
  .profile-sub { font-size: 13px; color: var(--muted); margin-top: 4px; }
  .referral-box { background: var(--card); border: 1px solid var(--border-hot); border-radius: var(--radius); padding: 18px 20px; margin-bottom: 16px; }
  .referral-code { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--gold); letter-spacing: 3px; text-align: center; margin: 10px 0; }
  .analytics-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .analytics-mini { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; text-align: center; }
  .analytics-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--gold); }
  .analytics-lbl { font-size: 11px; color: var(--muted); margin-top: 3px; }
  .recent-giveaway { background: var(--card2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
  .recent-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
  .recent-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }
  .task-type { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
`;

function useCountdown(expiresAt) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setTimeLeft(`${d}d ${h}h left`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m left`);
      else setTimeLeft(`${m}m ${s}s left`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return timeLeft;
}

function GiveawayCard({ g, user, onClaim, onLike, onComment, onShare }) {
  const timeLeft = useCountdown(g.expiresAt);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const liked = user && g.likes?.includes(user._id);
  const claimed = user && g.claimedBy?.includes(user._id);
  const pct = Math.round((g.claimedSlots / g.totalSlots) * 100);

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div className="card-title">{g.title}</div>
        {g.category && <span className="pill pill-cat">{g.category}</span>}
      </div>
      {g.description && <div className="card-desc">{g.description}</div>}
      <div className="card-meta">
        <span className="pill pill-gold">π {g.amountPerUser} per person</span>
        <span className="pill">📍 {g.eligibility?.location?.country || "Worldwide"}</span>
        <span className="countdown">⏱ {timeLeft}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
        <span>Slots claimed</span><span>{g.claimedSlots}/{g.totalSlots}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: pct + "%" }} />
      </div>
      {claimed
        ? <div className="btn-disabled">✅ Already Claimed</div>
        : <button className="btn-primary" onClick={() => onClaim(g._id)}>Claim Giveaway →</button>
      }
      <div className="card-actions">
        <button className={`btn-sm ${liked ? "btn-sm-gold" : "btn-sm-muted"}`} onClick={() => onLike(g._id)}>
          ❤️ {g.likes?.length || 0}
        </button>
        <button className="btn-sm btn-sm-muted" onClick={() => setShowComments(!showComments)}>
          💬 {g.comments?.length || 0}
        </button>
        <button className="btn-sm btn-sm-muted" onClick={() => onShare(g)}>🔗 Share</button>
      </div>
      {showComments && (
        <div className="comments-section">
          {g.comments?.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>No comments yet. Be first!</div>}
          {g.comments?.map((c, i) => (
            <div key={i} className="comment-item">
              <div className="comment-user">@{c.username}</div>
              <div className="comment-text">{c.text}</div>
              <div className="comment-time">{new Date(c.createdAt).toLocaleTimeString()}</div>
            </div>
          ))}
          {user && (
            <div className="comment-input-row">
              <input className="comment-input" placeholder="Add a comment..." value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && commentText.trim()) { onComment(g._id, commentText); setCommentText(""); }}} />
              <button className="btn-sm btn-sm-gold" onClick={() => { if (commentText.trim()) { onComment(g._id, commentText); setCommentText(""); }}}>Post</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [giveaways, setGiveaways] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [form, setForm] = useState({ title: "", description: "", category: "General", amount: "", amountPerUser: "", country: "", expiresAt: "" });

  useEffect(() => {
    fetchGiveaways();
    axios.get(API + "/giveaways/leaderboard").then(r => setLeaderboard(r.data)).catch(() => {});
    axios.get(API + "/auth/celebrities").then(r => setCelebrities(r.data)).catch(() => {});
    axios.get(API + "/tasks/active").then(r => setTasks(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchGiveaways();
  }, [selectedCategory]);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(fetchGiveaways, 30000);
    return () => clearInterval(interval);
  }, [giveaways, selectedCategory]);

  const fetchGiveaways = () => {
    const url = selectedCategory === "All"
      ? API + "/giveaways/active"
      : API + "/giveaways/active?category=" + selectedCategory;
    axios.get(url).then(r => {
      if (giveaways.length > 0 && r.data.length > giveaways.length) {
        const newest = r.data[0];
        addNotification("🎁 New giveaway: " + newest.title + " (" + newest.amountPerUser + " Pi each!)");
      }
      setGiveaways(r.data);
    }).catch(() => {});
  };

  const fetchAnalytics = () => {
    if (!user) return;
    axios.get(API + "/giveaways/analytics/" + user._id).then(r => setAnalytics(r.data)).catch(() => {});
  };

  const addNotification = (message) => {
    setNotifications(prev => [{ id: Date.now(), message, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const loginWithPi = async () => {
    if (!window.Pi) { alert("Please open this app in Pi Browser!"); return; }
    try {
      const scopes = ["username", "payments"];
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const referralCode = new URLSearchParams(window.location.search).get("ref");
      const response = await axios.post(API + "/auth/pi-login", {
        accessToken: authResult.accessToken,
        piUid: authResult.user.uid,
        username: authResult.user.username,
        referralCode
      });
      setUser(response.data.user);
      addNotification("👋 Welcome back, " + authResult.user.username + "!");
    } catch (error) { alert("Login failed. Use Pi Browser."); }
  };

  const onIncompletePaymentFound = (payment) => console.log(payment);

  const claimGiveaway = async (giveawayId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      const response = await axios.post(API + "/giveaways/claim", { giveawayId, userId: user._id });
      addNotification("🎉 You claimed a giveaway! +" + response.data.giveaway?.amountPerUser + " Pi");
      fetchGiveaways();
      fetchAnalytics();
    } catch (error) { alert(error.response?.data?.message || "Claim failed"); }
  };

  const likeGiveaway = async (giveawayId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      await axios.post(API + "/giveaways/" + giveawayId + "/like", { userId: user._id });
      fetchGiveaways();
    } catch (error) {}
  };

  const commentOnGiveaway = async (giveawayId, text) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      await axios.post(API + "/giveaways/" + giveawayId + "/comment", { userId: user._id, username: user.username, text });
      fetchGiveaways();
    } catch (error) { alert("Comment failed"); }
  };

  const shareGiveaway = (g) => {
    const url = "https://givehlr.netlify.app?ref=" + (user?.referralCode || "");
    if (navigator.share) {
      navigator.share({ title: "GiveHLR - " + g.title, text: "Claim " + g.amountPerUser + " Pi for free! 🎁", url });
    } else {
      navigator.clipboard.writeText(url);
      addNotification("🔗 Link copied to clipboard!");
    }
  };

  const followCelebrity = async (targetId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      const response = await axios.post(API + "/auth/follow", { followerId: user._id, targetId });
      alert(response.data.message);
      axios.get(API + "/auth/celebrities").then(r => setCelebrities(r.data));
    } catch (error) { alert(error.response?.data?.message || "Follow failed"); }
  };

  const unfollowCelebrity = async (targetId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      const response = await axios.post(API + "/auth/unfollow", { followerId: user._id, targetId });
      alert(response.data.message);
      axios.get(API + "/auth/celebrities").then(r => setCelebrities(r.data));
    } catch (error) { alert(error.response?.data?.message || "Unfollow failed"); }
  };

  const isFollowing = (id) => user?.following?.includes(id);

  const completeTask = async (taskId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      const response = await axios.post(API + "/tasks/complete", { taskId, userId: user._id });
      addNotification("✅ Task completed! You earned Pi!");
      alert(response.data.message);
      axios.get(API + "/tasks/active").then(r => setTasks(r.data));
    } catch (error) { alert(error.response?.data?.message || "Task completion failed"); }
  };

  const isTaskCompleted = (task) => user && task.completedBy?.includes(user._id);

  const createGiveaway = async () => {
    if (!user) return alert("Please login with Pi first!");
    if (!form.title || !form.amount || !form.amountPerUser || !form.expiresAt) return alert("Please fill all required fields!");
    if (!window.Pi) return alert("Please open this app in Pi Browser!");
    try {
      await window.Pi.createPayment({
        amount: Number(form.amount),
        memo: "GiveHLR: " + form.title,
        metadata: { title: form.title }
      }, {
        onReadyForServerApproval: async (paymentId) => { await axios.post(API + "/payments/approve", { paymentId }); },
        onReadyForServerCompletion: async (paymentId, txid) => {
          await axios.post(API + "/payments/complete", { paymentId, txid });
          await axios.post(API + "/giveaways/create", {
            creatorId: user._id, creatorUsername: user.username,
            title: form.title, description: form.description,
            category: form.category, amount: Number(form.amount),
            amountPerUser: Number(form.amountPerUser),
            location: { country: form.country }, expiresAt: form.expiresAt, paymentId
          });
          addNotification("🎁 You created: " + form.title);
          alert("Giveaway created! 🎉");
          setForm({ title: "", description: "", category: "General", amount: "", amountPerUser: "", country: "", expiresAt: "" });
          setPage("home"); fetchGiveaways(); fetchAnalytics();
        },
        onCancel: () => alert("Payment cancelled."),
        onError: (error) => alert("Payment error: " + error.message)
      });
    } catch (error) { alert(error.response?.data?.message || "Failed to create giveaway"); }
  };

  const lbRankClass = (i) => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  const lbRankLabel = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
  const taskTypeIcon = (type) => ({ watch: "🎬", share: "📢", engage: "💬" }[type] || "✅");
  const taskTypeLabel = (type) => ({ watch: "Watch", share: "Share", engage: "Engage" }[type] || "Task");

  return (
    <div>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">Give<span>HLR</span></div>
        <div className="nav-right">
          <button className="btn-notif" onClick={() => setShowNotifications(!showNotifications)}>
            🔔{notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </button>
          {user
            ? <div className="nav-user" onClick={() => setPage("profile")}>@{user.username}</div>
            : <button className="btn-login" onClick={loginWithPi}>Login with π</button>
          }
        </div>
      </nav>

      {/* NOTIFICATIONS */}
      {showNotifications && (
        <div className="notif-drawer">
          <div className="notif-header">
            <span className="notif-title">Notifications</span>
            <button className="btn-clear" onClick={() => { setNotifications([]); setShowNotifications(false); }}>Clear all</button>
          </div>
          {notifications.length === 0
            ? <div className="notif-empty">All caught up! 🎉</div>
            : notifications.map(n => (
              <div key={n.id} className="notif-item">
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{n.time}</div>
              </div>
            ))}
        </div>
      )}

      <div className="page">

        {/* HOME */}
        {page === "home" && (
          <div>
            {!user && (
              <div className="hero">
                <div className="hero-label">Pi Network Giveaways</div>
                <div className="hero-title">Give & Receive<br />Pi Crypto 🎁</div>
                <div className="hero-sub">Join verified Pi users giving away Pi based on location and social following.</div>
                <button className="btn-hero" onClick={loginWithPi}>Get Started with π</button>
              </div>
            )}
            <div className="page-title">Active Giveaways</div>
            <div className="page-sub">{giveaways.length} live giveaway{giveaways.length !== 1 ? "s" : ""} right now</div>

            {/* CATEGORY FILTER */}
            <div className="cat-scroll">
              {CATEGORIES.map(cat => (
                <button key={cat} className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}>{cat}</button>
              ))}
            </div>

            {giveaways.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🎁</div>
                <div className="empty-title">No active giveaways yet</div>
                <div className="empty-sub">Be the first to create one and share Pi with the community!</div>
              </div>
            ) : giveaways.map(g => (
              <GiveawayCard key={g._id} g={g} user={user}
                onClaim={claimGiveaway} onLike={likeGiveaway}
                onComment={commentOnGiveaway} onShare={shareGiveaway} />
            ))}
          </div>
        )}

        {/* LEADERBOARD */}
        {page === "leaderboard" && (
          <div>
            <div className="page-title">Leaderboard</div>
            <div className="page-sub">Top Pi receivers this week</div>
            {leaderboard.length === 0 ? (
              <div className="empty"><div className="empty-icon">🏆</div><div className="empty-title">No rankings yet</div><div className="empty-sub">Claim giveaways to appear here!</div></div>
            ) : leaderboard.map((u, i) => (
              <div key={u._id} className="lb-item">
                <div className={`lb-rank ${lbRankClass(i)}`}>{lbRankLabel(i)}</div>
                <div className="lb-name">@{u.username}</div>
                <div className="lb-pi">π {u.totalReceived}</div>
              </div>
            ))}
          </div>
        )}

        {/* CELEBRITIES */}
        {page === "celebrities" && (
          <div>
            <div className="page-title">Influencers</div>
            <div className="page-sub">Follow verified Pi influencers</div>
            {celebrities.length === 0 ? (
              <div className="empty"><div className="empty-icon">⭐</div><div className="empty-title">No influencers yet</div><div className="empty-sub">Verified celebrity accounts will appear here!</div></div>
            ) : celebrities.map(c => (
              <div key={c._id} className="celeb-card">
                <div className="celeb-avatar">⭐</div>
                <div className="celeb-info">
                  <div className="celeb-name">@{c.username}</div>
                  <div className="celeb-badge">✦ VERIFIED</div>
                  <div className="celeb-followers">{c.followers.length} followers</div>
                </div>
                <button className={`btn-outline ${isFollowing(c._id) ? "following" : ""}`}
                  onClick={() => isFollowing(c._id) ? unfollowCelebrity(c._id) : followCelebrity(c._id)}>
                  {isFollowing(c._id) ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TASKS */}
        {page === "tasks" && (
          <div>
            <div className="page-title">Tasks & Rewards</div>
            <div className="page-sub">Complete tasks to earn Pi rewards</div>
            {tasks.length === 0 ? (
              <div className="empty"><div className="empty-icon">🎯</div><div className="empty-title">No tasks yet</div><div className="empty-sub">Check back soon!</div></div>
            ) : tasks.map(t => (
              <div key={t._id} className="card">
                <div className="task-type">{taskTypeIcon(t.type)} {taskTypeLabel(t.type)}</div>
                <div className="card-title">{t.title}</div>
                {t.description && <div className="card-desc">{t.description}</div>}
                <div className="card-meta"><span className="pill pill-gold">π {t.reward} reward</span></div>
                {t.link && <a href={t.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", color: "var(--gold)", fontSize: 13, marginBottom: 14, textDecoration: "none" }}>🔗 Open task link →</a>}
                {isTaskCompleted(t) ? <div className="btn-disabled">✅ Completed</div>
                  : <button className="btn-primary" onClick={() => completeTask(t._id)}>Complete Task →</button>}
              </div>
            ))}
          </div>
        )}

        {/* CREATE */}
        {page === "create" && (
          <div>
            <div className="page-title">Create Giveaway</div>
            <div className="page-sub">Fund a giveaway with Pi payment</div>
            <div className="form-card">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="e.g. Friday Pi Drop 🎁" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Tell people about your giveaway..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="form-row">
                <div>
                  <label className="form-label">Total Pi *</label>
                  <input className="form-input" type="number" placeholder="10" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Per Person *</label>
                  <input className="form-input" type="number" placeholder="1" value={form.amountPerUser} onChange={e => setForm({ ...form, amountPerUser: e.target.value })} />
                </div>
              </div>
              <label className="form-label">Country (optional)</label>
              <input className="form-input" placeholder="Leave blank for worldwide" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
              <label className="form-label">Expires At *</label>
              <input className="form-input" type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
              <button className="btn-primary" onClick={createGiveaway}>🚀 Create & Pay with Pi</button>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {page === "profile" && user && (
          <div>
            <div className="profile-header">
              <div className="profile-avatar">👤</div>
              <div className="profile-name">@{user.username}</div>
              <div className="profile-sub">Pi Network Member</div>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><div className="stat-value">π {user.totalReceived || 0}</div><div className="stat-label">Total Received</div></div>
              <div className="stat-card"><div className="stat-value">π {user.totalGiven || 0}</div><div className="stat-label">Total Given</div></div>
              <div className="stat-card"><div className="stat-value">{user.followers?.length || 0}</div><div className="stat-label">Followers</div></div>
              <div className="stat-card"><div className="stat-value">{user.referralCount || 0}</div><div className="stat-label">Referrals</div></div>
            </div>

            {/* REFERRAL */}
            <div className="referral-box">
              <div className="section-label">Your Referral Code</div>
              <div className="referral-code">{user.referralCode || "Loading..."}</div>
              <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => {
                const url = "https://givehlr.netlify.app?ref=" + user.referralCode;
                if (navigator.share) { navigator.share({ title: "Join GiveHLR!", text: "Get free Pi! Use my referral link 🎁", url }); }
                else { navigator.clipboard.writeText(url); addNotification("🔗 Referral link copied!"); }
              }}>Share Referral Link</button>
            </div>

            {/* ANALYTICS */}
            {analytics && (
              <div>
                <div className="section-label">Your Analytics</div>
                <div className="analytics-row">
                  <div className="analytics-mini"><div className="analytics-val">{analytics.totalGiveaways}</div><div className="analytics-lbl">Created</div></div>
                  <div className="analytics-mini"><div className="analytics-val">{analytics.activeGiveaways}</div><div className="analytics-lbl">Active</div></div>
                  <div className="analytics-mini"><div className="analytics-val">{analytics.claimRate}%</div><div className="analytics-lbl">Claim Rate</div></div>
                </div>
                <div className="analytics-mini" style={{ marginBottom: 16 }}>
                  <div className="analytics-val">π {analytics.totalPiGiven?.toFixed(2)}</div>
                  <div className="analytics-lbl">Total Pi Distributed</div>
                </div>

                {analytics.recentGiveaways?.length > 0 && (
                  <div>
                    <div className="section-label">Recent Giveaways</div>
                    {analytics.recentGiveaways.map(g => (
                      <div key={g._id} className="recent-giveaway">
                        <div className="recent-title">{g.title}</div>
                        <div className="recent-meta">
                          <span>{g.claimedSlots}/{g.totalSlots} claimed</span>
                          <span style={{ color: g.isActive ? "#4ade80" : "var(--muted)" }}>{g.isActive ? "🟢 Active" : "⚫ Ended"}</span>
                          <span>{g.claimRate}% rate</span>
                        </div>
                        <div className="progress-track" style={{ marginTop: 8, marginBottom: 0 }}>
                          <div className="progress-fill" style={{ width: g.claimRate + "%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* TAB BAR */}
      <div className="tab-bar">
        <button className={`tab-item ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}><span className="tab-icon">🏠</span><span>Home</span></button>
        <button className={`tab-item ${page === "leaderboard" ? "active" : ""}`} onClick={() => setPage("leaderboard")}><span className="tab-icon">🏆</span><span>Leaders</span></button>
        <button className="tab-fab" onClick={() => user ? setPage("create") : loginWithPi()}><div className="tab-fab-inner">＋</div></button>
        <button className={`tab-item ${page === "celebrities" ? "active" : ""}`} onClick={() => setPage("celebrities")}><span className="tab-icon">⭐</span><span>Stars</span></button>
        <button className={`tab-item ${page === "tasks" ? "active" : ""}`} onClick={() => setPage("tasks")}><span className="tab-icon">🎯</span><span>Tasks</span></button>
      </div>
    </div>
  );
}

export default App;