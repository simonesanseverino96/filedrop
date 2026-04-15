export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 py-8 mt-4">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-sm font-600 text-paper">VaultTransfer</span>
        </div>
        <p className="text-xs text-muted font-body text-center">
          File eliminati automaticamente alla scadenza · Nessun tracciamento · Server in Europa
        </p>
        <p className="text-xs text-muted font-body">© 2024 VaultTransfer</p>
      </div>
    </footer>
  )
}