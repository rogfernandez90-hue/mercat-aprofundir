'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { client } from '@/sanity'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Video, Film, Quote, FileText, 
  Mic, BookOpen, ChevronDown, ArrowLeft 
} from 'lucide-react'

import { useQueryState } from '@/hooks/useQueryState'
import HeaderMercat from '@/components/HeaderMercat'
import ResourceSheet from '@/components/ResourceSheet'
import ResourceCard from '@/components/ResourceCard'
import SkeletonList from '@/components/SkeletonList'
import ScrollToTop from '@/components/ScrollToTop'
import Toast from '@/components/Toast'
import HomeSelector from '@/components/HomeSelector'
import SearchBar from '@/components/SearchBar'

const TEMES_GENERALS = [
  'art general', 
  'cos i moviment', 
  'dansa i arquitectura'
]

// Afegim també els noms curts a la llista negra per si de cas
const BLACKLIST = ['art', 'cos', 'dansa', 'cometa', 'heka', 'mirkids']

// --- FUNCIÓ DE NORMALITZACIÓ ---
const createSlug = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]/g, '') 
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const { searchParams, updateQuery } = useQueryState()

  const [recursos, setRecurs] = useState([])
  const [estatsEspectacles, setEstatsEspectacles] = useState([]) 
  const [loading, setLoading] = useState(true)
  
  const [filtreText, setFiltreText] = useState(searchParams.get('q') || '')
  const [contextActiu, setContextActiu] = useState(searchParams.get('context') || 'HOME')
  const [tipusActiu, setTipusActiu] = useState(searchParams.get('tipus') || 'Tots')
  const [veureFavorits, setVeureFavorits] = useState(false) 
  const [recursSeleccionat, setRecursSeleccionat] = useState(null)
  const [favorits, setFavorits] = useState([]) 
  const [toast, setToast] = useState({ show: false, message: '' })

  useEffect(() => {
    const fetchDades = async () => {
      setLoading(true)
      try {
        const savedFavs = localStorage.getItem('mercat_favorits')
        if (savedFavs) setFavorits(JSON.parse(savedFavs))

        // AFEGIT: Camp 'edat' a la query
        const query = `{
          "recursos": *[_type == "recurs"] | order(titol asc) {
            _id, titol, autor, any, editorial, tipus,
            conceptes, enllacos, categoria, espectacle,
            isbn, lloc, idioma, llicencia, imatge, edat
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
    setTimeout(() => setToast({ show: false, message: '' }), 2000)
  }

  const handleModeFavorits = () => {
    const nouEstat = !veureFavorits
    setVeureFavorits(nouEstat)
    if (nouEstat) {
      updateQuery({ context: null, tipus: null, q: null })
      setContextActiu('HOME') 
      setFiltreText('')
    }
  }

  const handleContextChange = (nouContext) => {
    setContextActiu(nouContext)
    setVeureFavorits(false) 
    updateQuery({ context: nouContext === 'HOME' ? null : nouContext })
  }

  const handleTipusChange = (nouTipus) => {
    setTipusActiu(nouTipus)
    updateQuery({ tipus: nouTipus })
  }

  // --- MODIFICAT: GESTIÓ ROBUSTA DE LA CERCA ---
  const handleSearch = (input) => {
    // Si 'input' és un event (teclat), agafem el .target.value
    // Si 'input' és un string (botó 'X'), agafem el valor directament
    const text = (typeof input === 'object' && input.target) ? input.target.value : input
    
    setFiltreText(text)
    const timeoutId = setTimeout(() => updateQuery({ q: text }), 500)
    return () => clearTimeout(timeoutId)
  }

  // --- NOU: RABBIT HOLE NAVIGATION ---
  const handleTagClick = (tag) => {
    // 1. Tanquem la fitxa
    setRecursSeleccionat(null)
    
    // 2. Resetejem el context a 'Tots'
    setContextActiu('Tots') 
    setTipusActiu('Tots')
    setVeureFavorits(false)
    
    // 3. Apliquem el filtre
    setFiltreText(tag)
    updateQuery({ q: tag, context: null, tipus: null })

    // 4. Scroll amunt
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetAll = () => {
    setContextActiu('HOME') 
    setTipusActiu('Tots')
    setFiltreText('')
    setVeureFavorits(false)
    updateQuery({ context: null, tipus: null, q: null })
  }

  // --- LÒGICA DE CLASSIFICACIÓ I FILTRATGE ---
  const { espectaclesActius, espectaclesArxiu, llistaTemes, llistaTipus, recursosFiltrats } = useMemo(() => {
    const totsContextos = new Set()
    const totsTipus = new Set()

    recursos.forEach(r => {
      if (r.espectacle) {
        const esp = r.espectacle.trim()
        if (!BLACKLIST.includes(esp.toLowerCase())) totsContextos.add(esp)
      }
      if (r.categoria) {
        const cat = r.categoria.trim()
        if (!BLACKLIST.includes(cat.toLowerCase())) totsContextos.add(cat)
      }
      if (r.tipus) totsTipus.add(r.tipus)
    })

    const esTemaGeneral = (text) => TEMES_GENERALS.includes(text.toLowerCase())
    const totsPossiblesNoms = Array.from(totsContextos).filter(c => !esTemaGeneral(c)).sort()
    
    const llistaActius = estatsEspectacles
      ?.filter(e => e.actiu)
      .map(e => e.titol) || []

    const slugsActius = llistaActius.map(nom => createSlug(nom))
    
    const llistaArxiu = []
    
    totsPossiblesNoms.forEach(nom => {
      const slugNom = createSlug(nom)
      const esActiu = slugsActius.some(slugActiu => slugActiu.includes(slugNom) || slugNom.includes(slugActiu))
      if (!esActiu) {
        llistaArxiu.push(nom)
      }
    })

    const llistaTemesFinal = Array.from(totsContextos).filter(c => esTemaGeneral(c)).sort()
    const llistaTipusFinal = Array.from(totsTipus).sort()

    let resultats = recursos
    if (veureFavorits) {
      resultats = resultats.filter(r => favorits.includes(r._id))
    } else {
      if (contextActiu !== 'HOME' && contextActiu !== 'Tots') {
        const slugContext = createSlug(contextActiu)
        resultats = resultats.filter(r => {
          const slugEspectacle = createSlug(r.espectacle)
          const slugCategoria = createSlug(r.categoria)
          return (slugEspectacle && slugEspectacle.includes(slugContext)) || 
                 (slugContext && slugContext.includes(slugEspectacle)) ||
                 (slugCategoria && slugCategoria.includes(slugContext)) ||
                 (slugContext && slugContext.includes(slugCategoria))
        })
      }
    }

    if (tipusActiu !== 'Tots') {
      resultats = resultats.filter(r => r.tipus === tipusActiu)
    }

    if (filtreText) {
      const text = createSlug(filtreText)
      resultats = resultats.filter(r => 
        createSlug(r.titol).includes(text) ||
        createSlug(r.autor).includes(text) ||
        r.conceptes?.some(c => createSlug(c).includes(text))
      )
    }

    return { 
      espectaclesActius: llistaActius, 
      espectaclesArxiu: llistaArxiu, 
      llistaTemes: llistaTemesFinal, 
      llistaTipus: llistaTipusFinal, 
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

  const isHomeView = contextActiu === 'HOME' && !filtreText && !veureFavorits

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      
      <HeaderMercat onReset={resetAll} />
      <Toast isVisible={toast.show} message={toast.message} />

      <main className="pt-36 lg:pt-48 pb-24 px-5 max-w-6xl mx-auto">
        
        <SearchBar 
          text={filtreText} 
          setText={handleSearch}
          favoritsCount={favorits.length}
          veureFavorits={veureFavorits}
          setVeureFavorits={handleModeFavorits}
          totalRecursos={recursosFiltrats.length}
          isHome={isHomeView}
        />

        <div className="mt-8">
          {loading ? (
            <SkeletonList />
          ) : isHomeView ? (
            
            <HomeSelector 
              espectacles={espectaclesActius}
              temes={llistaTemes}
              arxiu={espectaclesArxiu} 
              onSelect={(val) => handleContextChange(val)}
            />

          ) : (
            
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <aside className="space-y-8 lg:sticky lg:top-48 lg:h-fit z-20">
                
                <button
                  onClick={() => handleContextChange('HOME')}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors group mb-6"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Tornar a l'inici
                </button>

                {/* 1. ESPECTACLES */}
                <div>
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

                {/* 2. TEMES */}
                <div>
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

              <section>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 mask-linear-fade">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[50vh] items-stretch">
                  <AnimatePresence mode="popLayout">
                    {recursosFiltrats.map((recurs) => (
                      <motion.div 
                        key={recurs._id} 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                        layout className="h-full"
                      >
                        <ResourceCard 
                          recurs={recurs} getIcon={getIcon} onClick={() => setRecursSeleccionat(recurs)}
                          isFavorite={favorits.includes(recurs._id)} onToggleFavorite={toggleFavorite}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {recursosFiltrats.length === 0 && (
                    <div className="col-span-full py-24 text-center opacity-60">
                      <p className="text-sm font-bold mb-4">No s'han trobat resultats.</p>
                      <button onClick={resetAll} className="text-xs font-bold underline uppercase tracking-widest hover:text-accent">
                        Tornar a l'inici
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <ResourceSheet 
        recurs={recursSeleccionat} 
        isOpen={!!recursSeleccionat} 
        onClose={() => setRecursSeleccionat(null)} 
        onTagClick={handleTagClick}
      />
      <ScrollToTop />
    </div>
  )
}