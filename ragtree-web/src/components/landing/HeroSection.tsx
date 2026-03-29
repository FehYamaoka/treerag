export function HeroSection() {
  return (
    <section
      className="relative py-20 text-center"
      style={{ background: 'linear-gradient(180deg,#0a0a0f 0%,#0f1a0a 30%,#1a2800 60%,#0a0a0f 100%)', borderBottom: '3px solid #3d2e00' }}
    >
      <div className="text-xs tracking-widest mb-4" style={{ color: '#3d2e00' }}>
        {'▪'.repeat(48)}
      </div>
      <div className="text-2xl leading-none mb-[-20px] opacity-30 select-none">
        🌲🏔🌲🏰🌲🏔🌲🌲🏔🌲🏰🌲🏔🌲
      </div>
      <div className="relative z-10 px-4">
        <p className="text-xs tracking-[0.4em] mb-3 uppercase" style={{ color: '#d4a017' }}>
          Ragnarok Online LATAM
        </p>
        <h1
          className="text-5xl font-bold leading-tight mb-3"
          style={{ color: '#f5e6a3', textShadow: '0 0 40px #d4a01740' }}
        >
          Forge Your<br />Legend
        </h1>
        <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: '#8a9a7a' }}>
          Simule árvores de skills, monte builds e explore o universo de Midgard
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="/classes"
            className="px-6 py-2 text-sm font-bold tracking-wider uppercase transition-opacity hover:opacity-80"
            style={{ background: '#d4a017', color: '#0a0a0f' }}
          >
            ▶ Simular Build
          </a>
          <a
            href="/classes"
            className="px-6 py-2 text-sm tracking-wider uppercase transition-opacity hover:opacity-80"
            style={{ border: '1px solid #d4a017', color: '#d4a017' }}
          >
            Ver Classes
          </a>
        </div>
      </div>
      <div className="text-xs tracking-widest mt-8" style={{ color: '#3d2e00' }}>
        {'▪'.repeat(48)}
      </div>
    </section>
  )
}
