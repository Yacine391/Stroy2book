# 🛠️ Story2Book AI - Plan d'Implémentation Technique Freemium

## 🎯 Architecture Système de Plans

### 📋 Base de données - Schéma des Plans Utilisateurs

```sql
-- Table des plans disponibles
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- 'free', 'premium', 'business', 'enterprise'
  display_name VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  max_ebooks_per_month INTEGER, -- NULL = illimité
  max_pages_per_ebook INTEGER,
  has_watermark BOOLEAN DEFAULT true,
  ai_model VARCHAR(50) DEFAULT 'gemini', -- 'gemini', 'gpt-4o', 'ultra'
  can_upload_cover BOOLEAN DEFAULT false,
  can_edit_content BOOLEAN DEFAULT false,
  export_formats TEXT[] DEFAULT ARRAY['pdf'],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  stripe_customer_id VARCHAR(100),
  paypal_customer_id VARCHAR(100)
);

-- Table des abonnements utilisateurs
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'unpaid'
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  stripe_subscription_id VARCHAR(100),
  paypal_subscription_id VARCHAR(100),
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table de tracking d'usage
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'ebook_generated', 'watermark_removed', etc.
  month_year VARCHAR(7) NOT NULL, -- '2024-10' format
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, action_type, month_year)
);

-- Table des ebooks générés
CREATE TABLE generated_ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100),
  content TEXT NOT NULL,
  cover_description TEXT,
  genre VARCHAR(50),
  length_type VARCHAR(20),
  page_count INTEGER,
  has_watermark BOOLEAN DEFAULT true,
  ai_model_used VARCHAR(50),
  generation_cost DECIMAL(8,4), -- Coût en tokens/API
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🔧 Services Backend - Gestion des Plans

```typescript
// types/subscription.ts
export interface UserPlan {
  id: string;
  userId: string;
  planName: 'free' | 'premium' | 'business' | 'enterprise';
  displayName: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  maxEbooksPerMonth: number | null; // null = illimité
  maxPagesPerEbook: number;
  hasWatermark: boolean;
  aiModel: 'gemini' | 'gpt-4o' | 'ultra';
  canUploadCover: boolean;
  canEditContent: boolean;
  exportFormats: string[];
}

export interface UsageLimits {
  ebooksUsedThisMonth: number;
  ebooksRemaining: number | null; // null = illimité
  canGenerateEbook: boolean;
  canRemoveWatermark: boolean;
  canUploadCover: boolean;
  nextResetDate: Date;
}

// services/subscription.service.ts
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

export class SubscriptionService {
  private prisma = new PrismaClient();
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });

  async getUserPlan(userId: string): Promise<UserPlan> {
    const subscription = await this.prisma.userSubscriptions.findFirst({
      where: { 
        userId,
        status: 'active',
        currentPeriodEnd: { gte: new Date() }
      },
      include: { plan: true }
    });

    if (!subscription) {
      // Retourner plan gratuit par défaut
      return this.getFreePlan(userId);
    }

    return {
      id: subscription.id,
      userId: subscription.userId,
      planName: subscription.plan.name as any,
      displayName: subscription.plan.displayName,
      status: subscription.status as any,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      maxEbooksPerMonth: subscription.plan.maxEbooksPerMonth,
      maxPagesPerEbook: subscription.plan.maxPagesPerEbook,
      hasWatermark: subscription.plan.hasWatermark,
      aiModel: subscription.plan.aiModel as any,
      canUploadCover: subscription.plan.canUploadCover,
      canEditContent: subscription.plan.canEditContent,
      exportFormats: subscription.plan.exportFormats
    };
  }

  async getUserUsage(userId: string): Promise<UsageLimits> {
    const currentMonth = new Date().toISOString().slice(0, 7); // '2024-10'
    const userPlan = await this.getUserPlan(userId);
    
    const usage = await this.prisma.usageTracking.findFirst({
      where: {
        userId,
        actionType: 'ebook_generated',
        monthYear: currentMonth
      }
    });

    const ebooksUsedThisMonth = usage?.count || 0;
    const ebooksRemaining = userPlan.maxEbooksPerMonth 
      ? userPlan.maxEbooksPerMonth - ebooksUsedThisMonth 
      : null;

    // Calculer la date de reset (premier jour du mois suivant)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
    nextMonth.setHours(0, 0, 0, 0);

    return {
      ebooksUsedThisMonth,
      ebooksRemaining,
      canGenerateEbook: ebooksRemaining === null || ebooksRemaining > 0,
      canRemoveWatermark: !userPlan.hasWatermark,
      canUploadCover: userPlan.canUploadCover,
      nextResetDate: nextMonth
    };
  }

  async checkLimitsBeforeGeneration(userId: string): Promise<void> {
    const usage = await this.getUserUsage(userId);
    
    if (!usage.canGenerateEbook) {
      throw new Error('Limite mensuelle d\'ebooks atteinte. Passez à Premium pour un accès illimité.');
    }
  }

  async recordEbookGeneration(userId: string): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    await this.prisma.usageTracking.upsert({
      where: {
        userId_actionType_monthYear: {
          userId,
          actionType: 'ebook_generated',
          monthYear: currentMonth
        }
      },
      update: {
        count: { increment: 1 }
      },
      create: {
        userId,
        actionType: 'ebook_generated',
        monthYear: currentMonth,
        count: 1
      }
    });
  }

  // Gestion des abonnements Stripe
  async createStripeSubscription(
    userId: string, 
    planName: string, 
    paymentMethodId: string
  ): Promise<{ subscriptionId: string; clientSecret: string }> {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');

    // Créer ou récupérer le customer Stripe
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId }
      });
      stripeCustomerId = customer.id;
      
      await this.prisma.users.update({
        where: { id: userId },
        data: { stripeCustomerId }
      });
    }

    // Attacher le mode de paiement
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Définir comme mode de paiement par défaut
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Créer l'abonnement
    const subscription = await this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: this.getStripePriceId(planName) }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Enregistrer l'abonnement en base
    const plan = await this.prisma.subscriptionPlans.findFirst({
      where: { name: planName }
    });
    
    if (plan) {
      await this.prisma.userSubscriptions.create({
        data: {
          userId,
          planId: plan.id,
          stripeSubscriptionId: subscription.id,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          status: subscription.status as any
        }
      });
    }

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent;

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret
    };
  }

  private getStripePriceId(planName: string): string {
    const priceIds = {
      premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
      business: process.env.STRIPE_BUSINESS_PRICE_ID!,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!
    };
    return priceIds[planName as keyof typeof priceIds];
  }

  private getFreePlan(userId: string): UserPlan {
    return {
      id: 'free-plan',
      userId,
      planName: 'free',
      displayName: 'Gratuit',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date('2099-12-31'), // Pas d'expiration pour gratuit
      maxEbooksPerMonth: 3,
      maxPagesPerEbook: 15,
      hasWatermark: true,
      aiModel: 'gemini',
      canUploadCover: false,
      canEditContent: false,
      exportFormats: ['pdf']
    };
  }
}
```

### 🎨 Frontend - Composants React de Gestion des Plans

```typescript
// components/subscription/plan-selector.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Building, Zap } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  yearlyPrice?: number;
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  icon: any;
}

export function PlanSelector({ currentPlan, onSelectPlan }: {
  currentPlan: string;
  onSelectPlan: (planId: string, isYearly: boolean) => void;
}) {
  const [isYearly, setIsYearly] = useState(false);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Gratuit',
      displayName: 'Découverte',
      price: 0,
      description: 'Parfait pour commencer',
      icon: Zap,
      features: [
        '3 ebooks par mois',
        'Jusqu\'à 15 pages par ebook',
        '6 genres populaires',
        'Export PDF',
        'IA Gemini'
      ],
      limitations: [
        'Filigrane obligatoire',
        'Pas d\'upload d\'image',
        'Support FAQ uniquement'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      displayName: 'Créateur',
      price: 19,
      yearlyPrice: 171,
      description: 'Pour les auteurs sérieux',
      icon: Crown,
      popular: true,
      features: [
        'Ebooks illimités',
        'Jusqu\'à 100 pages par ebook',
        'Tous les genres',
        'IA GPT-4o premium',
        'Suppression du filigrane',
        'Upload d\'images personnalisées',
        'Édition du contenu',
        'Formats PDF, EPUB, DOCX',
        'Support prioritaire'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      displayName: 'Professionnel',
      price: 49,
      yearlyPrice: 441,
      description: 'Pour les entreprises',
      icon: Building,
      features: [
        'Tout de Premium',
        'Usage commercial étendu',
        'Logo personnalisé',
        'Templates d\'entreprise',
        '5 utilisateurs par compte',
        'Formats professionnels',
        'Support dédié',
        'Formation personnalisée'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Toggle Mensuel/Annuel */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-md transition-colors ${
              !isYearly ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-md transition-colors ${
              isYearly ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
          >
            Annuel
            <Badge className="ml-2 bg-green-100 text-green-800">-25%</Badge>
          </button>
        </div>
      </div>

      {/* Grille des plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const price = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price;
          const monthlyPrice = isYearly && plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.price;

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-purple-500 border-2' : ''} ${
                isCurrentPlan ? 'bg-purple-50' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                  Le plus populaire
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <plan.icon className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <div className="text-4xl font-bold">Gratuit</div>
                  ) : (
                    <div>
                      <div className="text-4xl font-bold">
                        {monthlyPrice}€
                        <span className="text-lg font-normal text-gray-600">/mois</span>
                      </div>
                      {isYearly && plan.yearlyPrice && (
                        <div className="text-sm text-green-600 font-medium">
                          Facturé {price}€/an (économie de {(plan.price * 12 - plan.yearlyPrice)}€)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Fonctionnalités */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations (pour plan gratuit) */}
                {plan.limitations && (
                  <div className="space-y-2 pt-2 border-t">
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center space-x-2 opacity-75">
                        <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bouton d'action */}
                <Button 
                  className="w-full mt-6"
                  variant={isCurrentPlan ? "outline" : (plan.popular ? "default" : "outline")}
                  onClick={() => !isCurrentPlan && onSelectPlan(plan.id, isYearly)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Plan actuel' : 
                   plan.price === 0 ? 'Commencer gratuitement' : 
                   `Choisir ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

### 🔐 Middleware de Protection des Routes

```typescript
// middleware/auth-plan.ts
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription.service';

export async function planMiddleware(request: NextRequest) {
  const userId = request.headers.get('user-id'); // Depuis votre système d'auth
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const subscriptionService = new SubscriptionService();
  
  // Pour les routes de génération d'ebook
  if (request.nextUrl.pathname.startsWith('/api/generate-ebook')) {
    try {
      await subscriptionService.checkLimitsBeforeGeneration(userId);
    } catch (error) {
      return NextResponse.json({ 
        error: error.message,
        code: 'LIMIT_REACHED',
        upgradeUrl: '/upgrade'
      }, { status: 403 });
    }
  }

  // Pour les routes premium uniquement
  if (request.nextUrl.pathname.startsWith('/api/premium/')) {
    const userPlan = await subscriptionService.getUserPlan(userId);
    if (userPlan.planName === 'free') {
      return NextResponse.json({ 
        error: 'Fonctionnalité Premium requise',
        code: 'PREMIUM_REQUIRED',
        upgradeUrl: '/upgrade'
      }, { status: 403 });
    }
  }

  return NextResponse.next();
}
```

### 💳 Intégration Paiement Stripe

```typescript
// pages/api/create-subscription.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { SubscriptionService } from '@/services/subscription.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, planName, paymentMethodId } = req.body;

  try {
    const subscriptionService = new SubscriptionService();
    const result = await subscriptionService.createStripeSubscription(
      userId,
      planName,
      paymentMethodId
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur création abonnement:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'abonnement',
      error: error.message 
    });
  }
}

// Webhook Stripe pour synchroniser les statuts
// pages/api/webhooks/stripe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Erreur webhook signature:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traiter les événements Stripe
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSuccess(invoice);
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(failedInvoice);
      break;
  }

  res.json({ received: true });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Mettre à jour le statut en base de données
  const subscriptionService = new SubscriptionService();
  await subscriptionService.updateSubscriptionStatus(
    subscription.id,
    subscription.status,
    new Date(subscription.current_period_end * 1000)
  );
}

export const config = {
  api: {
    bodyParser: false,
  },
};
```

### 📊 Dashboard Analytics pour Admin

```typescript
// components/admin/analytics-dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, BookOpen, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  premiumUsers: number;
  monthlyRevenue: number;
  ebooksGenerated: number;
  conversionRate: number;
  churnRate: number;
  avgRevenuePer: number;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    }
  };

  if (!analytics) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de Bord Analytics</h1>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.premiumUsers} Premium ({((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Mensuel</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.monthlyRevenue.toLocaleString()}€</div>
            <p className="text-xs text-muted-foreground">
              {analytics.avgRevenuePer.toFixed(2)}€ par utilisateur premium
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ebooks Générés</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.ebooksGenerated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant={analytics.churnRate < 5 ? "default" : "destructive"}>
                Churn: {analytics.churnRate.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et détails supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Abonnements</CardTitle>
            <CardDescription>Nouveaux abonnements vs. résiliations</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Ici vous pourriez intégrer Chart.js ou Recharts */}
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              Graphique évolution abonnements
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Plans</CardTitle>
            <CardDescription>Distribution des utilisateurs par plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Gratuit</span>
                <Badge variant="outline">{analytics.totalUsers - analytics.premiumUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Premium</span>
                <Badge>{analytics.premiumUsers}</Badge>
              </div>
              {/* Ajouter Business et Enterprise quand disponibles */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### 🚀 Configuration Variables d'Environnement

```bash
# .env.local
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/story2book"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PREMIUM_PRICE_ID="price_premium_monthly"
STRIPE_BUSINESS_PRICE_ID="price_business_monthly"

# PayPal (optionnel)
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"

# OpenAI (pour Premium)
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o"

# Google AI (pour Gratuit)
GOOGLE_API_KEY="your_gemini_key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXTAUTH_SECRET="your_secret_key"
```

---

## 📋 Checklist d'Implémentation

### ✅ Phase 1 - Base (Semaine 1-2)
- [ ] Créer les tables de base de données
- [ ] Implémenter le service de gestion des plans
- [ ] Créer le middleware de vérification des limites
- [ ] Ajouter l'interface de sélection des plans

### ✅ Phase 2 - Paiements (Semaine 3-4)
- [ ] Intégrer Stripe pour les abonnements
- [ ] Configurer les webhooks Stripe
- [ ] Créer l'interface de paiement
- [ ] Gérer les erreurs de paiement

### ✅ Phase 3 - Fonctionnalités (Semaine 5-6)
- [ ] Implémenter le système de filigrane conditionnel
- [ ] Adapter l'IA selon le plan (Gemini vs GPT-4o)
- [ ] Créer le dashboard utilisateur
- [ ] Ajouter le système de tracking d'usage

### ✅ Phase 4 - Analytics & Admin (Semaine 7-8)
- [ ] Dashboard administrateur
- [ ] Système d'analytics complet
- [ ] Rapports automatiques
- [ ] Monitoring des performances

Cette architecture vous permettra de lancer votre modèle freemium de façon robuste et évolutive, avec toutes les fonctionnalités nécessaires pour une croissance rapide ! 🚀