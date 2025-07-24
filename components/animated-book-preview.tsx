"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnimatedBookPreviewProps {
  formData: {
    title: string
    author: string
    content: string
    backgroundColor: string
    fontFamily: string
    hasWatermark: boolean
    coverImage: File | null
    coverDescription?: string
  }
}

export default function AnimatedBookPreview({ formData }: AnimatedBookPreviewProps) {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isBookOpen, setIsBookOpen] = useState(false)
  const [isPageTurning, setIsPageTurning] = useState(false)
  const [pageDirection, setPageDirection] = useState<'left' | 'right'>('right')

  useEffect(() => {
    if (formData.coverImage) {
      const url = URL.createObjectURL(formData.coverImage)
      setCoverImageUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [formData.coverImage])

  // Fonction de nettoyage du contenu
  const cleanContent = (content: string): string => {
    return content
      .replace(/<!--\s*Signature d'unicité:.*?-->/gi, '')
      .replace(/\(\d+\s*mots?\)/gi, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/gm, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
  }

  // Diviser le contenu en pages (environ 350 mots par page pour style livre)
  const divideIntoPages = (content: string): string[] => {
    const cleanedContent = cleanContent(content)
    const words = cleanedContent.split(/\s+/)
    const pages: string[] = []
    const wordsPerPage = 350 // Style livre classique

    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageWords = words.slice(i, i + wordsPerPage)
      pages.push(pageWords.join(' '))
    }

    return pages.length > 0 ? pages : ['Contenu en cours de génération...']
  }

  const pages = divideIntoPages(formData.content)
  const totalPages = pages.length

  const handleBookOpen = () => {
    setIsBookOpen(true)
  }

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (isPageTurning) return

    setIsPageTurning(true)
    setPageDirection(direction === 'next' ? 'right' : 'left')

    setTimeout(() => {
      if (direction === 'next' && currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1)
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1)
      }
      setIsPageTurning(false)
    }, 300)
  }

  const handleBookClose = () => {
    setIsBookOpen(false)
    setCurrentPage(0)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!isBookOpen ? (
        // Livre fermé - Animation d'ouverture
        <div className="relative">
          <div 
            className="book-closed cursor-pointer group"
            onClick={handleBookOpen}
            style={{
              background: formData.backgroundColor || '#ffffff',
              fontFamily: formData.fontFamily || 'Arial',
            }}
          >
            <div className="book-spine"></div>
            <div className="book-cover">
              <div className="cover-content">
                {coverImageUrl ? (
                  <img 
                    src={coverImageUrl} 
                    alt="Couverture" 
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <h1 className="text-xl font-bold text-center text-gray-800 mb-2">
                  {formData.title}
                </h1>
                <p className="text-sm text-center text-gray-600 mb-4">
                  par {formData.author}
                </p>
                <div className="text-center">
                  <Button variant="outline" className="group-hover:bg-blue-50">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Cliquer pour ouvrir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Livre ouvert - Pages avec animation
        <div className="book-open-container">
          <Card className="book-open shadow-2xl">
            <div className="book-pages-container">
              {/* Page de gauche */}
              <div className="book-page book-page-left">
                <CardContent className="h-full p-6 flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    {currentPage > 0 ? (
                      <div className="h-full">
                        <div className="text-sm text-gray-600 mb-4">
                          Page {currentPage}
                        </div>
                        <div 
                          className="text-sm leading-relaxed text-gray-800 h-full overflow-hidden"
                          style={{ fontFamily: formData.fontFamily || 'Arial' }}
                        >
                          {pages[currentPage - 1]?.substring(0, 1200)}...
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        Page de garde
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Reliure centrale */}
              <div className="book-spine-center"></div>

              {/* Page de droite avec animation */}
              <div 
                className={`book-page book-page-right ${isPageTurning ? `page-turn-${pageDirection}` : ''}`}
              >
                <CardContent className="h-full p-6 flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    {currentPage < totalPages ? (
                      <div className="h-full">
                        <div className="text-sm text-gray-600 mb-4">
                          Page {currentPage + 1}
                        </div>
                        <div 
                          className="text-sm leading-relaxed text-gray-800 h-full overflow-hidden"
                          style={{ fontFamily: formData.fontFamily || 'Arial' }}
                        >
                          {pages[currentPage]?.substring(0, 1200)}...
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        Fin du livre
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </div>

            {/* Contrôles de navigation */}
            <div className="book-controls">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageTurn('prev')}
                disabled={currentPage === 0 || isPageTurning}
                className="mr-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-gray-600 mx-4">
                {currentPage + 1} / {totalPages}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageTurn('next')}
                disabled={currentPage >= totalPages - 1 || isPageTurning}
                className="ml-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBookClose}
                className="ml-4"
              >
                Fermer le livre
              </Button>
            </div>
          </Card>
        </div>
      )}

      <style jsx>{`
        .book-closed {
          width: 300px;
          height: 400px;
          margin: 0 auto;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s ease;
          cursor: pointer;
        }

        .book-closed:hover {
          transform: rotateY(-10deg) rotateX(5deg);
        }

        .book-spine {
          position: absolute;
          left: 0;
          top: 0;
          width: 20px;
          height: 100%;
          background: linear-gradient(to right, #8b5a3c, #a0522d);
          transform: rotateY(-90deg);
          transform-origin: left;
        }

        .book-cover {
          width: 100%;
          height: 100%;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
          padding: 20px;
        }

        .cover-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .book-open-container {
          perspective: 1000px;
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .book-open {
          width: 800px;
          height: 600px;
          background: white;
          border-radius: 12px;
          position: relative;
          transform-style: preserve-3d;
          animation: bookOpen 0.8s ease-out;
        }

        @keyframes bookOpen {
          0% {
            transform: rotateY(-30deg) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
        }

        .book-pages-container {
          display: flex;
          height: 100%;
          position: relative;
        }

        .book-page {
          flex: 1;
          height: 100%;
          background: white;
          position: relative;
          transition: transform 0.3s ease;
        }

        .book-page-left {
          border-right: none;
          border-radius: 12px 0 0 12px;
        }

        .book-page-right {
          border-left: none;
          border-radius: 0 12px 12px 0;
          transform-origin: left center;
        }

        .page-turn-right {
          animation: pageTurnRight 0.6s ease-in-out;
        }

        .page-turn-left {
          animation: pageTurnLeft 0.6s ease-in-out;
        }

        @keyframes pageTurnRight {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(-90deg); }
          100% { transform: rotateY(0deg); }
        }

        @keyframes pageTurnLeft {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(90deg); }
          100% { transform: rotateY(0deg); }
        }

        .book-spine-center {
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, #ddd, #999, #ddd);
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          z-index: 10;
        }

        .book-controls {
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          background: white;
          padding: 8px 16px;
          border-radius: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  )
}