// ARXIU: src/components/ResourceCard.jsx

'use client'
import { ArrowRight, Heart } from 'lucide-react'

export default function ResourceCard({ 
  recurs, 
  onClick, 
  getIcon, 
  isFavorite, 
  onToggleFavorite 
}) {
  
  // --- FUNCIÓ DE COLORS PER TIPUS ---
  const getTypeTheme = (tipus) => {
    const t = tipus?.toLowerCase() || ''
    if (t.includes('vídeo')) 
      return { border: 'border-l-red-400', badge: 'bg-red-50 text-red-700 border-red-100' }
    if (t.includes('pel·lícula') || t.includes('film')) 
      return { border: 'border-l-purple-400', badge: 'bg-purple-50 text-purple-700 border-purple-100' }
    if (t.includes('article')) 
      return { border: 'border-l-blue-400', badge: 'bg-blue-50 text-blue-700 border-blue-100' }
    if (t.includes('audio') || t.includes('podcast')) 
      return { border: 'border-l-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-100' }
    if (t.includes('llibre')) 
      return { border: 'border-l-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
    
    // Per defecte
    return { border: 'border-l-gray-300', badge: 'bg-gray-100 text-gray-600 border-gray-200' }
  }

  const theme = getTypeTheme(recurs.tipus)

  const handleCardClick = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
    onClick();
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); 
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([5, 30, 5]); 
    }
    onToggleFavorite(recurs._id);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }

  return (
    <div 
      role="button" 
      tabIndex={0} 
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Veure detalls de ${recurs.titol}`}
      // AFEGIT: border-l-4 i la classe dinàmica del tema
      className={`group relative bg-card p-5 rounded-2xl border-y border-r border-l-4 shadow-sm active:scale-[0.985] hover:border-muted transition-all cursor-pointer flex flex-col justify-between h-full focus-visible:ring-2 focus-visible:ring-accent overflow-hidden ${theme.border} border-border`}
    >
      
      {/* BOTÓ DE FAVORIT */}
      <button 
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 p-2.5 rounded-full z-20 hover:bg-muted/10 active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-red-200"
        title={isFavorite ? "Treure de favorits" : "Guardar a favorits"}
      >
        <Heart 
          size={20} 
          className={`transition-all duration-300 ${
            isFavorite 
              ? 'fill-red-500 text-red-500 scale-110' 
              : 'text-muted/60 hover:text-red-400'
          }`} 
        />
      </button>

      {/* PART SUPERIOR */}
      <div className="pr-8 flex-1"> 
        
        {/* ENCAPÇALAMENT: Tipus (Amb color) i Edat */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
           
           {/* PÍNDOLA DE TIPUS COLOREJADA */}
           <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${theme.badge}`}>
             {getIcon(recurs.tipus)}
             {recurs.tipus}
           </span>

           {/* EDAT RECOMANADA */}
           {recurs.edat && (
             <>
               <span className="text-muted/30">•</span>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                 {recurs.edat}
               </span>
             </>
           )}
        </div>
        
        <h4 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors line-clamp-3 mb-2 text-foreground">
          {recurs.titol}
        </h4>
        
        {recurs.autor && (
          <p className="text-sm text-muted italic line-clamp-1">{recurs.autor}</p>
        )}
      </div>

      {/* PART INFERIOR (Categoria + Fletxa) */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/30 w-full mt-auto">
        <span className="text-[10px] font-bold uppercase text-muted/60 line-clamp-1 max-w-[70%]">
          {recurs.espectacle || recurs.categoria}
        </span>
        <div className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-transform duration-300">
          <ArrowRight size={20} />
        </div>
      </div>
    </div>
  )
}