const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: String,
  dateCreation: {
    type: Date,
    default: Date.now
  },
  echeance: Date,
  statut: {
    type: String,
    enum: ['à faire', 'en cours', 'terminée', 'annulée'],
    default: 'à faire'
  },
  priorite: {
    type: String,
    enum: ['basse', 'moyenne', 'haute', 'critique'],
    default: 'moyenne'
  },
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
    date: {
      type: Date,
      default: Date.now
    },
    contenu: String
  }],
  historiqueModifications: [{
    champModifie: String,
    ancienneValeur: mongoose.Schema.Types.Mixed,
    nouvelleValeur: mongoose.Schema.Types.Mixed,
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('Task', taskSchema); 