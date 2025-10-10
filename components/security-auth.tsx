"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Shield, User, Key, Zap, Crown, AlertTriangle, CheckCircle, Lock, Unlock, Eye, EyeOff } from "lucide-react"

interface SecurityAuthProps {
  onComplete: (data: { user: UserData; subscription: SubscriptionData }) => void
}

interface UserData {
  id: string
  email: string
  name: string
  avatar?: string
  isAuthenticated: boolean
  authMethod: 'email' | 'google' | 'guest'
  createdAt: Date
}

interface SubscriptionData {
  plan: 'free' | 'premium' | 'pro'
  limits: {
    monthlyEbooks: number
    usedEbooks: number
    aiGenerations: number
    usedGenerations: number
    illustrations: number
    usedIllustrations: number
    storageGB: number
    usedStorageGB: number
  }
  features: string[]
  expiresAt?: Date
}

export default function SecurityAuth({ onComplete }: SecurityAuthProps) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('guest')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Plans d'abonnement disponibles
  const subscriptionPlans = [
    {
      plan: 'free' as const,
      name: 'Gratuit',
      price: '0€/mois',
      limits: {
        monthlyEbooks: 3,
        usedEbooks: 0,
        aiGenerations: 10,
        usedGenerations: 0,
        illustrations: 5,
        usedIllustrations: 0,
        storageGB: 1,
        usedStorageGB: 0
      },
      features: [
        '3 ebooks par mois',
        '10 générations IA par mois',
        '5 illustrations par mois',
        '1 GB de stockage',
        'Filigrane sur les exports',
        'Templates de base',
        'Support communautaire'
      ],
      color: 'bg-gray-100 text-gray-800',
      icon: <User className="h-5 w-5" />
    },
    {
      plan: 'premium' as const,
      name: 'Premium',
      price: '9.99€/mois',
      limits: {
        monthlyEbooks: 25,
        usedEbooks: 0,
        aiGenerations: 100,
        usedGenerations: 0,
        illustrations: 50,
        usedIllustrations: 0,
        storageGB: 10,
        usedStorageGB: 0
      },
      features: [
        '25 ebooks par mois',
        '100 générations IA par mois',
        '50 illustrations par mois',
        '10 GB de stockage',
        'Exports sans filigrane',
        'Tous les templates',
        'Support prioritaire',
        'Styles d\'illustration avancés'
      ],
      color: 'bg-blue-100 text-blue-800',
      icon: <Zap className="h-5 w-5" />
    },
    {
      plan: 'pro' as const,
      name: 'Professionnel',
      price: '19.99€/mois',
      limits: {
        monthlyEbooks: 100,
        usedEbooks: 0,
        aiGenerations: 500,
        usedGenerations: 0,
        illustrations: 200,
        usedIllustrations: 0,
        storageGB: 50,
        usedStorageGB: 0
      },
      features: [
        '100 ebooks par mois',
        '500 générations IA par mois',
        '200 illustrations par mois',
        '50 GB de stockage',
        'Exports sans filigrane',
        'Templates premium exclusifs',
        'Support dédié 24/7',
        'API access',
        'Collaboration en équipe',
        'Branding personnalisé'
      ],
      color: 'bg-purple-100 text-purple-800',
      icon: <Crown className="h-5 w-5" />
    }
  ]

  // Charger les données utilisateur au démarrage
  useEffect(() => {
    loadUserData()
  }, [])

  // Fonction pour charger les données utilisateur depuis le stockage local
  const loadUserData = () => {
    try {
      const savedUser = localStorage.getItem('hb-creator-user')
      const savedSubscription = localStorage.getItem('hb-creator-subscription')
      
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setCurrentUser({
          ...userData,
          createdAt: new Date(userData.createdAt)
        })
      }
      
      if (savedSubscription) {
        const subData = JSON.parse(savedSubscription)
        setSubscription({
          ...subData,
          expiresAt: subData.expiresAt ? new Date(subData.expiresAt) : undefined
        })
      } else {
        // Plan gratuit par défaut
        setSubscription(subscriptionPlans[0])
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err)
    }
  }

  // Fonction pour sauvegarder les données utilisateur
  const saveUserData = (user: UserData, sub: SubscriptionData) => {
    try {
      localStorage.setItem('hb-creator-user', JSON.stringify(user))
      localStorage.setItem('hb-creator-subscription', JSON.stringify(sub))
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
    }
  }

  // Fonction de connexion par email
  const handleEmailAuth = async () => {
    if (!email.trim() || (!password.trim() && authMode !== 'guest')) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulation d'authentification
      await new Promise(resolve => setTimeout(resolve, 1500))

      const userData: UserData = {
        id: `user_${Date.now()}`,
        email: email,
        name: name || email.split('@')[0],
        isAuthenticated: true,
        authMethod: 'email',
        createdAt: new Date()
      }

      const defaultSubscription = subscriptionPlans[0] // Plan gratuit

      setCurrentUser(userData)
      setSubscription(defaultSubscription)
      saveUserData(userData, defaultSubscription)
      setSuccess(`${authMode === 'register' ? 'Compte créé' : 'Connexion réussie'} !`)

    } catch (err) {
      setError("Erreur lors de l'authentification")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de connexion Google (simulation)
  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Simulation d'authentification Google
      await new Promise(resolve => setTimeout(resolve, 2000))

      const userData: UserData = {
        id: `google_${Date.now()}`,
        email: "utilisateur@gmail.com",
        name: "Utilisateur Google",
        avatar: "https://via.placeholder.com/40/4285f4/ffffff?text=G",
        isAuthenticated: true,
        authMethod: 'google',
        createdAt: new Date()
      }

      const defaultSubscription = subscriptionPlans[0] // Plan gratuit

      setCurrentUser(userData)
      setSubscription(defaultSubscription)
      saveUserData(userData, defaultSubscription)
      setSuccess("Connexion Google réussie !")

    } catch (err) {
      setError("Erreur lors de la connexion Google")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour continuer en tant qu'invité
  const handleGuestMode = () => {
    const guestData: UserData = {
      id: `guest_${Date.now()}`,
      email: "guest@hb-creator.com",
      name: "Utilisateur Invité",
      isAuthenticated: false,
      authMethod: 'guest',
      createdAt: new Date()
    }

    const guestSubscription = subscriptionPlans[0] // Plan gratuit avec limites réduites

    setCurrentUser(guestData)
    setSubscription(guestSubscription)
    setSuccess("Mode invité activé")
  }

  // Fonction pour changer d'abonnement
  const upgradePlan = (planType: 'free' | 'premium' | 'pro') => {
    const newPlan = subscriptionPlans.find(p => p.plan === planType)
    if (!newPlan || !currentUser) return

    const updatedSubscription: SubscriptionData = {
      ...newPlan,
      expiresAt: planType !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined // 30 jours
    }

    setSubscription(updatedSubscription)
    saveUserData(currentUser, updatedSubscription)
    setSuccess(`Abonnement ${newPlan.name} activé !`)
  }

  // Fonction pour se déconnecter
  const handleLogout = () => {
    localStorage.removeItem('hb-creator-user')
    localStorage.removeItem('hb-creator-subscription')
    setCurrentUser(null)
    setSubscription(null)
    setSuccess("Déconnexion réussie")
  }

  // Fonction pour terminer la configuration
  const handleComplete = () => {
    if (!currentUser || !subscription) {
      setError("Veuillez vous authentifier d'abord")
      return
    }

    onComplete({
      user: currentUser,
      subscription: subscription
    })
  }

  // Calculer les pourcentages d'utilisation
  const getUsagePercentage = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100)
  }

  // Vérifier si une limite est atteinte
  const isLimitReached = (used: number, total: number) => {
    return used >= total
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Étape 8 : Sécurité et authentification</h2>
        <p className="text-gray-600">Connectez-vous pour sauvegarder vos projets et accéder à toutes les fonctionnalités. Choisissez votre plan selon vos besoins.</p>
      </div>

      {!currentUser ? (
        // Interface d'authentification
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire d'authentification */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Authentification</span>
                </CardTitle>
                <CardDescription>
                  Connectez-vous pour accéder à toutes les fonctionnalités
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Boutons de mode */}
                <div className="flex space-x-2 mb-4">
                  <Button
                    onClick={() => setAuthMode('login')}
                    variant={authMode === 'login' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Connexion
                  </Button>
                  <Button
                    onClick={() => setAuthMode('register')}
                    variant={authMode === 'register' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Inscription
                  </Button>
                  <Button
                    onClick={() => setAuthMode('guest')}
                    variant={authMode === 'guest' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Invité
                  </Button>
                </div>

                {authMode !== 'guest' && (
                  <>
                    {authMode === 'register' && (
                      <div>
                        <Label htmlFor="name">Nom complet</Label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Votre nom complet"
                          className="mt-1"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleEmailAuth}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Connexion...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4" />
                          <span>{authMode === 'register' ? 'Créer un compte' : 'Se connecter'}</span>
                        </div>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Connexion Google */}
                <Button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <span>Continuer avec Google</span>
                  </div>
                </Button>

                {/* Mode invité */}
                {authMode === 'guest' && (
                  <Button
                    onClick={handleGuestMode}
                    variant="outline"
                    className="w-full"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Continuer en tant qu'invité</span>
                    </div>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Sécurité et confidentialité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Lock className="h-4 w-4" />
                  <span>Sécurité et confidentialité</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Chiffrement des données sensibles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Authentification JWT sécurisée</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Filtrage anti-abus IA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Sauvegarde automatique sécurisée</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Conformité RGPD</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plans d'abonnement */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plans d'abonnement</CardTitle>
                <CardDescription>
                  Choisissez le plan qui correspond à vos besoins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <Card key={plan.plan} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {plan.icon}
                            <div>
                              <h3 className="font-medium">{plan.name}</h3>
                              <p className="text-sm text-gray-600">{plan.price}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${plan.color}`}>
                            {plan.plan === 'free' ? 'Gratuit' : 'Premium'}
                          </span>
                        </div>
                        
                        <ul className="space-y-1 text-xs text-gray-600 mb-3">
                          {plan.features.slice(0, 4).map((feature, index) => (
                            <li key={index} className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 4 && (
                            <li className="text-gray-500">+{plan.features.length - 4} autres fonctionnalités</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Interface utilisateur connecté
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations utilisateur */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profil utilisateur</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{currentUser.name}</h3>
                    <p className="text-sm text-gray-600">{currentUser.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {currentUser.isAuthenticated ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">Authentifié</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600">Mode invité</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500">
                        via {currentUser.authMethod === 'google' ? 'Google' : currentUser.authMethod === 'email' ? 'Email' : 'Invité'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    <Unlock className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quotas et limites */}
            <Card>
              <CardHeader>
                <CardTitle>Quotas d'utilisation</CardTitle>
                <CardDescription>
                  Votre utilisation ce mois-ci (plan {subscription?.plan})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription && (
                  <>
                    {/* Ebooks */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Ebooks créés</span>
                        <span>{subscription.limits.usedEbooks} / {subscription.limits.monthlyEbooks}</span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(subscription.limits.usedEbooks, subscription.limits.monthlyEbooks)} 
                        className={isLimitReached(subscription.limits.usedEbooks, subscription.limits.monthlyEbooks) ? 'bg-red-100' : ''}
                      />
                    </div>

                    {/* Générations IA */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Générations IA</span>
                        <span>{subscription.limits.usedGenerations} / {subscription.limits.aiGenerations}</span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(subscription.limits.usedGenerations, subscription.limits.aiGenerations)} 
                        className={isLimitReached(subscription.limits.usedGenerations, subscription.limits.aiGenerations) ? 'bg-red-100' : ''}
                      />
                    </div>

                    {/* Illustrations */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Illustrations générées</span>
                        <span>{subscription.limits.usedIllustrations} / {subscription.limits.illustrations}</span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(subscription.limits.usedIllustrations, subscription.limits.illustrations)} 
                        className={isLimitReached(subscription.limits.usedIllustrations, subscription.limits.illustrations) ? 'bg-red-100' : ''}
                      />
                    </div>

                    {/* Stockage */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stockage utilisé</span>
                        <span>{subscription.limits.usedStorageGB} GB / {subscription.limits.storageGB} GB</span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(subscription.limits.usedStorageGB, subscription.limits.storageGB)} 
                        className={isLimitReached(subscription.limits.usedStorageGB, subscription.limits.storageGB) ? 'bg-red-100' : ''}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Abonnement actuel et upgrade */}
          <div className="space-y-6">
            {subscription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {subscriptionPlans.find(p => p.plan === subscription.plan)?.icon}
                    <span>Plan {subscriptionPlans.find(p => p.plan === subscription.plan)?.name}</span>
                  </CardTitle>
                  {subscription.expiresAt && (
                    <CardDescription>
                      Expire le {subscription.expiresAt.toLocaleDateString('fr-FR')}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1 text-sm">
                    {subscription.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {subscription.plan !== 'pro' && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => upgradePlan(subscription.plan === 'free' ? 'premium' : 'pro')}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        size="sm"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Passer au plan supérieur
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sécurité */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sécurité du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Authentification :</span>
                  <span className="font-medium">{currentUser.isAuthenticated ? 'Activée' : 'Mode invité'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode :</span>
                  <span className="font-medium capitalize">{currentUser.authMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chiffrement :</span>
                  <span className="font-medium">AES-256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière connexion :</span>
                  <span className="font-medium">{currentUser.createdAt.toLocaleDateString('fr-FR')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Messages de statut */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
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

      {/* Bouton de finalisation */}
      {currentUser && subscription && (
        <div className="flex justify-center pt-8">
          <Button 
            onClick={handleComplete}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Finaliser la configuration
          </Button>
        </div>
      )}
    </div>
  )
}