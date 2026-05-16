import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://pigive.onrender.com/api";
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

  // Poll for new giveaways every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGiveaways();
    }, 30000);
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
    if (!window.Pi) {
      alert("Pi SDK not loaded. Please open this app in Pi Browser!");
      return;
    }
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
      alert("Welcome " + authResult.user.username + "!");
    } catch (error) {
      console.error(error);
      alert("Login failed. Make sure you are using Pi Browser.");
    }
  };

  const onIncompletePaymentFound = (payment) => console.log(payment);

  const followCelebrity = async (targetId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      const response = await axios.post(API + "/auth/follow", { followerId: user._id, targetId });
      alert(response.data.message);
      axios.get(API + "/auth/celebrities").then(r => setCelebrities(r.data));
    } catch (error) {
      alert(error.response?.data?.message || "Follow failed");
    }
  };

  const unfollowCelebrity = async (targetId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      const response = await axios.post(API + "/auth/unfollow", { followerId: user._id, targetId });
      alert(response.data.message);
      axios.get(API + "/auth/celebrities").then(r => setCelebrities(r.data));
    } catch (error) {
      alert(error.response?.data?.message || "Unfollow failed");
    }
  };

  const isFollowing = (celebrityId) => {
    if (!user) return false;
    return user.following && user.following.includes(celebrityId);
  };

  const completeTask = async (taskId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      const response = await axios.post(API + "/tasks/complete", { taskId, userId: user._id });
      addNotification("✅ Task completed! You earned Pi!");
      alert(response.data.message);
      axios.get(API + "/tasks/active").then(r => setTasks(r.data));
    } catch (error) {
      alert(error.response?.data?.message || "Task completion failed");
    }
  };

  const isTaskCompleted = (task) => {
    if (!user) return false;
    return task.completedBy && task.completedBy.includes(user._id);
  };

  const claimGiveaway = async (giveawayId) => {
    if (!user) return alert("Please login with Pi first!");
    try {
      const response = await axios.post(API + "/giveaways/claim", { giveawayId, userId: user._id });
      addNotification("🎉 You claimed a giveaway!");
      alert(response.data.message);
      fetchGiveaways();
    } catch (error) {
      alert(error.response?.data?.message || "Claim failed");
    }
  };

  const createGiveaway = async () => {
    if (!user) return alert("Please login with Pi first!");
    if (!form.title || !form.amount || !form.amountPerUser || !form.expiresAt) return alert("Please fill all required fields!");
    try {
      await axios.post(API + "/giveaways/create", {
        creatorId: user._id,
        title: form.title,
        description: form.description,
        amount: Number(form.amount),
        amountPerUser: Number(form.amountPerUser),
        location: { country: form.country },
        expiresAt: form.expiresAt
      });
      addNotification("🎁 You created a new giveaway: " + form.title);
      alert("Giveaway created successfully!");
      setPage("home");
      fetchGiveaways();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create giveaway");
    }
  };

  const taskTypeIcon = (type) => {
    if (type === "watch") return "🎬";
    if (type === "share") return "📢";
    if (type === "engage") return "💬";
    return "✅";
  };

  const inputStyle = {
    width: "100%", padding: "12px", borderRadius: "8px",
    border: "1px solid #f5a623", background: "#0f3460",
    color: "white", fontSize: "16px", marginBottom: "15px", boxSizing: "border-box"
  };

  const btnStyle = (active) => ({
    background: active ? "#f5a623" : "transparent",
    color: "white", border: "1px solid #f5a623",
    padding: "8px 16px", borderRadius: "5px", cursor: "pointer"
  });

  return (
    <div style={{ fontFamily: "Arial", background: "#1a1a2e", minHeight: "100vh", color: "white" }}>
      <nav style={{ background: "#16213e", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <h1 style={{ margin: 0, color: "#f5a623" }}>PiGive</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => setPage("home")} style={btnStyle(page === "home")}>Home</button>
          <button onClick={() => setPage("leaderboard")} style={btnStyle(page === "leaderboard")}>Leaderboard</button>
          <button onClick={() => setPage("celebrities")} style={btnStyle(page === "celebrities")}>Celebrities</button>
          <button onClick={() => setPage("tasks")} style={btnStyle(page === "tasks")}>Tasks</button>
          {user && <button onClick={() => setPage("create")} style={btnStyle(page === "create")}>Create</button>}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: "transparent", border: "1px solid #f5a623", color: "white", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>
              🔔 {notifications.length > 0 && <span style={{ background: "red", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "12px", marginLeft: "4px" }}>{notifications.length}</span>}
            </button>
            {showNotifications && (
              <div style={{ position: "absolute", right: 0, top: "45px", background: "#16213e", border: "1px solid #f5a623", borderRadius: "10px", width: "300px", zIndex: 1000, maxHeight: "400px", overflowY: "auto" }}>
                <div style={{ padding: "15px", borderBottom: "1px solid #f5a623", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#f5a623", fontWeight: "bold" }}>Notifications</span>
                  <button onClick={() => { setNotifications([]); setShowNotifications(false); }} style={{ background: "transparent", border: "none", color: "#ccc", cursor: "pointer" }}>Clear</button>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ padding: "15px", color: "#ccc" }}>No notifications yet</p>
                ) : notifications.map(n => (
                  <div key={n.id} style={{ padding: "12px 15px", borderBottom: "1px solid #0f3460" }}>
                    <p style={{ margin: 0, fontSize: "14px" }}>{n.message}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ccc" }}>{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {user ? (
            <span style={{ color: "#f5a623", fontWeight: "bold" }}>Hi, {user.username}</span>
          ) : (
            <button onClick={loginWithPi} style={{ background: "#f5a623", color: "black", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Login with Pi</button>
          )}
        </div>
      </nav>

      <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>

        {page === "home" && (
          <div>
            <h2 style={{ color: "#f5a623" }}>Active Giveaways</h2>
            {giveaways.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <p style={{ fontSize: "18px" }}>No active giveaways yet.</p>
                <p>Login and be the first to create one!</p>
              </div>
            ) : giveaways.map(g => (
              <div key={g._id} style={{ background: "#16213e", padding: "20px", borderRadius: "10px", marginBottom: "15px", border: "1px solid #f5a623" }}>
                <h3 style={{ color: "#f5a623", margin: "0 0 10px" }}>{g.title}</h3>
                <p style={{ margin: "5px 0" }}>{g.description}</p>
                <p style={{ margin: "5px 0" }}>Amount: {g.amountPerUser} Pi per person</p>
                <p style={{ margin: "5px 0" }}>Slots: {g.claimedSlots}/{g.totalSlots}</p>
                <p style={{ margin: "5px 0" }}>Location: {g.eligibility?.location?.country || "Worldwide"}</p>
                <p style={{ margin: "5px 0", color: "#ccc", fontSize: "14px" }}>Expires: {new Date(g.expiresAt).toLocaleString()}</p>
                <button onClick={() => claimGiveaway(g._id)} style={{ background: "#f5a623", color: "black", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}>Claim Giveaway</button>
              </div>
            ))}
          </div>
        )}

        {page === "tasks" && (
          <div>
            <h2 style={{ color: "#f5a623" }}>🎯 Tasks & Rewards</h2>
            <p style={{ color: "#ccc" }}>Complete tasks to earn Pi rewards!</p>
            {tasks.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <p style={{ fontSize: "18px" }}>No tasks available yet.</p>
                <p>Check back soon for new tasks!</p>
              </div>
            ) : tasks.map(t => (
              <div key={t._id} style={{ background: "#16213e", padding: "20px", borderRadius: "10px", marginBottom: "15px", border: "1px solid #f5a623" }}>
                <h3 style={{ color: "#f5a623", margin: "0 0 10px" }}>{taskTypeIcon(t.type)} {t.title}</h3>
                <p style={{ margin: "5px 0" }}>{t.description}</p>
                <p style={{ margin: "5px 0", color: "#f5a623", fontWeight: "bold" }}>Reward: {t.reward} Pi</p>
                {t.link && <a href={t.link} target="_blank" rel="noopener noreferrer" style={{ color: "#f5a623", display: "block", margin: "5px 0" }}>🔗 Go to task</a>}
                <button onClick={() => completeTask(t._id)} disabled={isTaskCompleted(t)} style={{ background: isTaskCompleted(t) ? "#555" : "#f5a623", color: isTaskCompleted(t) ? "#ccc" : "black", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: isTaskCompleted(t) ? "not-allowed" : "pointer", fontWeight: "bold", marginTop: "10px" }}>
                  {isTaskCompleted(t) ? "✅ Completed" : "Complete Task"}
                </button>
              </div>
            ))}
          </div>
        )}

        {page === "celebrities" && (
          <div>
            <h2 style={{ color: "#f5a623" }}>⭐ Celebrities & Influencers</h2>
            {celebrities.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <p style={{ fontSize: "18px" }}>No celebrities yet.</p>
                <p>Celebrity accounts will appear here!</p>
              </div>
            ) : celebrities.map(c => (
              <div key={c._id} style={{ background: "#16213e", padding: "20px", borderRadius: "10px", marginBottom: "15px", border: "1px solid #f5a623", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ color: "#f5a623", margin: "0 0 5px" }}>⭐ {c.username}</h3>
                  <p style={{ margin: 0, color: "#ccc" }}>{c.followers.length} followers</p>
                </div>
                <button onClick={() => isFollowing(c._id) ? unfollowCelebrity(c._id) : followCelebrity(c._id)} style={{ background: isFollowing(c._id) ? "transparent" : "#f5a623", color: isFollowing(c._id) ? "white" : "black", border: "1px solid #f5a623", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                  {isFollowing(c._id) ? "Unfollow" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}

        {page === "leaderboard" && (
          <div>
            <h2 style={{ color: "#f5a623" }}>Weekly Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p>No data yet. Claim giveaways to appear here!</p>
            ) : leaderboard.map((u, i) => (
              <div key={u._id} style={{ background: "#16213e", padding: "15px", borderRadius: "10px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "18px" }}>#{i + 1} {u.username}</span>
                <span style={{ color: "#f5a623", fontWeight: "bold" }}>{u.totalReceived} Pi</span>
              </div>
            ))}
          </div>
        )}

        {page === "create" && (
          <div>
            <h2 style={{ color: "#f5a623" }}>Create a Giveaway</h2>
            <div style={{ background: "#16213e", padding: "30px", borderRadius: "10px", border: "1px solid #f5a623" }}>
              <input placeholder="Giveaway Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, height: "100px", resize: "vertical" }} />
              <input placeholder="Total Amount in Pi *" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={inputStyle} />
              <input placeholder="Amount Per User in Pi *" type="number" value={form.amountPerUser} onChange={e => setForm({ ...form, amountPerUser: e.target.value })} style={inputStyle} />
              <input placeholder="Country - leave blank for worldwide" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} style={inputStyle} />
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} style={inputStyle} />
              <button onClick={createGiveaway} style={{ background: "#f5a623", color: "black", border: "none", padding: "15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", width: "100%" }}>Create Giveaway</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;