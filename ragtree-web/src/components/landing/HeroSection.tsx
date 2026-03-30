export function HeroSection() {
  return (
    <section className="px-4 py-6 text-center" style={{ background: '#0a0a0f' }}>
      <p className="text-[10px] tracking-[0.5em] uppercase mb-2" style={{ color: '#d4a017' }}>
        Ragnarok Online LATAM
      </p>
      <h1 className="text-3xl font-bold mb-1" style={{ color: '#f5e6a3', textShadow: '0 0 30px #d4a01730' }}>
        RagTree
      </h1>
      <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: '#6a7a5a' }}>
        Simulador de builds completo — skills, equipamentos, cartas, refino e status
      </p>
      <div className="flex gap-2 justify-center">
        <a href="/classes" className="px-5 py-1.5 text-xs font-bold tracking-wider uppercase" style={{ background: '#d4a017', color: '#0a0a0f' }}>
          Simular Build
        </a>
        <a href="/classes" className="px-5 py-1.5 text-xs tracking-wider uppercase" style={{ border: '1px solid #3d2e00', color: '#d4a017' }}>
          Ver Classes
        </a>
      </div>
    </section>
  )
}
