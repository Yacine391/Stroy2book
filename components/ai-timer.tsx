"use client"

import { useState, useEffect } from "react"
import { Clock, Loader2 } from "lucide-react"

interface AITimerProps {
  isGenerating: boolean
  estimatedSeconds: number // Temps estimé en secondes
  onComplete?: () => void
}

export default function AITimer({ isGenerating, estimatedSeconds, onComplete }: AITimerProps) {
  const [timeLeft, setTimeLeft] = useState(estimatedSeconds)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isGenerating) {
      setTimeLeft(estimatedSeconds)
      setProgress(0)

      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            onComplete?.()
            return 0
          }
          return prev - 1
        })

        setProgress(prev => {
          const newProgress = ((estimatedSeconds - timeLeft + 1) / estimatedSeconds) * 100
          return Math.min(newProgress, 99) // Ne jamais atteindre 100% avant la fin réelle
        })
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setTimeLeft(0)
      setProgress(0)
    }
  }, [isGenerating, estimatedSeconds])

  if (!isGenerating) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Génération en cours...
          </span>
        </div>
        <div className="flex items-center space-x-2 text-blue-700">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-mono">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-blue-600 mt-2">
        {timeLeft > 0 ? `Environ ${timeLeft} seconde${timeLeft > 1 ? 's' : ''} restante${timeLeft > 1 ? 's' : ''}` : 'Finalisation...'}
      </p>
    </div>
  )
}
