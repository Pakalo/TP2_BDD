// Variables globales
let currentTaskId = null;

// Fonctions utilitaires
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
};

// Chargement initial des tâches
async function loadTasks() {
    try {
        const response = await fetch('/tasks');
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
    }
}

// Affichage des tâches
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-card priority-${task.priorite}">
            <div class="priority-badge" style="background-color: ${getPriorityColor(task.priorite)}">
                ${task.priorite.toUpperCase()}
            </div>
            <div class="task-header">
                <h3>${task.titre}</h3>
                <div class="task-actions">
                    <button class="btn-details" onclick="openDetailsModal('${task._id}')">Détails</button>
                    <button class="btn-edit" onclick="openTaskModal('${task._id}')">Modifier</button>
                    <button class="btn-delete" onclick="deleteTask('${task._id}')">Supprimer</button>
                </div>
            </div>
            <p>${task.description || 'Aucune description'}</p>
            <div class="task-info">
                <span>Statut: ${task.statut}</span>
                <span>Échéance: ${formatDate(task.echeance)}</span>
                <span>Sous-tâches: ${task.sousTaches?.length || 0}</span>
            </div>
        </div>
    `).join('');
}

// Fonction pour obtenir la couleur selon la priorité
function getPriorityColor(priority) {
    const colors = {
        'critique': '#ff0000',
        'haute': '#ff4444',
        'moyenne': '#ffbb33',
        'basse': '#00C851'
    };
    return colors[priority] || '#ddd';
}

// Gestion des modals
function openTaskModal(taskId = null) {
    currentTaskId = taskId;
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    
    if (taskId) {
        // Mode modification
        fetch(`/tasks/${taskId}`)
            .then(response => response.json())
            .then(task => {
                document.getElementById('modalTitle').textContent = 'Modifier la tâche';
                document.getElementById('titre').value = task.titre;
                document.getElementById('description').value = task.description;
                document.getElementById('echeance').value = task.echeance.split('T')[0];
                document.getElementById('statut').value = task.statut;
                document.getElementById('priorite').value = task.priorite;
            });
    } else {
        // Mode création
        document.getElementById('modalTitle').textContent = 'Nouvelle tâche';
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Gestion des formulaires
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskData = {
        titre: document.getElementById('titre').value,
        description: document.getElementById('description').value,
        echeance: document.getElementById('echeance').value,
        statut: document.getElementById('statut').value,
        priorite: document.getElementById('priorite').value
    };

    try {
        const url = currentTaskId ? `/tasks/${currentTaskId}` : '/tasks';
        const method = currentTaskId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            document.getElementById('taskModal').style.display = 'none';
            loadTasks();
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
});

// Gestion des filtres
async function applyFilters() {
    const status = document.getElementById('statusFilter').value;
    const priority = document.getElementById('priorityFilter').value;
    const search = document.getElementById('searchInput').value;

    let url = '/tasks?';
    if (status) url += `statut=${status}&`;
    if (priority) url += `priorite=${priority}&`;
    if (search) url += `q=${search}`;

    try {
        const response = await fetch(url);
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Erreur lors du filtrage:', error);
    }
}

// Suppression d'une tâche
async function deleteTask(taskId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadTasks();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Fermeture des modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').style.display = 'none';
        }
    });
});

// Fonction pour fermer les modals
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Mise à jour de la fonction openDetailsModal
async function openDetailsModal(taskId) {
    try {
        const response = await fetch(`/tasks/${taskId}`);
        const task = await response.json();
        
        const detailsModal = document.getElementById('detailsModal');
        const taskDetails = document.getElementById('taskDetails');
        
        taskDetails.innerHTML = `
            <div class="task-details-header">
                <h2>${task.titre}</h2>
                <div class="priority-badge" style="background-color: ${getPriorityColor(task.priorite)}">
                    ${task.priorite.toUpperCase()}
                </div>
            </div>
            
            <div class="task-details-info">
                <p><strong>Description:</strong> ${task.description || 'Aucune description'}</p>
                <p><strong>Statut:</strong> ${task.statut}</p>
                <p><strong>Échéance:</strong> ${formatDate(task.echeance)}</p>
                <p><strong>Date de création:</strong> ${formatDate(task.dateCreation)}</p>
            </div>
            
            <div class="subtasks-section">
                <h3>Sous-tâches</h3>
                <div class="subtasks-list">
                    ${task.sousTaches?.length ? task.sousTaches.map(subtask => `
                        <div class="subtask-item">
                            <input type="checkbox" 
                                   class="subtask-checkbox"
                                   ${subtask.statut === 'terminée' ? 'checked' : ''}
                                   onchange="updateSubtaskStatus('${task._id}', '${subtask._id}')">
                            <div class="subtask-content">
                                <span class="subtask-title">${subtask.titre}</span>
                                <span class="subtask-date">${formatDate(subtask.echeance)}</span>
                            </div>
                        </div>
                    `).join('') : '<p>Aucune sous-tâche</p>'}
                </div>
                <form id="subtaskForm" onsubmit="addSubtask(event, '${task._id}')">
                    <input type="text" id="newSubtask" placeholder="Nouvelle sous-tâche" required>
                    <button type="submit">Ajouter</button>
                </form>
            </div>
            
            <div class="comments-section">
                <h3>Commentaires</h3>
                <div class="comments-list">
                    ${task.commentaires?.length ? task.commentaires.map(comment => `
                        <div class="comment-item">
                            <div class="comment-header">
                                <span>${comment.auteur?.nom} ${comment.auteur?.prenom}</span>
                                <span>${formatDate(comment.date)}</span>
                            </div>
                            <p>${comment.contenu}</p>
                        </div>
                    `).join('') : '<p>Aucun commentaire</p>'}
                </div>
                <form id="commentForm" onsubmit="addComment(event, '${task._id}')">
                    <textarea id="newComment" placeholder="Nouveau commentaire" required></textarea>
                    <button type="submit">Ajouter un commentaire</button>
                </form>
            </div>
        `;
        
        detailsModal.style.display = 'block';
    } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
    }
}

// Fonction pour ajouter une sous-tâche
async function addSubtask(event, taskId) {
    event.preventDefault();
    const input = document.getElementById('newSubtask');
    const subtaskTitle = input.value.trim();
    
    if (!subtaskTitle) return;
    
    try {
        const response = await fetch(`/tasks/${taskId}/subtasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titre: subtaskTitle,
                statut: 'à faire',
                echeance: new Date().toISOString().split('T')[0]
            })
        });
        
        if (response.ok) {
            input.value = '';
            openDetailsModal(taskId); // Rafraîchir les détails
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la sous-tâche:', error);
    }
}

// Fonction pour ajouter un commentaire
async function addComment(event, taskId) {
    event.preventDefault();
    const textarea = document.getElementById('newComment');
    const commentContent = textarea.value.trim();
    
    if (!commentContent) return;
    
    try {
        const response = await fetch(`/tasks/${taskId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                auteur: {
                    nom: 'Utilisateur',
                    prenom: 'Test',
                    email: 'test@example.com'
                },
                contenu: commentContent
            })
        });
        
        if (response.ok) {
            textarea.value = '';
            openDetailsModal(taskId); // Rafraîchir les détails
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
    }
}

// Fonction pour mettre à jour le statut d'une sous-tâche
async function updateSubtaskStatus(taskId, subtaskId) {
    try {
        const response = await fetch(`/tasks/${taskId}/subtasks/${subtaskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                statut: 'terminée'
            })
        });
        
        if (response.ok) {
            openDetailsModal(taskId); // Rafraîchir les détails
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la sous-tâche:', error);
    }
} 