import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://pigive.onrender.com/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --gold: #f5a623;
    --gold-dim: #c47f0f;
    --dark: #0b0b12;
    --card: #13131f;
    --card2: #1a1a2e;
    --border: rgba(245,166,35,0.2);
    --border-hot: rgba(245,166,35,0.7);
    --text: #e8e8f0;
    --muted: #7070a0;
    --radius: 16px;
    --nav-h: 64px;
    --tab-h: 64px;
  }

  body {
    background: var(--dark);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── TOP NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    height: var(--nav-h);
    background: rgba(11,11,18,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
  }
  .nav-logo {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    background: linear-gradient(135deg, #f5a623, #ffcf70);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }
  .nav-logo span { font-weight: 400; opacity: 0.7; }
  .nav-right { display: flex; align-items: center; gap: 10px; }
  .nav-user {
    font-size: 13px; font-weight: 500; color: var(--gold);
    background: rgba(245,166,35,0.1);
    border: 1px solid var(--border-hot);
    padding: 6px 12px; border-radius: 20px;
    max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .btn-login {
    background: var(--gold); color: #000;
    border: none; padding: 8px 16px; border-radius: 20px;
    font-weight: 700; font-size: 13px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .btn-login:active { transform: scale(0.96); }
  .btn-notif {
    background: transparent; border: 1px solid var(--border);
    color: var(--text); width: 38px; height: 38px; border-radius: 50%;
    cursor: pointer; font-size: 16px; position: relative;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s;
  }
  .btn-notif:hover { border-color: var(--gold); }
  .notif-badge {
    position: absolute; top: -4px; right: -4px;
    background: #ff3b5c; color: white;
    border-radius: 50%; width: 18px; height: 18px;
    font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── NOTIFICATION DRAWER ── */
  .notif-drawer {
    position: fixed; top: var(--nav-h); right: 0;
    width: min(340px, 100vw);
    background: var(--card); border-left: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    border-radius: 0 0 0 var(--radius);
    z-index: 99; max-height: 60vh; overflow-y: auto;
    animation: slideIn 0.2s ease;
  }
  @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .notif-header {
    padding: 14px 18px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .notif-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: var(--gold); }
  .btn-clear { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 12px; }
  .notif-item { padding: 12px 18px; border-bottom: 1px solid var(--border); }
  .notif-msg { font-size: 13px; line-height: 1.4; }
  .notif-time { font-size: 11px; color: var(--muted); margin-top: 4px; }
  .notif-empty { padding: 20px 18px; color: var(--muted); font-size: 14px; text-align: center; }

  /* ── BOTTOM TAB BAR ── */
  .tab-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
    height: var(--tab-h);
    background: rgba(11,11,18,0.92);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex; align-items: center;
  }
  .tab-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px; cursor: pointer; padding: 8px 0;
    border: none; background: transparent; color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: 10px;
    transition: color 0.2s;
    -webkit-tap-highlight-color: transparent;
  }
  .tab-item.active { color: var(--gold); }
  .tab-icon { font-size: 20px; line-height: 1; }
  .tab-fab {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; border: none; background: transparent;
    -webkit-tap-highlight-color: transparent;
  }
  .tab-fab-inner {
    width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg, #f5a623, #ffcf70);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-top: -24px;
    box-shadow: 0 4px 20px rgba(245,166,35,0.5);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .tab-fab-inner:active { transform: scale(0.93); box-shadow: 0 2px 10px rgba(245,166,35,0.4); }

  /* ── PAGE CONTENT ── */
  .page {
    padding: calc(var(--nav-h) + 20px) 16px calc(var(--tab-h) + 20px);
    max-width: 600px; margin: 0 auto;
    animation: fadeUp 0.3s ease;
  }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  .page-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    margin-bottom: 6px;
    background: linear-gradient(135deg, #fff 40%, #f5a623);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .page-sub { color: var(--muted); font-size: 14px; margin-bottom: 24px; }

  /* ── HERO BANNER ── */
  .hero {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border: 1px solid var(--border-hot);
    border-radius: var(--radius);
    padding: 28px 24px;
    margin-bottom: 24px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: '🎁';
    position: absolute; right: -10px; top: -10px;
    font-size: 100px; opacity: 0.08;
  }
  .hero-label {
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    color: var(--gold); text-transform: uppercase; margin-bottom: 8px;
  }
  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800; line-height: 1.2;
    margin-bottom: 12px;
  }
  .hero-sub { font-size: 14px; color: var(--muted); line-height: 1.5; margin-bottom: 20px; }
  .btn-hero {
    background: var(--gold); color: #000;
    border: none; padding: 12px 24px; border-radius: 10px;
    font-weight: 700; font-size: 14px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: transform 0.15s;
  }
  .btn-hero:active { transform: scale(0.97); }

  /* ── CARDS ── */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 14px;
    transition: border-color 0.2s, transform 0.15s;
  }
  .card:active { transform: scale(0.99); border-color: var(--border-hot); }
  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700;
    color: var(--gold); margin-bottom: 8px; line-height: 1.3;
  }
  .card-desc { font-size: 14px; color: var(--muted); line-height: 1.5; margin-bottom: 12px; }
  .card-meta {
    display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;
  }
  .pill {
    background: rgba(245,166,35,0.1);
    border: 1px solid var(--border);
    border-radius: 20px; padding: 4px 10px;
    font-size: 12px; color: var(--text);
    display: flex; align-items: center; gap: 4px;
  }
  .pill-gold { background: rgba(245,166,35,0.15); border-color: var(--border-hot); color: var(--gold); font-weight: 600; }

  /* progress bar */
  .progress-track {
    height: 6px; background: rgba(245,166,35,0.15);
    border-radius: 99px; overflow: hidden; margin-bottom: 14px;
  }
  .progress-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, var(--gold-dim), var(--gold));
    transition: width 0.4s ease;
  }

  /* ── BUTTONS ── */
  .btn-primary {
    background: var(--gold); color: #000;
    border: none; padding: 12px 20px; border-radius: 10px;
    font-weight: 700; font-size: 14px; cursor: pointer;
    width: 100%; font-family: 'DM Sans', sans-serif;
    transition: opacity 0.2s, transform 0.15s;
  }
  .btn-primary:active { transform: scale(0.98); opacity: 0.9; }
  .btn-outline {
    background: transparent; color: var(--text);
    border: 1px solid var(--border); padding: 10px 18px;
    border-radius: 10px; font-size: 13px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s;
  }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }
  .btn-outline.following {
    border-color: var(--gold); color: var(--gold);
  }
  .btn-disabled {
    background: rgba(255,255,255,0.08); color: var(--muted);
    border: none; padding: 12px 20px; border-radius: 10px;
    font-size: 14px; cursor: not-allowed; width: 100%;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── LEADERBOARD ── */
  .lb-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 14px;
  }
  .lb-rank {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800;
    min-width: 36px; text-align: center;
  }
  .lb-rank.gold { color: #FFD700; }
  .lb-rank.silver { color: #C0C0C0; }
  .lb-rank.bronze { color: #CD7F32; }
  .lb-name { flex: 1; font-weight: 500; font-size: 15px; }
  .lb-pi { color: var(--gold); font-weight: 700; font-size: 15px; }

  /* ── CELEBRITY ── */
  .celeb-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 14px;
  }
  .celeb-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    background: linear-gradient(135deg, #f5a623, #ff6b6b);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .celeb-info { flex: 1; }
  .celeb-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; }
  .celeb-badge { font-size: 11px; color: var(--gold); font-weight: 600; letter-spacing: 1px; }
  .celeb-followers { font-size: 13px; color: var(--muted); margin-top: 2px; }

  /* ── FORM ── */
  .form-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 20px;
  }
  .form-label {
    font-size: 12px; font-weight: 600; color: var(--muted);
    letter-spacing: 0.5px; text-transform: uppercase;
    margin-bottom: 6px; display: block;
  }
  .form-input {
    width: 100%; padding: 14px 16px;
    background: var(--dark); color: var(--text);
    border: 1px solid var(--border); border-radius: 10px;
    font-size: 15px; font-family: 'DM Sans', sans-serif;
    margin-bottom: 18px; transition: border-color 0.2s;
    outline: none;
  }
  .form-input:focus { border-color: var(--gold); }
  .form-input::placeholder { color: var(--muted); }
  .form-textarea {
    width: 100%; padding: 14px 16px;
    background: var(--dark); color: var(--text);
    border: 1px solid var(--border); border-radius: 10px;
    font-size: 15px; font-family: 'DM Sans', sans-serif;
    margin-bottom: 18px; resize: vertical; min-height: 100px;
    transition: border-color 0.2s; outline: none;
  }
  .form-textarea:focus { border-color: var(--gold); }
  .form-textarea::placeholder { color: var(--muted); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* ── EMPTY STATE ── */
  .empty {
    text-align: center; padding: 60px 20px;
  }
  .empty-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.6; }
  .empty-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .empty-sub { color: var(--muted); font-size: 14px; line-height: 1.5; }

  /* ── TASK ── */
  .task-type {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
    text-transform: uppercase; color: var(--muted); margin-bottom: 6px;
  }

  /* ── SECTION LABEL ── */
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted);
    margin: 28px 0 14px;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
`;

function App() {
  const [giveaways, setGiveaways] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", amount: "", amountPerUser: "", country: "", expiresAt: ""
  });

  useEffect(() => {
    fetchGiveaways();
    axios.get(API + "/giveaways/leaderboard").then(r => setLeaderboard(r.data)).catch(() => {});
    axios.get(API + "/auth/celebrities").then(r => setCelebrities(r.data)).catch(() => {});
    axios.get(API + "/tasks/active").then(r => setTasks(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchGiveaways, 30000);
    return () => clearInterval(interval);
  }, [giveaways]);

  const fetchGiveaways = () => {
    axios.get(API + "/giveaways/active").then(r => {
      const newGiveaways = r.data;
      if (giveaways.length > 0 && newGiveaways.length > giveaways.length) {
        const newest = newGiveaways[newGiveaways.length - 1];
        addNotification("🎁 New giveaway: " + newest.title + " (" + newest.amountPerUser + " Pi each!)");
      }
      setGiveaways(newGiveaways);
    }).catch(() => {});
  };

  const addNotification = (message) => {
    setNotifications(prev => [{ id: Date.now(), message, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const loginWithPi = async () => {
    if (!window.Pi) { alert("Please open this app in Pi Browser!"); return; }
    try {
      const scopes = ["username", "payments"];
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const response = await axios.post(API + "/auth/pi-login", {
        accessToken: authResult.accessToken,
        piUid: authResult.user.uid,
        username: authResult.user.username
      });
      setUser(response.data.user);
      addNotification("👋 Welcome back, " + authResult.user.username + "!");
    } catch (error) {
      alert("Login failed. Use Pi Browser.");
    }
  };

  const onIncompletePaymentFound = (payment) => console.log(payment);

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

  const claimGiveaway = async (giveawayId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      const response = await axios.post(API + "/giveaways/claim", { giveawayId, userId: user._id });
      addNotification("🎉 You claimed a giveaway!");
      alert(response.data.message);
      fetchGiveaways();
    } catch (error) { alert(error.response?.data?.message || "Claim failed"); }
  };

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
            creatorId: user._id, title: form.title, description: form.description,
            amount: Number(form.amount), amountPerUser: Number(form.amountPerUser),
            location: { country: form.country }, expiresAt: form.expiresAt, paymentId
          });
          addNotification("🎁 You created: " + form.title);
          alert("Giveaway created!");
          setPage("home"); fetchGiveaways();
        },
        onCancel: () => alert("Payment cancelled."),
        onError: (error) => alert("Payment error: " + error.message)
      });
    } catch (error) { alert(error.response?.data?.message || "Failed to create giveaway"); }
  };

  const taskTypeIcon = (type) => ({ watch: "🎬", share: "📢", engage: "💬" }[type] || "✅");
  const taskTypeLabel = (type) => ({ watch: "Watch", share: "Share", engage: "Engage" }[type] || "Task");

  const lbRankClass = (i) => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  const lbRankLabel = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;

  const progressPct = (g) => Math.round((g.claimedSlots / g.totalSlots) * 100);

  return (
    <div>
      <style>{styles}</style>

      {/* TOP NAV */}
      <nav className="nav">
        <div className="nav-logo">Give<span>HLR</span></div>
        <div className="nav-right">
          <button className="btn-notif" onClick={() => setShowNotifications(!showNotifications)}>
            🔔
            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </button>
          {user
            ? <div className="nav-user">@{user.username}</div>
            : <button className="btn-login" onClick={loginWithPi}>Login with π</button>
          }
        </div>
      </nav>

      {/* NOTIFICATION DRAWER */}
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

      {/* PAGE CONTENT */}
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

            {giveaways.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🎁</div>
                <div className="empty-title">No active giveaways yet</div>
                <div className="empty-sub">Be the first to create one and share Pi with the community!</div>
              </div>
            ) : giveaways.map(g => (
              <div key={g._id} className="card">
                <div className="card-title">{g.title}</div>
                {g.description && <div className="card-desc">{g.description}</div>}
                <div className="card-meta">
                  <span className="pill pill-gold">π {g.amountPerUser} per person</span>
                  <span className="pill">📍 {g.eligibility?.location?.country || "Worldwide"}</span>
                  <span className="pill">⏱ {new Date(g.expiresAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  <span>Slots claimed</span>
                  <span>{g.claimedSlots}/{g.totalSlots}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: progressPct(g) + "%" }} />
                </div>
                <button className="btn-primary" onClick={() => claimGiveaway(g._id)}>Claim Giveaway →</button>
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD */}
        {page === "leaderboard" && (
          <div>
            <div className="page-title">Leaderboard</div>
            <div className="page-sub">Top Pi givers this week</div>
            {leaderboard.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🏆</div>
                <div className="empty-title">No rankings yet</div>
                <div className="empty-sub">Claim giveaways to appear on the leaderboard!</div>
              </div>
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
              <div className="empty">
                <div className="empty-icon">⭐</div>
                <div className="empty-title">No influencers yet</div>
                <div className="empty-sub">Verified celebrity accounts will appear here!</div>
              </div>
            ) : celebrities.map(c => (
              <div key={c._id} className="celeb-card">
                <div className="celeb-avatar">⭐</div>
                <div className="celeb-info">
                  <div className="celeb-name">@{c.username}</div>
                  <div className="celeb-badge">✦ VERIFIED</div>
                  <div className="celeb-followers">{c.followers.length} followers</div>
                </div>
                <button
                  className={`btn-outline ${isFollowing(c._id) ? "following" : ""}`}
                  onClick={() => isFollowing(c._id) ? unfollowCelebrity(c._id) : followCelebrity(c._id)}
                >
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
              <div className="empty">
                <div className="empty-icon">🎯</div>
                <div className="empty-title">No tasks yet</div>
                <div className="empty-sub">Check back soon for new earning opportunities!</div>
              </div>
            ) : tasks.map(t => (
              <div key={t._id} className="card">
                <div className="task-type">{taskTypeIcon(t.type)} {taskTypeLabel(t.type)}</div>
                <div className="card-title">{t.title}</div>
                {t.description && <div className="card-desc">{t.description}</div>}
                <div className="card-meta">
                  <span className="pill pill-gold">π {t.reward} reward</span>
                </div>
                {t.link && (
                  <a href={t.link} target="_blank" rel="noopener noreferrer"
                    style={{ display: "block", color: "var(--gold)", fontSize: 13, marginBottom: 14, textDecoration: "none" }}>
                    🔗 Open task link →
                  </a>
                )}
                {isTaskCompleted(t)
                  ? <div className="btn-disabled">✅ Completed</div>
                  : <button className="btn-primary" onClick={() => completeTask(t._id)}>Complete Task →</button>
                }
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
              <label className="form-label">Giveaway Title *</label>
              <input className="form-input" placeholder="e.g. Friday Pi Drop 🎁"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Tell people about your giveaway..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

              <div className="form-row">
                <div>
                  <label className="form-label">Total Pi *</label>
                  <input className="form-input" type="number" placeholder="10"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Per Person *</label>
                  <input className="form-input" type="number" placeholder="1"
                    value={form.amountPerUser} onChange={e => setForm({ ...form, amountPerUser: e.target.value })} />
                </div>
              </div>

              <label className="form-label">Country (optional)</label>
              <input className="form-input" placeholder="Leave blank for worldwide"
                value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />

              <label className="form-label">Expires At *</label>
              <input className="form-input" type="datetime-local"
                value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />

              <button className="btn-primary" onClick={createGiveaway}>🚀 Create & Pay with Pi</button>
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM TAB BAR */}
      <div className="tab-bar">
        <button className={`tab-item ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>
          <span className="tab-icon">🏠</span>
          <span>Home</span>
        </button>
        <button className={`tab-item ${page === "leaderboard" ? "active" : ""}`} onClick={() => setPage("leaderboard")}>
          <span className="tab-icon">🏆</span>
          <span>Leaders</span>
        </button>

        {/* FAB — Create */}
        <button className="tab-fab" onClick={() => user ? setPage("create") : loginWithPi()}>
          <div className="tab-fab-inner">＋</div>
        </button>

        <button className={`tab-item ${page === "celebrities" ? "active" : ""}`} onClick={() => setPage("celebrities")}>
          <span className="tab-icon">⭐</span>
          <span>Stars</span>
        </button>
        <button className={`tab-item ${page === "tasks" ? "active" : ""}`} onClick={() => setPage("tasks")}>
          <span className="tab-icon">🎯</span>
          <span>Tasks</span>
        </button>
      </div>
    </div>
  );
}

export default App;
