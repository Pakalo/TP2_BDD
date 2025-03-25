const express = require('express')
const mongoose = require('mongoose')
const Task = require('./models/Task')
const app = express()
const port = 3000

// Middleware pour parser le JSON
app.use(express.json())

// Connexion à MongoDB (version simplifiée)
mongoose.connect('mongodb://localhost:27017/TP2')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.log('Erreur de connexion à MongoDB :', err))

// Configurer Express pour servir les fichiers statiques depuis le dossier 'public'
app.use(express.static('public'))

// GET /tasks : récupérer toutes les tâches avec filtres et tri
app.get('/tasks', async (req, res) => {
  try {
    const {
      statut,
      priorite,
      categorie,
      etiquette,
      avant,
      apres,
      q,
      tri,
      ordre = 'asc'
    } = req.query;

    // Construction du filtre
    let filter = {};

    // Filtres simples
    if (statut) filter.statut = statut;
    if (priorite) filter.priorite = priorite;
    if (categorie) filter.categorie = categorie;
    if (etiquette) filter.etiquettes = etiquette;

    // Filtre par date d'échéance
    if (avant || apres) {
      filter.echeance = {};
      if (avant) filter.echeance.$lte = new Date(avant);
      if (apres) filter.echeance.$gte = new Date(apres);
    }

    // Recherche texte dans titre ou description
    if (q) {
      filter.$or = [
        { titre: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Construction du tri
    let sort = {};
    if (tri) {
      sort[tri] = ordre === 'desc' ? -1 : 1;
    }

    const tasks = await Task.find(filter).sort(sort);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /tasks/:id : récupérer une tâche par son identifiant
app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (task) {
      res.json(task)
    } else {
      res.status(404).json({ message: 'Tâche non trouvée' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /tasks : créer une nouvelle tâche
app.post('/tasks', async (req, res) => {
  const task = new Task(req.body)
  try {
    const newTask = await task.save()
    res.status(201).json(newTask)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// PUT /tasks/:id : modifier une tâche existante
app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' })
    }

    // Créer une entrée dans l'historique des modifications
    const modifications = []
    for (const [key, value] of Object.entries(req.body)) {
      if (task[key] !== value) {
        modifications.push({
          champModifie: key,
          ancienneValeur: task[key],
          nouvelleValeur: value
        })
      }
    }

    // Ajouter les modifications à l'historique
    if (modifications.length > 0) {
      req.body.historiqueModifications = [
        ...task.historiqueModifications,
        ...modifications
      ]
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(updatedTask)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE /tasks/:id : supprimer une tâche
app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (task) {
      res.json({ message: 'Tâche supprimée' })
    } else {
      res.status(404).json({ message: 'Tâche non trouvée' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Routes pour gérer les sous-tâches
app.post('/tasks/:id/subtasks', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    task.sousTaches.push(req.body);
    const updatedTask = await task.save();
    res.status(201).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/tasks/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    const sousTache = task.sousTaches.id(req.params.subtaskId);
    if (!sousTache) {
      return res.status(404).json({ message: 'Sous-tâche non trouvée' });
    }

    Object.assign(sousTache, req.body);
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/tasks/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    task.sousTaches.id(req.params.subtaskId).remove();
    await task.save();
    res.json({ message: 'Sous-tâche supprimée' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Routes pour gérer les commentaires
app.post('/tasks/:id/comments', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    task.commentaires.push(req.body);
    const updatedTask = await task.save();
    res.status(201).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/tasks/:id/comments/:commentId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    task.commentaires.id(req.params.commentId).remove();
    await task.save();
    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})