'use client'

import { useState, useEffect, useMemo } from 'react'
import { client } from '@/sanity'
import { 
  Search, BookOpen, Video, Film, Quote, FileText, 
  X, ExternalLink, ChevronDown, MonitorPlay, Mic,
  ArrowRight
} from 'lucide-react'

// --- CONFIGURACIÓ ---
const LOGO_URL = "/logo-mercat.png" 

// 🔥 AQUI DEFINIM QUÈ ÉS UN TEMA (i no un espectacle)
// Posa aquí exactament com està escrit al CSV (majúscules/minúscules no importen, el codi ho arregla)
const TEMES_GENERALS = [
  'art general', 
  'cos i moviment', 
  'art', 
  'cos',
  'dansa i arquitectura', // Si en tens més, afegeix-los aquí
]

export default function Home() {
  const [recursos, setRecurs] = useState([])
  
  // Estats dels Filtres
  const [filtreText, setFiltreText] = useState('')
  const [contextActiu, setContextActiu] = useState('Tots')
  const [tipusActiu, setTipusActiu] = useState('Tots')
  
  const [recursSeleccionat, setRecursSeleccionat] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  // 1. Càrrega de dades
  useEffect(() => {
    const fetchDades = async () => {
      const query = `*[_type == "recurs"] | order(titol asc) {
        _id, titol, autor, any, editorial, tipus,
        conceptes, enllacos, categoria, espectacle,
        isbn, lloc, idioma, llicencia
      }`
      const dades = await client.fetch(query)
      setRecurs(dades)
    }
    fetchDades()
  }, [])

  // 2. Scroll Header (per amagar subtítol)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 3. Càlcul de Llistes Uniques i Filtratge
  const { llistaEspectacles, llistaTemes, llistaTipus, recursosFiltrats } = useMemo(() => {
    
    const totsContextos = new Set()
    const totsTipus = new Set()

    recursos.forEach(r => {
      // Prioritzem espectacle, si no categoria
      const context = r.espectacle || r.categoria
      if (context) totsContextos.add(context.trim())
      if (r.tipus) totsTipus.add(r.tipus)
    })

    // Normalitzem per comparar (tot a minúscules)
    const esTemaGeneral = (text) => TEMES_GENERALS.includes(text.toLowerCase())

    const espectacles = Array.from(totsContextos).filter(c => !esTemaGeneral(c))
    const temes = Array.from(totsContextos).filter(c => esTemaGeneral(c))
    
    espectacles.sort()
    temes.sort()
    const tipusOrdenats = Array.from(totsTipus).sort()

    // FILTRATGE
    let resultats = recursos

    // 1. Filtre per Context
    if (contextActiu !== 'Tots') {
      resultats = resultats.filter(r => 
        (r.espectacle && r.espectacle.trim() === contextActiu) || 
        (r.categoria && r.categoria.trim() === contextActiu)
      )
    }

    // 2. Filtre per Tipus
    if (tipusActiu !== 'Tots') {
      resultats = resultats.filter(r => r.tipus === tipusActiu)
    }

    // 3. Filtre per Text
    if (filtreText) {
      const text = filtreText.toLowerCase()
      resultats = resultats.filter(r => 
        r.titol?.toLowerCase().includes(text) ||
        r.autor?.toLowerCase().includes(text) ||
        r.conceptes?.some(c => c.toLowerCase().includes(text))
      )
    }

    return { 
      llistaEspectacles: espectacles, 
      llistaTemes: temes, 
      llistaTipus: tipusOrdenats,
      recursosFiltrats: resultats 
    }
  }, [recursos, contextActiu, tipusActiu, filtreText])


  // --- ICONES ---
  const getIcon = (tipus) => {
    const t = tipus?.toLowerCase() || ''
    if (t.includes('vídeo')) return <Video size={14} />
    if (t.includes('pel·lícula') || t.includes('film')) return <Film size={14} />
    if (t.includes('article')) return <FileText size={14} />
    if (t.includes('cita')) return <Quote size={14} />
    if (t.includes('audio') || t.includes('podcast')) return <Mic size={14} />
    return <BookOpen size={14} />
  }

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#1A1A1A] font-sans pb-24">
      
      {/* --- HEADER --- */}
      <header className={`fixed top-0 inset-x-0 z-40 bg-[#F8F8F6]/95 backdrop-blur-md border-b border-stone-200 transition-all duration-300 ${scrolled ? 'py-3 shadow-sm' : 'py-6'}`}>
        <div className="px-5 max-w-md mx-auto">
          <div className="flex items-start gap-4" onClick={() => {setContextActiu('Tots'); setTipusActiu('Tots'); setFiltreText('')}}>
             
             {/* Logo a l'esquerra */}
             <img src={LOGO_URL} alt="Mercat de les Flors" className={`object-contain transition-all duration-300 ${scrolled ? 'h-8 w-auto' : 'h-12 w-auto'}`} onError={(e) => e.target.style.display='none'} />
             
             {/* Textos */}
             <div className="flex flex-col justify-center">
                <h1 className={`font-bold uppercase tracking-tight leading-none transition-all duration-300 ${scrolled ? 'text-xl' : 'text-3xl'}`}>
                  Aprofundir
                </h1>
                
                {/* Subtítol (s'amaga al fer scroll) */}
                <p className={`text-stone-500 text-xs leading-tight mt-1 transition-all duration-300 origin-top 
                  ${scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`}>
                  Recursos per continuar explorant els espectacles de la programació familiar del Mercat de les Flors
                </p>
             </div>
          </div>
        </div>
      </header>

      {/* Ajustem el padding-top dinàmicament segons si hi ha scroll o no, o fixem un valor segur */}
      <main className="pt-32 px-5 max-w-md mx-auto">
        
        {/* --- 1. CERCADOR --- */}
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Buscar títol, autor..." 
            className="w-full bg-white border border-stone-300 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
            value={filtreText}
            onChange={(e) => setFiltreText(e.target.value)}
          />
          <Search className="absolute left-3.5 top-2.5 text-stone-400" size={18} />
        </div>

        {/* --- 2. FILTRE ESPECTACLES (TARGETES RECTANGULARS) --- */}
        {llistaEspectacles.length > 0 && (
          <div className="mb-5">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">
              Espectacles
            </h3>
            
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x no-scrollbar">
              <button
                  onClick={() => setContextActiu('Tots')}
                  className={`snap-start shrink-0 h-16 px-4 rounded-xl flex items-center justify-center text-center border transition-all text-[11px] font-bold uppercase leading-tight
                    ${contextActiu === 'Tots' 
                      ? 'bg-black text-white border-black shadow-md' 
                      : 'bg-white text-stone-500 border-stone-200'}`}
                >
                  Tots
              </button>

              {llistaEspectacles.map((esp, i) => (
                <button
                  key={i}
                  onClick={() => setContextActiu(esp)}
                  className={`snap-start shrink-0 h-16 w-32 px-3 rounded-xl flex items-center justify-center text-center border transition-all text-[11px] font-bold uppercase leading-tight break-words overflow-hidden
                    ${contextActiu === esp 
                      ? 'bg-black text-white border-black shadow-md ring-2 ring-offset-1 ring-stone-200' 
                      : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'}`}
                >
                  <span className="line-clamp-2">{esp}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- 3. FILTRE TEMES (BOTONS PETITS) --- */}
        {llistaTemes.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {llistaTemes.map((tema, i) => (
                <button
                  key={i}
                  onClick={() => setContextActiu(tema)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all
                    ${contextActiu === tema 
                      ? 'bg-stone-700 text-white border-stone-700' 
                      : 'bg-[#EDEDEB] text-stone-600 border-transparent hover:bg-stone-200'}`}
                >
                  {tema}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- 4. FILTRE TIPUS (BARRA COMPACTA) --- */}
        <div className="mb-4 sticky top-[72px] z-30 bg-[#F8F8F6]/95 py-2 -mx-5 px-5 backdrop-blur-sm border-b border-stone-100/50">
           <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                 onClick={() => setTipusActiu('Tots')}
                 className={`whitespace-nowrap px-3 py-1 rounded-md text-[10px] font-bold uppercase border transition-all
                   ${tipusActiu === 'Tots' ? 'bg-black text-white border-black' : 'bg-white text-stone-500 border-stone-300'}`}
              >
                Tot
              </button>
              {llistaTipus.map((tipus, i) => (
                 <button
                   key={i}
                   onClick={() => setTipusActiu(tipus)}
                   className={`whitespace-nowrap px-3 py-1 flex items-center gap-1.5 rounded-md text-[10px] font-bold uppercase border transition-all
                     ${tipusActiu === tipus ? 'bg-black text-white border-black' : 'bg-white text-stone-500 border-stone-300'}`}
                 >
                   {getIcon(tipus)}
                   {tipus}
                 </button>
              ))}
           </div>
        </div>

        {/* --- 5. RESULTATS --- */}
        <div>
          <div className="flex justify-between items-end mb-3 px-1">
             <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
               {recursosFiltrats.length} Recursos
             </h3>
          </div>
          
          <div className="flex flex-col gap-2 min-h-[50vh]">
            {recursosFiltrats.map((recurs) => (
              <div 
                key={recurs._id}
                onClick={() => setRecursSeleccionat(recurs)}
                className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm active:scale-[0.98] transition-transform cursor-pointer flex justify-between items-center group hover:border-stone-400"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-stone-400">{getIcon(recurs.tipus)}</span>
                     <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">
                       {recurs.tipus}
                     </span>
                  </div>
                  
                  <h4 className="font-bold text-sm leading-tight text-stone-900 group-hover:underline decoration-2 underline-offset-2">
                    {recurs.titol}
                  </h4>
                  {recurs.autor && <p className="text-xs text-stone-500 mt-1 line-clamp-1">{recurs.autor}</p>}
                </div>

                <div className="text-stone-300">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}

            {recursosFiltrats.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center opacity-60">
                <Search size={24} className="mb-2" />
                <p className="text-xs">No hi ha resultats.</p>
                <button onClick={() => {setContextActiu('Tots'); setTipusActiu('Tots'); setFiltreText('')}} className="mt-2 text-xs font-bold underline">
                  Netejar filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- 6. MODAL (Fitxa) --- */}
      {recursSeleccionat && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
            onClick={() => setRecursSeleccionat(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            
            <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center z-10" onClick={() => setRecursSeleccionat(null)}>
              <div className="w-10 h-1 bg-stone-300 rounded-full"></div>
            </div>

            <div className="px-5 pb-10 pt-2">
              {/* Capçalera */}
              <div className="mb-4">
                 <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-stone-600 border border-stone-200">
                      {getIcon(recursSeleccionat.tipus)} {recursSeleccionat.tipus}
                    </span>
                    {recursSeleccionat.espectacle && (
                      <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {recursSeleccionat.espectacle}
                      </span>
                    )}
                 </div>
                 <h2 className="text-xl font-bold text-stone-900 leading-tight mb-1">
                   {recursSeleccionat.titol}
                 </h2>
                 <p className="text-base text-stone-600 italic">
                   {recursSeleccionat.autor}
                 </p>
              </div>

              {/* Info Extra */}
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-xs text-stone-600 grid grid-cols-2 gap-3 mb-6">
                 {recursSeleccionat.editorial && <div><span className="block text-[10px] font-bold text-stone-400 uppercase">Editorial</span>{recursSeleccionat.editorial}</div>}
                 {recursSeleccionat.any && <div><span className="block text-[10px] font-bold text-stone-400 uppercase">Any</span>{recursSeleccionat.any}</div>}
                 {recursSeleccionat.idioma && <div><span className="block text-[10px] font-bold text-stone-400 uppercase">Idioma</span>{recursSeleccionat.idioma}</div>}
              </div>

              {/* Botons */}
              <div className="flex flex-col gap-2 mb-6">
                {recursSeleccionat.enllacos?.length > 0 ? (
                  recursSeleccionat.enllacos.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" className="flex items-center justify-between w-full p-3 bg-black text-white rounded-lg font-bold text-sm hover:bg-stone-800 transition-all">
                      <span className="uppercase text-xs tracking-wide">{link.titol || 'Veure recurs'}</span>
                      <ExternalLink size={16} />
                    </a>
                  ))
                ) : (
                  <div className="p-3 bg-stone-100 text-stone-500 rounded-lg text-center text-xs italic">
                    Consultar a la biblioteca física.
                  </div>
                )}
              </div>

              {/* Tags */}
              {recursSeleccionat.conceptes && (
                <div className="flex flex-wrap gap-1.5 justify-center opacity-70">
                  {recursSeleccionat.conceptes.map((c, i) => (
                    <span key={i} className="text-[10px] text-stone-500 border-b border-stone-300">
                      #{c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}