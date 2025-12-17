'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, BookOpen, Video, Film, FileText, Quote, Mic, Share2, Check } from 'lucide-react'
import { useState } from 'react'

export default function ResourceSheet({ recurs, isOpen, onClose }) {
  const [copied, setCopied] = useState(false)

  if (!recurs) return null;

  // Lògica de Compartir
  const handleShare = () => {
    const shareData = {
      title: recurs.titol,
      text: `Mira aquest recurs del Mercat de les Flors: ${recurs.titol}`,
      url: window.location.href // Comparteix la URL actual (que ja té els filtres, es podria millorar amb IDs)
    }

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.log('Error compartint', err));
    } else {
      // Fallback: Copiar al portapapers
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  const getIcon = (tipus) => {
    const t = tipus?.toLowerCase() || ''
    if (t.includes('vídeo')) return <Video size={18} />
    if (t.includes('pel·lícula')) return <Film size={18} />
    if (t.includes('article')) return <FileText size={18} />
    if (t.includes('cita')) return <Quote size={18} />
    if (t.includes('audio')) return <Mic size={18} />
    return <BookOpen size={18} />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY FOSC */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* PANEL LATERAL / BOTTOM SHEET */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 inset-x-0 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[480px] bg-background z-50 shadow-2xl flex flex-col rounded-t-[32px] lg:rounded-l-[32px] lg:rounded-tr-none border-t lg:border-t-0 lg:border-l border-border max-h-[95vh] lg:max-h-full"
          >
            {/* Tirador per a mòbil */}
            <div className="h-1.5 w-12 bg-border/60 rounded-full mx-auto mt-4 mb-2 lg:hidden flex-shrink-0" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
              
              {/* CAPÇALERA AMB ACCIONS */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="flex items-center gap-2 px-3 py-1 bg-card border border-border rounded-full text-[10px] font-bold uppercase text-muted shadow-sm">
                    {getIcon(recurs.tipus)} {recurs.tipus}
                  </span>
                  {recurs.espectacle && (
                    <span className="px-3 py-1 bg-accent/5 text-accent border border-accent/20 rounded-full text-[10px] font-bold uppercase">
                      {recurs.espectacle}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Botó Compartir */}
                  <button 
                    onClick={handleShare}
                    className="p-2.5 hover:bg-card rounded-full transition-all text-muted hover:text-foreground border border-transparent hover:border-border"
                    title="Compartir recurs"
                  >
                    {copied ? <Check size={20} className="text-green-600" /> : <Share2 size={20} />}
                  </button>
                  
                  {/* Botó Tancar */}
                  <button 
                    onClick={onClose}
                    className="p-2.5 bg-card hover:bg-muted/20 rounded-full transition-all text-foreground border border-border shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* CONTINGUT PRINCIPAL */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold leading-[1.1] mb-3 tracking-tight">
                    {recurs.titol}
                  </h2>
                  <p className="text-xl text-muted italic font-serif">
                    {recurs.autor}
                  </p>
                </div>

                {/* METADATES (GRID) */}
                <div className="grid grid-cols-2 gap-6 p-5 bg-card/50 rounded-2xl border border-border/50">
                  {recurs.editorial && (
                    <div>
                      <span className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Editorial</span>
                      <p className="font-medium text-sm">{recurs.editorial}</p>
                    </div>
                  )}
                  {recurs.any && (
                    <div>
                      <span className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Any</span>
                      <p className="font-medium text-sm">{recurs.any}</p>
                    </div>
                  )}
                  {recurs.lloc && (
                    <div>
                      <span className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Lloc</span>
                      <p className="font-medium text-sm">{recurs.lloc}</p>
                    </div>
                  )}
                  {recurs.idioma && (
                    <div>
                      <span className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Idioma</span>
                      <p className="font-medium text-sm">{recurs.idioma}</p>
                    </div>
                  )}
                </div>

                {/* ENLLAÇOS */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Accés al recurs</h3>
                  {recurs.enllacos?.length > 0 ? (
                    recurs.enllacos.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        className="group flex items-center justify-between w-full p-4 lg:p-5 bg-foreground text-background rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                      >
                        <span className="uppercase tracking-wide pr-4 truncate">
                          {link.titol || 'Obrir recurs extern'}
                        </span>
                        <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    ))
                  ) : (
                    <div className="p-6 bg-card border border-border border-dashed rounded-2xl text-center">
                      <BookOpen className="mx-auto mb-2 text-muted/50" size={24} />
                      <p className="text-sm text-muted font-medium">Disponible per consulta a la biblioteca física.</p>
                      <p className="text-xs text-muted/60 mt-1 uppercase tracking-wider">Mercat de les Flors</p>
                    </div>
                  )}
                </div>

                {/* CONCEPTES / TAGS */}
                {recurs.conceptes && recurs.conceptes.length > 0 && (
                  <div className="pt-6 border-t border-border">
                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Conceptes Clau</h3>
                    <div className="flex flex-wrap gap-2">
                      {recurs.conceptes.map((c, i) => (
                        <span key={i} className="px-3 py-1.5 bg-card text-muted-foreground text-xs rounded-lg border border-border">
                          #{c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}