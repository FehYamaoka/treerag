const features = [
  { icon: '🌳', title: 'Árvore de Skills', desc: 'Visualize e simule qualquer combinação de habilidades' },
  { icon: '🗡️', title: 'Calcule Stats', desc: 'ATK, MATK, ASPD, HIT, FLEE e muito mais' },
  { icon: '👥', title: 'Comunidade', desc: 'Salve e compartilhe builds com outros jogadores' },
]

export function FeaturesSection() {
  return (
    <section className="py-10 px-4" style={{ background: '#0a0a0f', borderBottom: '1px solid #1a1a0a' }}>
      <p className="text-center text-xs tracking-[0.4em] uppercase mb-8" style={{ color: '#d4a017' }}>
        O que é o RagTree
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {features.map(f => (
          <div
            key={f.title}
            className="text-center p-5"
            style={{ background: '#0d110a', border: '1px solid #1f2a0f' }}
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <p className="text-sm font-bold mb-2" style={{ color: '#f5e6a3' }}>{f.title}</p>
            <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
