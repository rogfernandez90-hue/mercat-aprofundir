'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Grid, Archive } from 'lucide-react'

export default function HomeSelector({ espectacles, temes, arxiu, onSelect }) {
  return (
    <div className="space-y-12 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. ESPECTACLES ACTIUS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-accent" size={20} />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
            Què has vingut a veure?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {espectacles.map((esp, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(esp)}
              className="group relative min-h-[140px] h-full w-full bg-card hover:bg-foreground hover:text-background border border-border rounded-3xl p-6 flex flex-col justify-between text-left transition-all shadow-sm hover:shadow-2xl"
            >
              <span className="font-bold text-xl md:text-2xl uppercase tracking-tight leading-none max-w-[85%] mb-4">
                {esp}
              </span>
              <div className="self-end bg-accent/10 group-hover:bg-background/20 p-2 rounded-full transition-colors">
                <ArrowRight size={24} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 2. TEMES + VEURE TOT */}
      <div className="space-y-6 border-t border-border/50 pt-10">
        {/* --- AQUÍ ÉS EL CANVI --- */}
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
          Temes Transversals
        </h2>
        {/* ----------------------- */}
        
        <div className="flex flex-wrap gap-3 items-center">
          {temes.map((tema, i) => (
            <button
              key={i}
              onClick={() => onSelect(tema)}
              className="px-5 py-2.5 bg-card hover:bg-accent hover:text-white border border-border rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-sm active:scale-95"
            >
              {tema}
            </button>
          ))}

          <div className="h-8 w-px bg-border mx-2 hidden md:block" />

          <button
            onClick={() => onSelect('Tots')}
            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background border border-foreground rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <Grid size={14} />
            Veure-ho tot
          </button>
        </div>
      </div>

      {/* 3. ARXIU D'ESPECTACLES PASSATS */}
      {arxiu && arxiu.length > 0 && (
        <div className="pt-8 mt-4 border-t border-border/50 opacity-80 hover:opacity-100 transition-opacity">
          <div className="relative group w-full md:w-auto inline-block">
            <select 
              onChange={(e) => onSelect(e.target.value)}
              className="appearance-none bg-muted/10 hover:bg-muted/20 border border-transparent hover:border-muted text-muted-foreground rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase cursor-pointer focus:outline-none transition-all w-full md:w-auto"
              defaultValue=""
            >
              <option value="" disabled>Consultar espectacles anteriors</option>
              {arxiu.map((esp, i) => (
                <option key={i} value={esp}>{esp}</option>
              ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-muted-foreground">
              <Archive size={16} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}