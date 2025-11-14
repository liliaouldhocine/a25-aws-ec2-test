const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend en production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
}

// Stockage en mémoire
let tasks = [
  {
    id: "1",
    title: "Apprendre AWS",
    description: "Déployer une application React/Node.js",
    completed: false,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Configurer le déploiement",
    description: "Mettre en place EC2",
    completed: true,
    createdAt: new Date(),
  },
];

// Routes API
app.get("/api", (req, res) => {
  res.json({
    message: "API Task Manager fonctionne!",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/api/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
  res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Le titre est requis" });
  }

  const newTask = {
    id: uuidv4(),
    title,
    description: description || "",
    completed: false,
    createdAt: new Date(),
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.params.id);
  if (taskIndex === -1)
    return res.status(404).json({ error: "Tâche non trouvée" });

  const { title, description, completed } = req.body;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title || tasks[taskIndex].title,
    description:
      description !== undefined ? description : tasks[taskIndex].description,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed,
  };

  res.json(tasks[taskIndex]);
});

app.delete("/api/tasks/:id", (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.params.id);
  if (taskIndex === -1)
    return res.status(404).json({ error: "Tâche non trouvée" });

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Route catch-all pour SPA en production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
