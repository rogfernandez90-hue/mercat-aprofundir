'use client'
import { useState, useEffect } from 'react'

export default function HeaderMercat({ onReset }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Centrem les imatges dins del quadrat
  const imgClass = "absolute inset-0 w-full h-full object-contain object-center transition-opacity duration-500"

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out border-b ${
        scrolled 
          ? 'py-3 bg-background/95 backdrop-blur-md border-border shadow-sm' 
          : 'py-6 bg-background border-transparent'
      }`}
    >
      <div 
        className="px-5 max-w-6xl mx-auto flex items-center cursor-pointer group" 
        onClick={onReset}
      >
        
        {/* 1. LOGO CONTAINER (SEMPRE QUADRAT) */}
        {/* 
            Gran: h-24 w-24 (96px)
            Petit (Scroll): h-12 w-12 (48px)
            El contenidor sempre és quadrat, només canvia de mida.
        */}
        <div className={`relative transition-all duration-500 flex-shrink-0 ${
          scrolled ? 'h-12 w-12' : 'h-16 w-16 lg:h-24 lg:w-24' 
        }`}>
          
          {/* --- MODE CLAR (LIGHT) --- */}
          <div className="dark:hidden contents">
            {/* Imatge A: Amb rodones (Visible a dalt) */}
            <img 
              src="/logo-mercat.png" 
              alt="Mercat Logo Full" 
              className={`${imgClass} ${scrolled ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
            />
            {/* Imatge B: Sense rodones (Visible a l'scroll) */}
            <img 
              src="/logo_mercat_no_rodones.png" 
              alt="Mercat Logo Compact" 
              className={`${imgClass} ${scrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-125'}`}
            />
          </div>

          {/* --- MODE FOSC (DARK) --- */}
          <div className="hidden dark:contents">
            {/* Imatge A Dark */}
            <img 
              src="/logo_mercat_rodones.png" 
              alt="Mercat Logo Full Dark" 
              className={`${imgClass} ${scrolled ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
            />
            {/* Imatge B Dark */}
            <img 
              src="/logo_mercat_no_rodones_blanc.png" 
              alt="Mercat Logo Compact Dark" 
              className={`${imgClass} ${scrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-125'}`}
            />
          </div>
        </div>
        
        {/* 2. LÍNIA SEPARADORA */}
        <div className={`w-px bg-foreground/20 mx-4 transition-all duration-500 ${
          scrolled ? 'h-8 opacity-0 mx-0 w-0' : 'h-16 opacity-100'
        }`} />

        {/* 3. TEXT */}
        <div className={`flex flex-col justify-center transition-all duration-500 ${scrolled ? '-translate-x-2' : 'translate-x-0'}`}>
          <h1 className={`font-bold uppercase tracking-tighter leading-none transition-all duration-500 ${
            scrolled ? 'text-lg' : 'text-2xl lg:text-3xl'
          }`}>
            Aprofundir
          </h1>
          
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            scrolled ? 'max-h-0 opacity-0 mt-0' : 'max-h-24 opacity-100 mt-2'
          }`}>
            <p className="text-[10px] uppercase tracking-widest font-medium leading-tight text-muted max-w-[240px] lg:max-w-[380px]">
              Recursos per continuar explorant els espectacles de la programació familiar.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}