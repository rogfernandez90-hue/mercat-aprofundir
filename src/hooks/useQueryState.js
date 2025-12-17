'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useRef } from 'react'

export function useQueryState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Fem servir una referència per guardar la darrera query i evitar bucles
  const lastQueryRef = useRef(searchParams.toString())

  const updateQuery = useCallback((params) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === 'Tots' || value === '') {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    })

    const newQueryString = newSearchParams.toString()
    
    // NOMÉS si la query és realment diferent de la darrera, actualitzem la URL
    if (newQueryString !== lastQueryRef.current) {
      lastQueryRef.current = newQueryString
      const url = newQueryString ? `${pathname}?${newQueryString}` : pathname
      router.replace(url, { scroll: false })
    }
  }, [pathname, router, searchParams])

  return {
    searchParams,
    updateQuery
  }
}