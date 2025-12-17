'use client'
import { ArrowRight, Heart } from 'lucide-react'

export default function ResourceCard({ 
  recurs, 
  onClick, 
  getIcon, 
  isFavorite, 
  onToggleFavorite 
}) {
  
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
      // AFEGIT: h-full per omplir alçada i flex-col per estirar el contingut
      className="group relative bg-card p-5 rounded-2xl border border-border shadow-sm active:scale-[0.985] hover:border-muted transition-all cursor-pointer flex flex-col justify-between h-full focus-visible:ring-2 focus-visible:ring-accent overflow-hidden"
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

      {/* PART SUPERIOR (Icona + Títol + Autor) */}
      <div className="pr-8 flex-1"> 
        <div className="flex items-center gap-2 mb-3 text-muted">
           {getIcon(recurs.tipus)}
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{recurs.tipus}</span>
        </div>
        
        {/* AFEGIT: line-clamp-3 limita el títol a 3 línies màxim */}
        <h4 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors line-clamp-3 mb-2">
          {recurs.titol}
        </h4>
        
        {recurs.autor && (
          <p className="text-sm text-muted italic line-clamp-1">{recurs.autor}</p>
        )}
      </div>

      {/* PART INFERIOR (Categoria + Fletxa) */}
      {/* AFEGIT: mt-auto empeny això cap a baix del tot */}
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