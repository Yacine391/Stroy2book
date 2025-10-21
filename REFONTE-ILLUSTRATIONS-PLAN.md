# 🎨 REFONTE ILLUSTRATIONS - PLAN D'ACTION

## 🎯 Objectifs

### Ce qui est demandé :
1. **Déplacer** l'étape "Illustrations" vers la **FIN** (après couverture)
2. **Permettre** à l'utilisateur de choisir le **NOMBRE** d'illustrations
3. **Générer** basé sur **TOUT le contenu** de l'ebook (pas juste chapitres initiaux)
4. **Interface** pour **placer** les illustrations où on veut dans le livre

## 📋 Plan d'implémentation

### Étape 1 : Modifier l'ordre du workflow ✅

**Ancien ordre** :
```
1. Saisie texte
2. Actions IA
3. Illustrations ❌ (ICI)
4. Couverture
5. Layout
6. Export
```

**Nouveau ordre** :
```
1. Saisie texte
2. Actions IA
3. Couverture
4. Layout
5. Illustrations ✅ (ICI - APRÈS COUVERTURE)
6. Export
```

**Fichiers à modifier** :
- `components/hb-creator-workflow.tsx` : Changer l'ordre des étapes
- Déplacer 'illustrations' après 'layout'

---

### Étape 2 : Nouvelle interface - Choix du nombre ✅

**Nouvelle UI dans `illustration-generation.tsx`** :

```tsx
// Au début du composant
const [numberOfIllustrations, setNumberOfIllustrations] = useState(5)
const maxIllustrations = currentUser?.subscription?.max_illustrations || 5

// UI
<Card>
  <CardHeader>
    <CardTitle>Configuration des illustrations</CardTitle>
  </CardHeader>
  <CardContent>
    <Label>Nombre d'illustrations souhaité</Label>
    <Input 
      type="number" 
      min={0} 
      max={maxIllustrations}
      value={numberOfIllustrations}
      onChange={(e) => setNumberOfIllustrations(parseInt(e.target.value))}
    />
    <p className="text-xs text-gray-500">
      Limite : {maxIllustrations} illustrations (abonnement {plan})
    </p>
  </CardContent>
</Card>
```

---

### Étape 3 : Génération basée sur contenu final ✅

**Problème actuel** :
- Les illustrations sont générées basées sur `textData.chapters` (chapitres initiaux)
- On veut utiliser le **contenu final traité** (après actions IA)

**Solution** :
```tsx
interface IllustrationGenerationProps {
  textData: TextData  // Contenu initial
  processedText: { processedText: string } // ✅ Contenu final traité
  coverData: CoverData  // ✅ Données couverture
  onNext: (data: any) => void
  onBack: () => void
}

// Générer illustrations basées sur processedText
const generateIllustrationsFromContent = (content: string, count: number) => {
  // Découper le contenu en sections
  const words = content.split(/\s+/)
  const wordsPerSection = Math.floor(words.length / count)
  
  const sections = []
  for (let i = 0; i < count; i++) {
    const start = i * wordsPerSection
    const end = (i + 1) * wordsPerSection
    const sectionText = words.slice(start, end).join(' ')
    
    // Créer un prompt basé sur cette section
    const prompt = `illustration for: ${sectionText.substring(0, 200)}`
    sections.push({
      id: `section-${i}`,
      index: i,
      text: sectionText.substring(0, 200),
      prompt,
      placement: null, // À définir par l'utilisateur
      imageUrl: ''
    })
  }
  
  return sections
}
```

---

### Étape 4 : Interface de placement ✅

**Nouvelle UI pour placer les illustrations** :

```tsx
<Card>
  <CardHeader>
    <CardTitle>Placement des illustrations</CardTitle>
    <CardDescription>
      Choisissez où placer chaque illustration dans votre ebook
    </CardDescription>
  </CardHeader>
  <CardContent>
    {illustrations.map((ill, idx) => (
      <div key={ill.id} className="border p-4 rounded-lg mb-4">
        <div className="flex items-center space-x-4">
          {/* Aperçu miniature */}
          <div className="w-24 h-24 bg-gray-100 rounded">
            {ill.imageUrl && (
              <img src={ill.imageUrl} alt={`Illustration ${idx + 1}`} />
            )}
          </div>
          
          {/* Sélecteur de placement */}
          <div className="flex-1">
            <Label>Illustration {idx + 1}</Label>
            <Select 
              value={ill.placement || ''} 
              onValueChange={(val) => updatePlacement(ill.id, val)}
            >
              <SelectContent>
                <SelectItem value="start">Début du livre</SelectItem>
                <SelectItem value="chapter-1">Après chapitre 1</SelectItem>
                <SelectItem value="chapter-2">Après chapitre 2</SelectItem>
                <SelectItem value="middle">Milieu du livre</SelectItem>
                <SelectItem value="end">Fin du livre</SelectItem>
                <SelectItem value="custom">Position personnalisée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2">
            <Button onClick={() => regenerate(ill.id)} size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => remove(ill.id)} size="sm" variant="outline">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    ))}
  </CardContent>
</Card>
```

---

## 🔄 Modification du workflow

### Dans `hb-creator-workflow.tsx` :

```tsx
// Nouvel ordre des étapes
type WorkflowStep = 
  | 'welcome'
  | 'text-input'
  | 'ai-generation'
  | 'cover'        // ✅ AVANT illustrations
  | 'layout'       // ✅ AVANT illustrations
  | 'illustrations' // ✅ APRÈS layout
  | 'export'
  | 'completed'

// Passer les données nécessaires
{currentStep === 'illustrations' && (
  <IllustrationGeneration
    textData={workflowData.textData}
    processedText={workflowData.processedText}  // ✅ Contenu traité
    coverData={workflowData.coverData}         // ✅ Données couverture
    currentUser={currentUser}                  // ✅ Pour limites
    onNext={handleIllustrationsComplete}
    onBack={goToPreviousStep}
  />
)}
```

---

## 📊 Nouvelles interfaces TypeScript

```typescript
interface IllustrationData {
  id: string
  index: number
  sectionText: string  // Texte de la section
  prompt: string       // Prompt IA
  imageUrl: string     // URL image générée
  placement: PlacementType | null  // Où placer
  isGenerating: boolean
}

type PlacementType = 
  | 'start'
  | 'end'
  | 'middle'
  | 'chapter-1'
  | 'chapter-2'
  | 'chapter-3'
  | 'custom'
  | { page: number }  // Page spécifique
```

---

## 🎨 Flow complet

```
1. User finit texte + actions IA + couverture + layout
2. Arrive sur "Illustrations"
3. Choisit nombre d'illustrations (0-20 selon abonnement)
4. Clique "Générer les illustrations"
5. L'IA génère X illustrations basées sur le contenu final
6. User voit liste des illustrations avec aperçu
7. User choisit placement pour chaque illustration
8. User peut régénérer/supprimer
9. Clique "Suivant" → Export
```

---

## ✅ Checklist d'implémentation

- [ ] Modifier ordre workflow dans `hb-creator-workflow.tsx`
- [ ] Mettre à jour `WorkflowStep` type
- [ ] Passer `processedText` et `coverData` à IllustrationGeneration
- [ ] Ajouter champ "Nombre d'illustrations" avec limite abonnement
- [ ] Créer fonction `generateIllustrationsFromContent`
- [ ] Interface de placement avec sélecteurs
- [ ] Boutons régénérer/supprimer par illustration
- [ ] Timer pour génération multiple
- [ ] Sauvegarder placements dans workflowData
- [ ] Tester avec 0, 5, 10, 20 illustrations

---

**Temps estimé : 30-45 minutes**

Prêt à commencer ! 🚀
