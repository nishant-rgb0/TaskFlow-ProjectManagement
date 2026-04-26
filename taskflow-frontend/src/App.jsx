import { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const API = "http://localhost:8081/api";
const apiFetch = async (path, options = {}, token = null) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function App() {
  const [auth, setAuth] = useState(() => {
    const s = localStorage.getItem("taskflow_auth");
    return s ? JSON.parse(s) : null;
  });
  const [page, setPage] = useState("projects");
  const [selectedProject, setSelectedProject] = useState(null);

  const login = (data) => { localStorage.setItem("taskflow_auth", JSON.stringify(data)); setAuth(data); };
  const logout = () => { localStorage.removeItem("taskflow_auth"); setAuth(null); setPage("projects"); };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#f0f2f5" }}>
        {auth ? (
          <>
            <Navbar page={page} setPage={setPage} setSelectedProject={setSelectedProject} />
            <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
              {page === "projects" && <ProjectsPage setPage={setPage} setSelectedProject={setSelectedProject} />}
              {page === "board" && selectedProject && <KanbanBoard project={selectedProject} setPage={setPage} />}
              {page === "mytasks" && <MyTasksPage />}
            </main>
          </>
        ) : (
          <AuthPage />
        )}
      </div>
    </AuthContext.Provider>
  );
}

function Navbar({ page, setPage, setSelectedProject }) {
  const { auth, logout } = useAuth();
  const nav = { background: "#1e3a5f", color: "#fff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 };
  const logo = { fontSize: 22, fontWeight: 700, color: "#4fc3f7", cursor: "pointer" };
  const btn = (active) => ({ background: active ? "#4fc3f7" : "transparent", color: "#fff", border: active ? "none" : "1px solid #4fc3f7", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 14, marginLeft: 8 });
  return (
    <nav style={nav}>
      <span style={logo} onClick={() => { setPage("projects"); setSelectedProject(null); }}>TaskFlow</span>
      <div>
        <button style={btn(page === "projects")} onClick={() => { setPage("projects"); setSelectedProject(null); }}>Projects</button>
        <button style={btn(page === "mytasks")} onClick={() => setPage("mytasks")}>My Tasks</button>
        <button style={{ ...btn(false), borderColor: "#ef5350", color: "#ef5350", marginLeft: 16 }} onClick={logout}>Logout ({auth.name})</button>
      </div>
    </nav>
  );
}

function ProjectsPage({ setPage, setSelectedProject }) {
  const { auth } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { apiFetch("/projects", {}, auth.token).then(setProjects); }, []);

  const createProject = async () => {
    try {
      const p = await apiFetch("/projects", { method: "POST", body: JSON.stringify(form) }, auth.token);
      setProjects(prev => [...prev, p]);
      setForm({ name: "", description: "" });
      setShowForm(false);
      setMsg("Project created!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) { setMsg(e.message); }
  };

  const addMember = async (projectId) => {
    try {
      await apiFetch(`/projects/${projectId}/members`, { method: "POST", body: JSON.stringify({ email: memberEmail }) }, auth.token);
      setMsg("Member added!");
      setMemberEmail("");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) { setMsg(e.message); }
  };

  const card = { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 16 };

  return (
    <div>
      {msg && <div style={{ background: "#d4edda", color: "#155724", padding: "10px 16px", borderRadius: 8, marginBottom: 16 }}>{msg}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: "#1e3a5f" }}>My Projects</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#1e3a5f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>+ New Project</button>
      </div>

      {showForm && (
        <div style={{ ...card, background: "#f8f9ff", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 12px", color: "#1e3a5f" }}>Create Project</h3>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Project name" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, boxSizing: "border-box" }} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Description" rows={3} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, boxSizing: "border-box" }} />
          <button onClick={createProject} style={{ background: "#1e3a5f", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Create</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {projects.map(p => (
          <div key={p.id} style={card}>
            <h3 style={{ margin: "0 0 8px", color: "#1e3a5f" }}>{p.name}</h3>
            <p style={{ margin: "0 0 12px", color: "#666", fontSize: 14 }}>{p.description}</p>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#999" }}>Owner: {p.ownerName}</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input value={memberEmail} onChange={e => setMemberEmail(e.target.value)}
                placeholder="Add member by email" style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13 }} />
              <button onClick={() => addMember(p.id)} style={{ background: "#4fc3f7", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Add</button>
            </div>
           <button onClick={() => { setSelectedProject(p); setPage("board"); }} style={{ width: "100%", background: "#1e3a5f", color: "#fff", border: "none", padding: 10, borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
  Open Board
</button>
          </div>
        ))}
      </div>
      {projects.length === 0 && <p style={{ textAlign: "center", color: "#999", marginTop: 60 }}>No projects yet. Create your first project!</p>}
    </div>
  );
}

function KanbanBoard({ project, setPage }) {
  const { auth } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [dragTask, setDragTask] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", assignedToId: "", priority: "MEDIUM", deadline: "" });
  const [msg, setMsg] = useState("");

  const columns = ["TODO", "IN_PROGRESS", "DONE"];
  const colLabels = { TODO: "To Do", IN_PROGRESS: "In Progress", DONE: "Done" };
  const colColors = { TODO: "#ef5350", IN_PROGRESS: "#ff9800", DONE: "#4caf50" };

  useEffect(() => {
    apiFetch(`/tasks/project/${project.id}`, {}, auth.token).then(setTasks);
    apiFetch("/projects/all/members", {}, auth.token).then(setMembers);
  }, [project]);

  const createTask = async () => {
    try {
      const task = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ ...form, projectId: project.id, projectName: project.name })
      }, auth.token);
      setTasks(prev => [...prev, task]);
      setForm({ title: "", description: "", assignedToId: "", priority: "MEDIUM", deadline: "" });
      setShowForm(false);
      setMsg("Task created!");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) { setMsg(e.message); }
  };

  const updateStatus = async (taskId, status) => {
    try {
      const updated = await apiFetch(`/tasks/${taskId}/status?status=${status}`, { method: "PUT" }, auth.token);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (taskId) => {
    await apiFetch(`/tasks/${taskId}`, { method: "DELETE" }, auth.token);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const exportPdf = async () => {
    try {
      const response = await fetch(`${API}/tasks/project/${project.id}/export`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tasks.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  const onDrop = (e, status) => {
    e.preventDefault();
    if (dragTask && dragTask.status !== status) {
      updateStatus(dragTask.id, status);
      setDragTask(null);
    }
  };

  const priorityColor = { LOW: "#4caf50", MEDIUM: "#ff9800", HIGH: "#ef5350" };
  const card = { background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", cursor: "grab" };

  return (
    <div>
      {msg && <div style={{ background: "#d4edda", color: "#155724", padding: "10px 16px", borderRadius: 8, marginBottom: 16 }}>{msg}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <button onClick={() => setPage("projects")} style={{ background: "transparent", border: "none", color: "#1e3a5f", cursor: "pointer", fontSize: 14, marginRight: 8 }}>← Back</button>
          <h2 style={{ margin: 0, display: "inline", color: "#1e3a5f" }}>{project.name} — Kanban Board</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportPdf} style={{ background: "#4caf50", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Export PDF</button>
          <button onClick={() => setShowForm(!showForm)} style={{ background: "#1e3a5f", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>+ Add Task</button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 12px", color: "#1e3a5f" }}>Create Task</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Task title" style={{ padding: "10px", borderRadius: 8, border: "1px solid #ddd" }} />
            <select value={form.assignedToId} onChange={e => setForm({ ...form, assignedToId: e.target.value })}
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #ddd" }}>
              <option value="">Assign to...</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #ddd" }}>
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #ddd" }} />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description" rows={2} style={{ padding: "10px", borderRadius: 8, border: "1px solid #ddd", gridColumn: "span 2" }} />
          </div>
          <button onClick={createTask} style={{ marginTop: 12, background: "#1e3a5f", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Create Task</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {columns.map(col => (
          <div key={col}
            onDragOver={e => e.preventDefault()}
            onDrop={e => onDrop(e, col)}
            style={{ background: "#f8f9fa", borderRadius: 12, padding: 16, minHeight: 400 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: colColors[col], marginRight: 8 }} />
              <h3 style={{ margin: 0, fontSize: 15, color: "#1e3a5f" }}>{colLabels[col]}</h3>
              <span style={{ marginLeft: "auto", background: colColors[col], color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>
                {tasks.filter(t => t.status === col).length}
              </span>
            </div>
            {tasks.filter(t => t.status === col).map(task => (
              <div key={task.id} style={card}
                draggable
                onDragStart={() => setDragTask(task)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 14, color: "#1e3a5f" }}>{task.title}</p>
                  <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>{task.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, background: priorityColor[task.priority] + "22", color: priorityColor[task.priority], padding: "2px 8px", borderRadius: 20 }}>{task.priority}</span>
                  <span style={{ fontSize: 11, color: "#999" }}>{task.assignedToName}</span>
                </div>
                {task.deadline && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#999" }}>Due: {task.deadline}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MyTasksPage() {
  const { auth } = useAuth();
  const [tasks, setTasks] = useState([]);
  const priorityColor = { LOW: "#4caf50", MEDIUM: "#ff9800", HIGH: "#ef5350" };
  const statusColor = { TODO: "#ef5350", IN_PROGRESS: "#ff9800", DONE: "#4caf50" };

  useEffect(() => { apiFetch("/tasks/my", {}, auth.token).then(setTasks); }, []);

  return (
    <div>
      <h2 style={{ color: "#1e3a5f", marginBottom: 20 }}>My Tasks ({tasks.length})</h2>
      {tasks.length === 0 && <p style={{ color: "#999", textAlign: "center", marginTop: 60 }}>No tasks assigned to you yet.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {tasks.map(task => (
          <div key={task.id} style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 6px", color: "#1e3a5f", fontSize: 15 }}>{task.title}</h3>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#666" }}>{task.description}</p>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#999" }}>Project: {task.projectName}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, background: statusColor[task.status] + "22", color: statusColor[task.status], padding: "2px 8px", borderRadius: 20 }}>{task.status}</span>
              <span style={{ fontSize: 11, background: priorityColor[task.priority] + "22", color: priorityColor[task.priority], padding: "2px 8px", borderRadius: 20 }}>{task.priority}</span>
            </div>
            {task.deadline && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#999" }}>Due: {task.deadline}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const data = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(form) });
      login(data);
    } catch (e) { setError(isLogin ? "Invalid email or password" : e.message); }
  };

  const box = { maxWidth: 420, margin: "80px auto", background: "#fff", borderRadius: 16, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" };
  const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 14, boxSizing: "border-box", fontSize: 15 };

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <div style={box}>
        <h1 style={{ margin: "0 0 4px", color: "#1e3a5f", fontSize: 28 }}>TaskFlow</h1>
        <p style={{ margin: "0 0 24px", color: "#4fc3f7", fontSize: 14 }}>Project Management Tool</p>
        <h2 style={{ margin: "0 0 20px", color: "#333", fontSize: 20 }}>{isLogin ? "Login" : "Create Account"}</h2>
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        {!isLogin && <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" style={input} />}
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" style={input} />
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" style={input} />
        <button onClick={submit} style={{ width: "100%", background: "#1e3a5f", color: "#fff", border: "none", padding: 12, borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          {isLogin ? "Login" : "Register"}
        </button>
        <p style={{ textAlign: "center", fontSize: 14, color: "#666" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(""); }} style={{ color: "#1e3a5f", cursor: "pointer", fontWeight: 600 }}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
