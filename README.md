# Gestionnaire de Tâches

Une application web de gestion de tâches développée avec Node.js, Express, MongoDB et JavaScript vanilla.

## 🚀 Fonctionnalités

- ✅ Gestion complète des tâches (CRUD)
- 📋 Sous-tâches et commentaires
- 🏷️ Système de priorités et de statuts
- 🔍 Filtrage avancé des tâches
- 📱 Interface responsive

### Gestion des Tâches

- Création, modification et suppression de tâches
- Statuts : à faire, en cours, terminée, annulée
- Priorités : basse, moyenne, haute, critique
- Dates d'échéance
- Catégorisation des tâches

### Fonctionnalités Avancées

- Gestion des sous-tâches
- Système de commentaires
- Historique des modifications
- Filtrage multi-critères
- Recherche textuelle

## 🛠️ Technologies Utilisées

- **Backend**

  - Node.js
  - Express.js
  - MongoDB
  - Mongoose

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript (Vanilla)

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)

## 🔧 Installation

1. Clonez le repository :

```bash
git clone [url-du-repo]
```

2. Installez les dépendances :

```bash
cd [nom-du-projet]
npm install
```

3. Créez un fichier `.env` à la racine du projet :

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/TP2
```

4. Démarrez le serveur :

```bash
npm start
```

## 📊 Structure de la Base de Données

### Collection `tasks`

```javascript
{
  titre: String,
  description: String,
  dateCreation: Date,
  echeance: Date,
  statut: String,
  priorite: String,
  auteur: {
    nom: String,
    prenom: String,
    email: String
  },
  categorie: String,
  etiquettes: [String],
  sousTaches: [{
    titre: String,
    statut: String,
    echeance: Date
  }],
  commentaires: [{
    auteur: {
      nom: String,
      prenom: String,
      email: String
    },
    date: Date,
    contenu: String
  }],
  historiqueModifications: [{
    champModifie: String,
    ancienneValeur: Mixed,
    nouvelleValeur: Mixed,
    date: Date
  }]
}
```

## 🔗 API Endpoints

### Tâches

- `GET /tasks` - Récupérer toutes les tâches
- `GET /tasks/:id` - Récupérer une tâche spécifique
- `POST /tasks` - Créer une nouvelle tâche
- `PUT /tasks/:id` - Modifier une tâche
- `DELETE /tasks/:id` - Supprimer une tâche

### Sous-tâches

- `POST /tasks/:id/subtasks` - Ajouter une sous-tâche
- `PUT /tasks/:id/subtasks/:subtaskId` - Modifier une sous-tâche
- `DELETE /tasks/:id/subtasks/:subtaskId` - Supprimer une sous-tâche

### Commentaires

- `POST /tasks/:id/comments` - Ajouter un commentaire
- `DELETE /tasks/:id/comments/:commentId` - Supprimer un commentaire

## 🔍 Paramètres de Filtrage

| Paramètre | Example                   | Description           |
| --------- | ------------------------- | --------------------- |
| statut    | `/tasks?statut=à faire`   | Filtrer par statut    |
| priorite  | `/tasks?priorite=haute`   | Filtrer par priorité  |
| categorie | `/tasks?categorie=perso`  | Filtrer par catégorie |
| etiquette | `/tasks?etiquette=urgent` | Filtrer par étiquette |
| avant     | `/tasks?avant=2024-12-31` | Tâches avant une date |
| apres     | `/tasks?apres=2024-01-01` | Tâches après une date |
| q         | `/tasks?q=rapport`        | Recherche textuelle   |

## 👥 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
