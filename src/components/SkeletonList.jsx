'use client'

export default function SkeletonList() {
  // Creem una matriu de 6 elements per simular la càrrega inicial
  const skeletons = Array(6).fill(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {skeletons.map((_, i) => (
        <div 
          key={i} 
          className="bg-card p-5 rounded-2xl border border-border h-[180px] flex flex-col justify-between"
        >
          <div>
            {/* Icona + Tipus */}
            <div className="flex items-center gap-2 mb-4">
               <div className="w-4 h-4 bg-muted/20 rounded-full" />
               <div className="w-16 h-2 bg-muted/20 rounded-full" />
            </div>
            
            {/* Títol (dues línies) */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-muted/20 rounded-full" />
              <div className="w-3/4 h-4 bg-muted/20 rounded-full" />
            </div>

            {/* Autor */}
            <div className="w-1/3 h-3 bg-muted/10 rounded-full mt-4" />
          </div>

          {/* Peu de la targeta */}
          <div className="mt-6 flex items-center justify-between">
            <div className="w-24 h-2 bg-muted/10 rounded-full" />
            <div className="w-5 h-5 bg-muted/10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}