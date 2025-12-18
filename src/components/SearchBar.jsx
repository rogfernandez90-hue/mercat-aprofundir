'use client'
import { Search, Heart, X } from 'lucide-react'

export default function SearchBar({ 
  text, setText, favoritsCount, veureFavorits, setVeureFavorits, totalRecursos, isHome 
}) {
  return (
    <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-xl py-4 -mx-5 px-5 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none transition-all">
      {/* CANVI AQUI: Afegit 'mx-auto' al div flex */}
      <div className="flex gap-3 max-w-2xl mx-auto">
        
        <div className="relative flex-1 group">
          <input 
            type="text" 
            placeholder="Cerca per títol, autor o concepte..." 
            className="w-full h-12 bg-card border border-border rounded-2xl pl-11 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-shadow shadow-sm"
            value={text}
            onChange={setText}
          />
          <Search className="absolute left-4 top-3.5 text-muted group-focus-within:text-foreground transition-colors" size={18} />
          {text && (
            <button onClick={() => setText('')} className="absolute right-3 top-3 p-1 hover:bg-muted/20 rounded-full text-muted hover:text-foreground transition-all">
               <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={setVeureFavorits}
          className={`h-12 px-5 rounded-2xl border transition-all flex items-center gap-2 group relative font-bold text-xs uppercase tracking-wider
            ${veureFavorits 
              ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
              : 'bg-card border-border text-muted hover:border-red-200 hover:text-red-500'}`}
        >
          <Heart size={20} className={`transition-transform ${veureFavorits ? "fill-white" : "group-hover:scale-110"}`} />
          <span className="hidden md:inline">{veureFavorits ? 'Tancar' : 'Favorits'}</span>
          {favoritsCount > 0 && !veureFavorits && (
            <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-foreground text-background text-[10px] shadow-sm">
              {favoritsCount}
            </span>
          )}
        </button>
      </div>

      {!isHome && (
        // També centrem el comptador de resultats
        <div className="mt-3 flex justify-center items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted animate-in fade-in slide-in-from-top-1">
          {veureFavorits 
            ? <span className="text-red-500">Mostrant {totalRecursos} favorits</span>
            : <span>{totalRecursos} Recursos trobats</span>
          }
        </div>
      )}
    </div>
  )
}