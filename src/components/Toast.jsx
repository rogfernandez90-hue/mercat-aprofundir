'use client'
import { motion, AnimatePresence } from 'framer-motion'

export default function Toast({ message, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-8 inset-x-0 flex justify-center z-[60] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-foreground text-background px-6 py-3 rounded-full shadow-2xl font-medium text-sm flex items-center gap-2"
          >
            {message}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}