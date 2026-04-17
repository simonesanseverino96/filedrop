// Estensioni bloccate per sicurezza
export const BLOCKED_EXTENSIONS = [
  // Eseguibili Windows
  '.exe', '.msi', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.vbe',
  '.js', '.jse', '.wsf', '.wsh', '.msc', '.cpl', '.reg',
  // Eseguibili Linux/Mac
  '.sh', '.bash', '.zsh', '.run', '.bin', '.elf',
  // Script pericolosi
  '.ps1', '.psm1', '.psd1', '.ps1xml',
  // Macro Office pericolose
  '.xlsm', '.xltm', '.docm', '.dotm', '.pptm', '.potm',
  // Altri
  '.jar', '.apk', '.ipa', '.deb', '.rpm',
]

// Estensioni con avviso (permesse ma avvisano)
export const WARNED_EXTENSIONS = [
  '.zip', '.rar', '.7z', '.tar', '.gz',
]

export function isBlockedFile(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  return BLOCKED_EXTENSIONS.includes(ext)
}

export function isWarnedFile(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  return WARNED_EXTENSIONS.includes(ext)
}

export function getBlockedReason(filename: string): string | null {
  if (isBlockedFile(filename)) {
    return `Il file "${filename}" non è consentito per motivi di sicurezza. I file eseguibili non possono essere caricati.`
  }
  return null
}