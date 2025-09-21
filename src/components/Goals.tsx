import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, Circle, Target, TrendingUp } from 'lucide-react';
import { useCycleStorage } from '../hooks/useCycleStorage';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'behavioral' | 'social' | 'religious';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  targetDate: string;
  progress: number;
  createdAt: string;
}

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'academic' | 'behavioral' | 'social' | 'religious'>('all');
  
  const { getStorage, setStorage } = useCycleStorage();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const savedGoals = getStorage('school-goals');
    if (savedGoals) {
      setGoals(savedGoals);
    }
  };

  const saveGoals = (newGoals: Goal[]) => {
    setStorage('school-goals', newGoals);
    setGoals(newGoals);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newGoal: Goal = {
      id: editingGoal?.id || generateId(),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as Goal['category'],
      priority: formData.get('priority') as Goal['priority'],
      status: formData.get('status') as Goal['status'],
      targetDate: formData.get('targetDate') as string,
      progress: parseInt(formData.get('progress') as string) || 0,
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
    };

    if (editingGoal) {
      const updatedGoals = goals.map(goal => goal.id === editingGoal.id ? newGoal : goal);
      saveGoals(updatedGoals);
      setEditingGoal(null);
    } else {
      saveGoals([...goals, newGoal]);
    }
    
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
  };

  const deleteGoal = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      const updatedGoals = goals.filter(goal => goal.id !== id);
      saveGoals(updatedGoals);
    }
  };

  const updateProgress = (id: string, progress: number) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id ? { ...goal, progress } : goal
    );
    saveGoals(updatedGoals);
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'academic': return '📚';
      case 'behavioral': return '🎯';
      case 'social': return '👥';
      case 'religious': return '🕌';
      default: return '📋';
    }
  };

  const filteredGoals = goals.filter(goal => {
    const statusMatch = filter === 'all' || goal.status === filter;
    const categoryMatch = categoryFilter === 'all' || goal.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Objectifs Pédagogiques</h1>
        <p className="text-gray-600">Gérez les objectifs et les buts éducatifs de votre école</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Objectifs</p>
              <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Complétés</p>
              <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Circle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Cours</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals.filter(g => g.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Complétés</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="academic">Académique</option>
              <option value="behavioral">Comportemental</option>
              <option value="social">Social</option>
              <option value="religious">Religieux</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvel Objectif
          </button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingGoal ? 'Modifier l\'objectif' : 'Nouvel objectif'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingGoal?.title}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingGoal?.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    defaultValue={editingGoal?.category || 'academic'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="academic">Académique</option>
                    <option value="behavioral">Comportemental</option>
                    <option value="social">Social</option>
                    <option value="religious">Religieux</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité *
                  </label>
                  <select
                    name="priority"
                    defaultValue={editingGoal?.priority || 'medium'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut *
                  </label>
                  <select
                    name="status"
                    defaultValue={editingGoal?.status || 'pending'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="in-progress">En cours</option>
                    <option value="completed">Complété</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date cible
                  </label>
                  <input
                    type="date"
                    name="targetDate"
                    defaultValue={editingGoal?.targetDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progression (%)
                </label>
                <input
                  type="number"
                  name="progress"
                  min="0"
                  max="100"
                  defaultValue={editingGoal?.progress || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGoal(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingGoal ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des objectifs */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun objectif trouvé</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' && categoryFilter === 'all' 
                ? 'Commencez par créer votre premier objectif pédagogique.'
                : 'Aucun objectif ne correspond aux filtres sélectionnés.'
              }
            </p>
            {filter === 'all' && categoryFilter === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Créer un objectif
              </button>
            )}
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                      {goal.priority === 'high' ? 'Élevée' : goal.priority === 'medium' ? 'Moyenne' : 'Faible'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                      {goal.status === 'completed' ? 'Complété' : goal.status === 'in-progress' ? 'En cours' : 'En attente'}
                    </span>
                  </div>
                  
                  {goal.description && (
                    <p className="text-gray-600 mb-3">{goal.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    {goal.targetDate && (
                      <span>Date cible: {new Date(goal.targetDate).toLocaleDateString('fr-FR')}</span>
                    )}
                    <span>Créé le: {new Date(goal.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progression</span>
                      <span className="text-sm text-gray-500">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Goals; 