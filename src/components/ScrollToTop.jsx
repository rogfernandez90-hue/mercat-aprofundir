'use client'
import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600) //
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-6 z-40 bg-accent text-background p-3 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-transform lg:bottom-12 lg:right-12"
          aria-label="Tornar a dalt"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}