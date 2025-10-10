"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, FolderOpen, Copy, Trash2, Edit, Clock, FileText, Eye, Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface ExportedFile {
  format: string
  filename: string
  url: string
  size: string
  generatedAt: Date
}

interface ProjectData {
  id: string
  name: string
  description: string
  status: 'draft' | 'completed' | 'published'
  createdAt: Date
  updatedAt: Date
  author: string
  wordCount: number
  chaptersCount: number
  illustrationsCount: number
  exportedFiles: ExportedFile[]
  tags: string[]
  thumbnail?: string
}

interface ProjectManagementProps {
  exportedFiles: ExportedFile[]
  projectData: {
    title: string
    author: string
    processedText: string
    illustrations: any[]
    coverData: any
    layoutSettings: any
  }
  onNext: (data: { savedProject: ProjectData }) => void
  onBack: () => void
}

export default function ProjectManagement({ exportedFiles, projectData, onNext, onBack }: ProjectManagementProps) {
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null)
  const [savedProjects, setSavedProjects] = useState<ProjectData[]>([])
  const [projectName, setProjectName] = useState(projectData.title || "")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectTags, setProjectTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [projectStatus, setProjectStatus] = useState<'draft' | 'completed' | 'published'>('completed')
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Statuts de projet disponibles
  const projectStatuses = [
    { value: 'draft', label: 'Brouillon', description: 'Projet en cours de création', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Terminé', description: 'Projet finalisé et prêt', color: 'bg-green-100 text-green-800' },
    { value: 'published', label: 'Publié', description: 'Projet publié et distribué', color: 'bg-blue-100 text-blue-800' }
  ]

  // Tags prédéfinis
  const predefinedTags = [
    'Fiction', 'Non-fiction', 'Roman', 'Essai', 'Guide', 'Manuel', 'Biographie', 
    'Histoire', 'Science', 'Technologie', 'Art', 'Cuisine', 'Voyage', 'Santé',
    'Développement personnel', 'Business', 'Éducation', 'Enfants', 'Jeunesse'
  ]

  // Charger les projets sauvegardés au démarrage
  useEffect(() => {
    loadSavedProjects()
  }, [])

  // Auto-sauvegarde toutes les 2 minutes
  useEffect(() => {
    if (!autoSaveEnabled || !currentProject) return

    const interval = setInterval(() => {
      if (currentProject) {
        saveProject(true) // Sauvegarde silencieuse
      }
    }, 2 * 60 * 1000) // 2 minutes

    return () => clearInterval(interval)
  }, [autoSaveEnabled, currentProject])

  // Fonction pour charger les projets sauvegardés
  const loadSavedProjects = () => {
    try {
      const saved = localStorage.getItem('hb-creator-projects')
      if (saved) {
        const projects = JSON.parse(saved).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          exportedFiles: p.exportedFiles.map((f: any) => ({
            ...f,
            generatedAt: new Date(f.generatedAt)
          }))
        }))
        setSavedProjects(projects)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des projets:', err)
    }
  }

  // Fonction pour sauvegarder les projets
  const saveProjectsToStorage = (projects: ProjectData[]) => {
    try {
      localStorage.setItem('hb-creator-projects', JSON.stringify(projects))
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError("Erreur lors de la sauvegarde des projets")
    }
  }

  // Fonction pour créer un nouveau projet
  const createNewProject = (): ProjectData => {
    const now = new Date()
    return {
      id: `project_${now.getTime()}`,
      name: projectName || projectData.title,
      description: projectDescription,
      status: projectStatus,
      createdAt: now,
      updatedAt: now,
      author: projectData.author,
      wordCount: projectData.processedText.split(/\s+/).length,
      chaptersCount: (projectData.processedText.match(/(?:^|\n)((?:Chapitre|Chapter|#)\s*\d+)/gmi) || []).length || 1,
      illustrationsCount: projectData.illustrations.length,
      exportedFiles: exportedFiles,
      tags: projectTags,
      thumbnail: projectData.coverData?.imageUrl
    }
  }

  // Fonction pour sauvegarder le projet
  const saveProject = async (silent = false) => {
    if (!projectName.trim()) {
      setError("Veuillez saisir un nom de projet")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const newProject = createNewProject()
      
      // Vérifier si c'est une mise à jour ou un nouveau projet
      const existingIndex = savedProjects.findIndex(p => p.id === currentProject?.id)
      let updatedProjects: ProjectData[]

      if (existingIndex >= 0) {
        // Mise à jour d'un projet existant
        updatedProjects = [...savedProjects]
        updatedProjects[existingIndex] = { ...newProject, id: currentProject!.id, createdAt: currentProject!.createdAt }
      } else {
        // Nouveau projet
        updatedProjects = [newProject, ...savedProjects]
      }

      setSavedProjects(updatedProjects)
      setCurrentProject(newProject)
      saveProjectsToStorage(updatedProjects)
      setLastSaved(new Date())

      if (!silent) {
        setSuccess("Projet sauvegardé avec succès")
      }

    } catch (err) {
      setError("Erreur lors de la sauvegarde du projet")
    } finally {
      setIsSaving(false)
    }
  }

  // Fonction pour dupliquer un projet
  const duplicateProject = (project: ProjectData) => {
    const now = new Date()
    const duplicatedProject: ProjectData = {
      ...project,
      id: `project_${now.getTime()}`,
      name: `${project.name} (Copie)`,
      createdAt: now,
      updatedAt: now,
      status: 'draft'
    }

    const updatedProjects = [duplicatedProject, ...savedProjects]
    setSavedProjects(updatedProjects)
    saveProjectsToStorage(updatedProjects)
    setSuccess(`Projet "${project.name}" dupliqué`)
  }

  // Fonction pour supprimer un projet
  const deleteProject = (projectId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      return
    }

    const updatedProjects = savedProjects.filter(p => p.id !== projectId)
    setSavedProjects(updatedProjects)
    saveProjectsToStorage(updatedProjects)
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
    }
    
    setSuccess("Projet supprimé")
  }

  // Fonction pour charger un projet
  const loadProject = (project: ProjectData) => {
    setCurrentProject(project)
    setProjectName(project.name)
    setProjectDescription(project.description)
    setProjectTags(project.tags)
    setProjectStatus(project.status)
    setSuccess(`Projet "${project.name}" chargé`)
  }

  // Fonction pour ajouter un tag
  const addTag = (tag: string) => {
    if (tag && !projectTags.includes(tag)) {
      setProjectTags(prev => [...prev, tag])
      setNewTag("")
    }
  }

  // Fonction pour supprimer un tag
  const removeTag = (tagToRemove: string) => {
    setProjectTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  // Fonction pour passer à l'étape suivante
  const handleNext = () => {
    if (!currentProject) {
      setError("Veuillez d'abord sauvegarder le projet")
      return
    }

    onNext({ savedProject: currentProject })
  }

  // Calculer les statistiques
  const calculateStats = () => {
    const totalProjects = savedProjects.length
    const draftProjects = savedProjects.filter(p => p.status === 'draft').length
    const completedProjects = savedProjects.filter(p => p.status === 'completed').length
    const publishedProjects = savedProjects.filter(p => p.status === 'published').length
    const totalWords = savedProjects.reduce((sum, p) => sum + p.wordCount, 0)

    return {
      totalProjects,
      draftProjects,
      completedProjects,
      publishedProjects,
      totalWords
    }
  }

  const stats = calculateStats()
  const statusInfo = projectStatuses.find(s => s.value === projectStatus)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Étape 7 : Sauvegarde et gestion des projets</h2>
        <p className="text-gray-600">Sauvegardez votre projet et gérez votre bibliothèque d'ebooks. Sauvegarde automatique toutes les 2 minutes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sauvegarde du projet actuel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du projet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Sauvegarder le projet</span>
              </CardTitle>
              <CardDescription>
                Donnez un nom à votre projet et configurez ses paramètres
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="project-name">Nom du projet *</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Mon super ebook"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="project-description">Description (optionnel)</Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Description courte de votre projet..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div>
                <Label>Statut du projet</Label>
                <Select value={projectStatus} onValueChange={(value: any) => setProjectStatus(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div>
                          <div className="font-medium">{status.label}</div>
                          <div className="text-xs text-gray-500">{status.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {statusInfo && (
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {projectTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Ajouter un tag..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
                    />
                    <Button onClick={() => addTag(newTag)} variant="outline" size="sm">
                      Ajouter
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {predefinedTags.filter(tag => !projectTags.includes(tag)).slice(0, 6).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Options de sauvegarde */}
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="auto-save"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="auto-save">Sauvegarde automatique (toutes les 2 minutes)</Label>
                </div>

                {lastSaved && (
                  <div className="text-sm text-gray-600 mb-4">
                    Dernière sauvegarde : {lastSaved.toLocaleString('fr-FR')}
                  </div>
                )}

                <Button
                  onClick={() => saveProject()}
                  disabled={isSaving || !projectName.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sauvegarde...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Sauvegarder le projet</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des projets sauvegardés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5" />
                <span>Projets sauvegardés ({savedProjects.length})</span>
              </CardTitle>
              <CardDescription>
                Gérez vos projets existants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun projet sauvegardé</p>
                  <p className="text-sm">Sauvegardez votre premier projet ci-dessus</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {savedProjects.map((project) => (
                    <Card key={project.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900">{project.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                projectStatuses.find(s => s.value === project.status)?.color
                              }`}>
                                {projectStatuses.find(s => s.value === project.status)?.label}
                              </span>
                            </div>
                            
                            {project.description && (
                              <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                              <span>{project.wordCount.toLocaleString()} mots</span>
                              <span>{project.chaptersCount} chapitres</span>
                              <span>{project.illustrationsCount} illustrations</span>
                              <span>{project.exportedFiles.length} exports</span>
                            </div>
                            
                            {project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {project.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {project.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">+{project.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500">
                              Créé le {project.createdAt.toLocaleDateString('fr-FR')} • 
                              Modifié le {project.updatedAt.toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-4">
                            <Button
                              onClick={() => loadProject(project)}
                              size="sm"
                              variant="ghost"
                              title="Charger le projet"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => duplicateProject(project)}
                              size="sm"
                              variant="ghost"
                              title="Dupliquer"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => deleteProject(project.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panneau de statistiques */}
        <div className="space-y-6">
          {/* Statistiques générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total projets :</span>
                <span className="font-medium">{stats.totalProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Brouillons :</span>
                <span className="font-medium">{stats.draftProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Terminés :</span>
                <span className="font-medium">{stats.completedProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Publiés :</span>
                <span className="font-medium">{stats.publishedProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total mots :</span>
                <span className="font-medium">{stats.totalWords.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Projet actuel */}
          {currentProject && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projet actuel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom :</span>
                  <span className="font-medium text-right">{currentProject.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut :</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    projectStatuses.find(s => s.value === currentProject.status)?.color
                  }`}>
                    {projectStatuses.find(s => s.value === currentProject.status)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mots :</span>
                  <span className="font-medium">{currentProject.wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chapitres :</span>
                  <span className="font-medium">{currentProject.chaptersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exports :</span>
                  <span className="font-medium">{currentProject.exportedFiles.length}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fichiers exportés du projet actuel */}
          {exportedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fichiers exportés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exportedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{file.format}</span>
                      </div>
                      <div className="text-xs text-gray-500">{file.size}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations de stockage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stockage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Type :</span>
                <span className="font-medium">Local (navigateur)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auto-sauvegarde :</span>
                <span className="font-medium">{autoSaveEnabled ? 'Activée' : 'Désactivée'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fréquence :</span>
                <span className="font-medium">2 minutes</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Les projets sont sauvegardés localement dans votre navigateur.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Messages de statut */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Erreur</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Succès</span>
          </div>
          <p className="text-green-700 mt-1">{success}</p>
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="flex justify-between pt-8">
        <Button onClick={onBack} variant="outline">
          Retour
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!currentProject}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Terminer
        </Button>
      </div>
    </div>
  )
}