import React, { useState, useEffect } from "react";
import axios from "axios";

// Configuration de l'URL API
const getApiBaseUrl = () => {
  if (import.meta.env.MODE === "development") {
    return "http://localhost:3000/api";
  } else {
    return "/api"; // En production, utilise le même domaine
  }
};

const API_BASE_URL = getApiBaseUrl();

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(response.data);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des tâches");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setError("Le titre est requis");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, newTask);
      setTasks((prev) => [response.data, ...prev]);
      setNewTask({ title: "", description: "" });
      setSuccess("Tâche créée avec succès!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erreur lors de la création de la tâche");
      console.error("Error creating task:", err);
    }
  };

  const toggleTaskCompletion = async (taskId, completed) => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${taskId}`, {
        completed: !completed,
      });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: !completed } : task
        )
      );
      setSuccess("Tâche mise à jour!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erreur lors de la mise à jour de la tâche");
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setSuccess("Tâche supprimée!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erreur lors de la suppression de la tâche");
      console.error("Error deleting task:", err);
    }
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="container">
      <div className="header">
        <h1>🚀 Task Manager AWS</h1>
        <p>Application React + Node.js déployée sur EC2</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="stats">
        <h3>📊 Statistiques</h3>
        <p>
          {completedTasks} sur {totalTasks} tâches complétées (
          {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}
          %)
        </p>
      </div>

      <div className="task-form">
        <h2>➕ Nouvelle Tâche</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              placeholder="Quelle est votre prochaine tâche ?"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              placeholder="Détails de la tâche (optionnel)"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            ➕ Ajouter la tâche
          </button>
        </form>
      </div>

      <div className="task-list">
        <h2 style={{ color: "white", marginBottom: "20px" }}>
          📋 Mes Tâches ({tasks.length})
        </h2>

        {loading ? (
          <div className="loading">Chargement des tâches...</div>
        ) : tasks.length === 0 ? (
          <div className="loading">
            🎉 Aucune tâche pour le moment. Créez-en une !
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`task-card ${task.completed ? "completed" : ""}`}
            >
              <div className="task-header">
                <div
                  className={`task-title ${task.completed ? "completed" : ""}`}
                  onClick={() => toggleTaskCompletion(task.id, task.completed)}
                >
                  {task.completed ? "✅" : "📝"} {task.title}
                </div>
                <div className="task-actions">
                  <button
                    className="btn-complete"
                    onClick={() =>
                      toggleTaskCompletion(task.id, task.completed)
                    }
                    title={
                      task.completed
                        ? "Marquer non terminée"
                        : "Marquer terminée"
                    }
                  >
                    {task.completed ? "↶" : "✓"}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => deleteTask(task.id)}
                    title="Supprimer la tâche"
                  >
                    ×
                  </button>
                </div>
              </div>

              {task.description && (
                <div className="task-description">{task.description}</div>
              )}

              <div className="task-meta">
                Créée le{" "}
                {new Date(task.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {task.completed && " • ✅ Terminée"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
