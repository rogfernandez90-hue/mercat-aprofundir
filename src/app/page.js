'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { client } from '@/sanity'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, BookOpen, Video, Film, Quote, FileText, 
  Mic, Heart, X, ChevronDown 
} from 'lucide-react'

// HOOKS
import { useQueryState } from '@/hooks/useQueryState'

// COMPONENTS
import HeaderMercat from '@/components/HeaderMercat'
import ResourceSheet from '@/components/ResourceSheet'
import ResourceCard from '@/components/ResourceCard'
import SkeletonList from '@/components/SkeletonList'
import ScrollToTop from '@/components/ScrollToTop'
import Toast from '@/components/Toast'

const TEMES_GENERALS = [
  'art general', 
  'cos i moviment', 
  'art', 
  'cos',
  'dansa i arquitectura'
]

// 1. EXPORT DEFAULT
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  )
}

// 2. CONTINGUT
function HomeContent() {
  const { searchParams, updateQuery } = useQueryState()

  // Estats
  const [recursos, setRecurs] = useState([])
  const [estatsEspectacles, setEstatsEspectacles] = useState([]) 
  const [loading, setLoading] = useState(true)
  
  // Filtres
  const [filtreText, setFiltreText] = useState(searchParams.get('q') || '')
  const [contextActiu, setContextActiu] = useState(searchParams.get('context') || 'Tots')
  const [tipusActiu, setTipusActiu] = useState(searchParams.get('tipus') || 'Tots')
  const [veureFavorits, setVeureFavorits] = useState(false) 
  
  // Interacció
  const [recursSeleccionat, setRecursSeleccionat] = useState(null)
  const [favorits, setFavorits] = useState([]) 
  const [toast, setToast] = useState({ show: false, message: '' })

  // Càrrega
  useEffect(() => {
    const fetchDades = async () => {
      setLoading(true)
      try {
        const savedFavs = localStorage.getItem('mercat_favorits')
        if (savedFavs) setFavorits(JSON.parse(savedFavs))

        const query = `{
          "recursos": *[_type == "recurs"] | order(titol asc) {
            _id, titol, autor, any, editorial, tipus,
            conceptes, enllacos, categoria, espectacle,
            isbn, lloc, idioma, llicencia
          },
          "configuracio": *[_type == "espectacle"] {
            titol, actiu
          }
        }`
        
        const dades = await client.fetch(query)
        setRecurs(dades.recursos || [])
        setEstatsEspectacles(dades.configuracio || [])

      } catch (error) {
        console.error("Error carregant dades:", error)
      } finally {
        setTimeout(() => setLoading(false), 300)
      }
    }
    fetchDades()
  }, [])

  // Helpers
  const toggleFavorite = (id) => {
    let nousFavorits, missatge
    if (favorits.includes(id)) {
      nousFavorits = favorits.filter(fId => fId !== id)
      missatge = "Eliminat dels favorits"
    } else {
      nousFavorits = [...favorits, id]
      missatge = "Afegit als favorits"
    }
    setFavorits(nousFavorits)
    localStorage.setItem('mercat_favorits', JSON.stringify(nousFavorits))
    setToast({ show: true, message: missatge })
    setTimeout(() => setToast({ show: false, message: '' }), 2500)
  }

  const toggleModeFavorits = () => {
    const nouEstat = !veureFavorits
    setVeureFavorits(nouEstat)
    if (nouEstat) {
      updateQuery({ context: null, tipus: null, q: null })
      setContextActiu('Tots')
      setFiltreText('')
    }
  }

  const handleContextChange = (nouContext) => {
    setContextActiu(nouContext)
    setVeureFavorits(false) 
    updateQuery({ context: nouContext })
  }

  const handleTipusChange = (nouTipus) => {
    setTipusActiu(nouTipus)
    updateQuery({ tipus: nouTipus })
  }

  const handleTextChange = (e) => {
    const text = e.target.value
    setFiltreText(text)
    const timeoutId = setTimeout(() => updateQuery({ q: text }), 500)
    return () => clearTimeout(timeoutId)
  }

  const netejarFiltres = () => {
    setContextActiu('Tots')
    setTipusActiu('Tots')
    setFiltreText('')
    setVeureFavorits(false)
    updateQuery({ context: null, tipus: null, q: null })
  }

  // Lògica Principal
  const { espectaclesActius, espectaclesArxiu, llistaTemes, llistaTipus, recursosFiltrats } = useMemo(() => {
    const totsContextos = new Set()
    const totsTipus = new Set()

    recursos.forEach(r => {
      const context = r.espectacle || r.categoria
      if (context) totsContextos.add(context.trim())
      if (r.tipus) totsTipus.add(r.tipus)
    })

    const esTemaGeneral = (text) => TEMES_GENERALS.includes(text.toLowerCase())
    const totsEspectacles = Array.from(totsContextos).filter(c => !esTemaGeneral(c)).sort()
    
    // Actius vs Arxiu
    const actiusConfigurats = estatsEspectacles
      ?.filter(e => e.actiu)
      .map(e => e.titol?.toLowerCase().trim()) || []

    const espectaclesActius = []
    const espectaclesArxiu = []

    if (!estatsEspectacles || estatsEspectacles.length === 0) {
      espectaclesActius.push(...totsEspectacles)
    } else {
      totsEspectacles.forEach(nom => {
        if (actiusConfigurats.includes(nom.toLowerCase().trim())) {
          espectaclesActius.push(nom)
        } else {
          espectaclesArxiu.push(nom)
        }
      })
    }

    const llistaTemes = Array.from(totsContextos).filter(c => esTemaGeneral(c)).sort()
    const llistaTipus = Array.from(totsTipus).sort()

    // Filtratge
    let resultats = recursos
    if (veureFavorits) {
      resultats = resultats.filter(r => favorits.includes(r._id))
    } else {
      if (contextActiu !== 'Tots') {
        resultats = resultats.filter(r => 
          (r.espectacle && r.espectacle.trim() === contextActiu) || 
          (r.categoria && r.categoria.trim() === contextActiu)
        )
      }
    }

    if (tipusActiu !== 'Tots') {
      resultats = resultats.filter(r => r.tipus === tipusActiu)
    }

    if (filtreText) {
      const text = filtreText.toLowerCase()
      resultats = resultats.filter(r => 
        r.titol?.toLowerCase().includes(text) ||
        r.autor?.toLowerCase().includes(text) ||
        r.conceptes?.some(c => c.toLowerCase().includes(text))
      )
    }

    return { 
      espectaclesActius, 
      espectaclesArxiu, 
      llistaTemes, 
      llistaTipus, 
      recursosFiltrats: resultats 
    }
  }, [recursos, contextActiu, tipusActiu, filtreText, veureFavorits, favorits, estatsEspectacles])

  const getIcon = (tipus) => {
    const t = tipus?.toLowerCase() || ''
    if (t.includes('vídeo')) return <Video size={16} />
    if (t.includes('pel·lícula') || t.includes('film')) return <Film size={16} />
    if (t.includes('article')) return <FileText size={16} />
    if (t.includes('cita')) return <Quote size={16} />
    if (t.includes('audio') || t.includes('podcast')) return <Mic size={16} />
    return <BookOpen size={16} />
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      
      <HeaderMercat onReset={netejarFiltres} />
      <Toast isVisible={toast.show} message={toast.message} />

      {/* AJUST: pt-36 per defecte, pt-48 per pantalles grans */}
      <main className="pt-36 lg:pt-48 pb-24 px-5 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          
          {/* SIDEBAR - ARA S'ENGANXA MÉS AMUNT */}
          {/* Canvi: top-20 per enganxar-se sota el header petit */}
          <aside className="space-y-8 lg:sticky lg:top-20 lg:h-fit z-30">
            
            {/* 1. CERCA I FAVORITS */}
            <div className="space-y-3">
              <div className="relative flex gap-2">
                <div className="relative flex-1 group">
                  <input 
                    type="text" 
                    placeholder="Busca títol, autor..." 
                    className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                    value={filtreText}
                    onChange={handleTextChange}
                  />
                  <Search className="absolute left-3 top-3.5 text-muted group-focus-within:text-accent transition-colors" size={16} />
                  {filtreText && (
                    <button onClick={() => { setFiltreText(''); updateQuery({ q: null }) }} className="absolute right-2.5 top-3 p-0.5 hover:bg-muted/20 rounded-full text-muted hover:text-foreground transition-all">
                       <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={toggleModeFavorits}
                  className={`px-3.5 rounded-xl border transition-all flex items-center justify-center gap-2 group relative
                    ${veureFavorits 
                      ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20' 
                      : 'bg-card border-border text-muted hover:border-red-200 hover:text-red-500'}`}
                  title={veureFavorits ? "Tornar a tots" : "Veure els meus favorits"}
                >
                  <Heart size={20} className={`transition-transform ${veureFavorits ? "fill-white scale-110" : "group-hover:scale-110"}`} />
                  {favorits.length > 0 && !veureFavorits && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background shadow-sm">
                      {favorits.length}
                    </span>
                  )}
                </button>
              </div>
              {veureFavorits && (
                 <div className="flex items-center justify-between px-1 animate-in fade-in slide-in-from-top-1">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                     Mostrant {recursosFiltrats.length} favorits
                   </span>
                   <button onClick={toggleModeFavorits} className="text-[10px] underline text-muted hover:text-foreground">
                     Tancar
                   </button>
                 </div>
              )}
            </div>

            {/* 2. ESPECTACLES */}
            <div className={`transition-opacity duration-300 ${veureFavorits ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
              <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 px-1">Espectacles</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleContextChange('Tots')}
                  className={`w-full px-4 py-3 rounded-xl text-[11px] font-bold uppercase transition-all border text-left flex justify-between items-center group
                    ${contextActiu === 'Tots' 
                      ? 'bg-foreground text-background border-foreground shadow-lg' 
                      : 'bg-card text-foreground border-border hover:border-muted'}`}
                >
                  <span>Tots els recursos</span>
                  {contextActiu === 'Tots' && <span className="h-1.5 w-1.5 bg-background rounded-full" />}
                </button>

                {/* Actius */}
                {espectaclesActius.map((esp, i) => (
                  <button
                    key={i}
                    onClick={() => handleContextChange(esp)}
                    className={`w-full px-4 py-3 rounded-xl text-[11px] font-bold uppercase transition-all border text-left relative overflow-hidden
                      ${contextActiu === esp 
                        ? 'bg-accent text-background border-accent shadow-md' 
                        : 'bg-card text-foreground border-border hover:border-muted hover:bg-accent/5'}`}
                  >
                     {esp}
                  </button>
                ))}

                {/* Arxiu */}
                {espectaclesArxiu.length > 0 && (
                  <div className="relative mt-2 group">
                    <select 
                      onChange={(e) => handleContextChange(e.target.value)}
                      className={`w-full appearance-none bg-transparent border border-dashed text-muted hover:text-foreground hover:border-muted rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase cursor-pointer focus:outline-none transition-colors
                        ${espectaclesArxiu.includes(contextActiu) ? 'border-accent text-accent' : 'border-border/60 text-muted/80'}`}
                      value={espectaclesArxiu.includes(contextActiu) ? contextActiu : ""}
                    >
                      <option value="" disabled>Arxiu d'espectacles passats</option>
                      {espectaclesArxiu.map((esp, i) => (
                        <option key={i} value={esp}>{esp}</option>
                      ))}
                    </select>
                    <div className={`absolute right-3 top-3 pointer-events-none group-hover:text-muted ${espectaclesArxiu.includes(contextActiu) ? 'text-accent' : 'text-muted/60'}`}>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. TEMES */}
            <div className={`transition-opacity duration-300 ${veureFavorits ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
              <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 px-1">Temes Transversals</h3>
              <div className="flex flex-wrap gap-2">
                {llistaTemes.map((tema, i) => (
                  <button
                    key={i}
                    onClick={() => handleContextChange(tema)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all
                      ${contextActiu === tema 
                        ? 'bg-muted text-background border-muted' 
                        : 'bg-card text-muted border-border hover:border-muted hover:bg-accent/5'}`}
                  >{tema}</button>
                ))}
              </div>
            </div>
          </aside>

          {/* RESULTATS */}
          <section>
            
            {/* 
                AJUST BARRA HORITZONTAL: 
                - top-16 (64px) perquè quedi just sota el header quan està petit.
                - bg-background/95 backdrop-blur-md: Perquè les targetes NO es vegin a través.
                - z-40: Per estar per sobre de les targetes però sota el Header.
            */}
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4 sticky top-16 z-40 bg-background/95 backdrop-blur-md py-2 -mt-2 transition-all">
               <h2 className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                 {loading 
                   ? 'Carregant...' 
                   : veureFavorits 
                     ? <><Heart size={12} className="fill-red-500 text-red-500" /> {recursosFiltrats.length} Guardats</> 
                     : `${recursosFiltrats.length} Recursos`
                 }
               </h2>
               <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[200px] md:max-w-none pb-1">
                  <button
                    onClick={() => handleTipusChange('Tots')}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-all
                      ${tipusActiu === 'Tots' ? 'bg-accent text-background border-accent' : 'bg-card border-border hover:border-muted'}`}
                  >Tots</button>
                  {llistaTipus.map((tipus, i) => (
                    <button
                      key={i}
                      onClick={() => handleTipusChange(tipus)}
                      className={`whitespace-nowrap px-3 py-1 flex items-center gap-2 rounded-full text-[10px] font-bold uppercase border transition-all
                        ${tipusActiu === tipus ? 'bg-accent text-background border-accent' : 'bg-card border-border hover:border-muted'}`}
                    >
                      {getIcon(tipus)}
                      {tipus}
                    </button>
                  ))}
               </div>
            </div>

            {loading ? <SkeletonList /> : (
              <motion.div 
                variants={containerVariants} initial="hidden" animate="show"
                key={`${contextActiu}-${tipusActiu}-${veureFavorits}-${filtreText}`}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[50vh] items-stretch"
              >
                <AnimatePresence mode="popLayout">
                  {recursosFiltrats.map((recurs) => (
                    <motion.div key={recurs._id} variants={itemVariants} layout className="h-full">
                      <ResourceCard 
                        recurs={recurs} getIcon={getIcon} onClick={() => setRecursSeleccionat(recurs)}
                        isFavorite={favorits.includes(recurs._id)} onToggleFavorite={toggleFavorite}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {recursosFiltrats.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 text-center flex flex-col items-center opacity-60">
                    {veureFavorits ? (
                       <>
                         <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                            <Heart size={32} className="text-red-400 fill-red-400/20" />
                         </div>
                         <p className="text-sm font-bold">Encara no tens favorits.</p>
                         <button onClick={toggleModeFavorits} className="mt-6 px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-background transition-colors">Tornar</button>
                       </>
                    ) : (
                       <>
                         <div className="bg-card p-4 rounded-full mb-4 border border-border">
                            <Search size={32} className="text-muted" />
                         </div>
                         <p className="text-sm font-medium">No s'han trobat resultats.</p>
                         <button onClick={netejarFiltres} className="mt-6 text-xs font-bold underline uppercase tracking-widest hover:text-accent">Netejar filtres</button>
                       </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </section>
        </div>
      </main>

      <ResourceSheet recurs={recursSeleccionat} isOpen={!!recursSeleccionat} onClose={() => setRecursSeleccionat(null)} />
      <ScrollToTop />
    </div>
  )
}