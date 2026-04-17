'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatBytes } from '@/lib/utils'
import { UploadConfig } from '@/types'
import UploadSuccess from './UploadSuccess'
import { supabase } from '@/lib/supabase'
import { isBlockedFile, getBlockedReason } from '@/lib/blocklist'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
import { v4 as uuidv4 } from 'uuid'

const MAX_SIZE = 2 * 1024 * 1024 * 1024
const MAX_FILES = 20

interface FileWithProgress {
  file: File
  id: string
  progress: number
  speed: number // bytes/sec
  timeLeft: number // seconds
  status: 'pending' | 'uploading' | 'done' | 'error'
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}min`
  return `${(seconds / 3600).toFixed(1)}h`
}

export default function UploadSection() {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [config, setConfig] = useState<UploadConfig>({
    expiry: '7', maxDownloads: null, password: '', message: '', senderEmail: '',
  })
  const [showOptions, setShowOptions] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [transferToken, setTransferToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const startTimeRef = useRef<Record<string, number>>({})

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) setError(`Alcuni file superano il limite di ${formatBytes(MAX_SIZE)}.`)
    // Blocca file pericolosi
    const blockedFiles = accepted.filter(f => isBlockedFile(f.name))
    if (blockedFiles.length > 0) {
      setError(getBlockedReason(blockedFiles[0].name) || 'File non consentito.')
      return
    }

    const newFiles = accepted.map(f => ({
      file: f, id: Math.random().toString(36).slice(2),
      progress: 0, speed: 0, timeLeft: 0, status: 'pending' as const,
    }))
    setFiles(prev => {
      const combined = [...prev, ...newFiles]
      if (combined.length > MAX_FILES) { setError(`Max ${MAX_FILES} file.`); return prev }
      return combined
    })
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxSize: MAX_SIZE })
  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0)

  const uploadFileWithProgress = (file: File, storagePath: string, fileId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      startTimeRef.current[fileId] = Date.now()

      const xhr = new XMLHttpRequest()

      // Ottieni l'URL di upload da Supabase
      supabase.storage.from('filedrop').createSignedUploadUrl(storagePath).then(({ data, error }) => {
        if (error || !data) { reject(error || new Error('No signed URL')); return }

        xhr.upload.addEventListener('progress', (e) => {
          if (!e.lengthComputable) return
          const progress = Math.round((e.loaded / e.total) * 100)
          const elapsed = (Date.now() - startTimeRef.current[fileId]) / 1000
          const speed = elapsed > 0 ? e.loaded / elapsed : 0
          const timeLeft = speed > 0 ? (e.total - e.loaded) / speed : 0

          setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, progress, speed, timeLeft, status: 'uploading' } : f
          ))
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setFiles(prev => prev.map(f =>
              f.id === fileId ? { ...f, progress: 100, speed: 0, timeLeft: 0, status: 'done' } : f
            ))
            resolve()
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error')))

        xhr.open('PUT', data.signedUrl)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
        xhr.send(file)
      })
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    setError(null)

    try {
      const transferId = uuidv4()

      // Caricamento parallelo di tutti i file contemporaneamente
      const uploadedFiles = await Promise.all(
        files.map(async ({ file, id }) => {
          const fileId = uuidv4()
          const storagePath = `transfers/${transferId}/${fileId}_${file.name}`

          setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'uploading' } : f))

          await uploadFileWithProgress(file, storagePath, id)

          return {
            id: fileId, filename: file.name, size: file.size,
            mimeType: file.type || 'application/octet-stream', storagePath,
          }
        })
      )

      // Passa il token se l'utente è loggato
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token ?? null

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId, files: uploadedFiles, config, totalSize, accessToken }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nella creazione del trasferimento')
      }

      const data = await res.json()
      setTransferToken(data.token)
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'upload')
      setFiles(prev => prev.map(f => ({ ...f, status: f.status === 'done' ? 'done' : 'error' })))
    } finally {
      setIsUploading(false)
    }
  }

  if (transferToken) {
    return <UploadSuccess token={transferToken} config={config} files={files.map(f => f.file)} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-300 ${
          isDragActive ? 'border-accent bg-accent/5 drop-active' : 'border-white/10 bg-surface hover:border-accent/40 hover:bg-surface-2'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive ? 'bg-accent' : 'bg-surface-2'}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isDragActive ? '#0a0a0f' : '#00e5a0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
              <path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
            </svg>
          </div>
          <div>
            <p className="font-display text-lg font-600 text-paper mb-1">
              {isDragActive ? 'Rilascia i file qui' : 'Trascina i file qui'}
            </p>
            <p className="text-muted text-sm font-body">
              oppure <span className="text-accent underline underline-offset-2">sfoglia</span> dal tuo dispositivo · max 2GB · 20 file
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map(({ file, id, progress, speed, timeLeft, status }) => (
            <div key={id} className="stagger-item bg-surface border border-white/5 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-paper truncate font-body">{file.name}</p>
                  <p className="text-xs text-muted font-body">{formatBytes(file.size)}</p>
                </div>
                {status === 'done' && <span className="text-xs text-accent font-body flex-shrink-0">✓ Caricato</span>}
                {status === 'error' && <span className="text-xs text-red-400 font-body flex-shrink-0">✗ Errore</span>}
                {!isUploading && status === 'pending' && (
                  <button onClick={() => removeFile(id)} className="text-muted hover:text-paper transition-colors p-1 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {(status === 'uploading' || status === 'done') && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-display font-600 text-accent">{progress}%</span>
                      {status === 'uploading' && speed > 0 && (
                        <span className="text-xs text-muted font-body">{formatBytes(speed)}/s</span>
                      )}
                    </div>
                    {status === 'uploading' && timeLeft > 0 && (
                      <span className="text-xs text-muted font-body">
                        {formatTime(timeLeft)} rimanenti
                      </span>
                    )}
                    {status === 'done' && (
                      <span className="text-xs text-accent font-body">Completato</span>
                    )}
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${status === 'done' ? 'bg-accent' : 'progress-shimmer'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-between items-center px-1 pt-1 text-xs text-muted font-body">
            <span>{files.length} file{files.length !== 1 ? 's' : ''}</span>
            <span>{formatBytes(totalSize)} totali</span>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 text-sm text-muted hover:text-paper transition-colors font-body"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            Opzioni di sicurezza
          </button>

          {showOptions && (
            <div className="mt-3 bg-surface border border-white/5 rounded-xl p-5 space-y-4 animate-fade-up">
              <div>
                <label className="text-xs text-muted mb-2 block font-body">Scadenza link</label>
                <div className="flex gap-2">
                  {(['1', '7', '30'] as const).map(d => (
                    <button key={d} onClick={() => setConfig(c => ({ ...c, expiry: d }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-body transition-all ${config.expiry === d ? 'bg-accent text-ink font-500' : 'bg-surface-2 text-muted hover:text-paper border border-white/5'}`}>
                      {d === '1' ? '24 ore' : d === '7' ? '7 giorni' : '30 giorni'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-2 block font-body">Max download (opzionale)</label>
                <input type="number" min="1" max="100" placeholder="Illimitati"
                  value={config.maxDownloads ?? ''}
                  onChange={e => setConfig(c => ({ ...c, maxDownloads: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full bg-surface-2 border border-white/5 rounded-lg px-3 py-2 text-sm text-paper placeholder-muted font-body focus:outline-none focus:border-accent/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-muted mb-2 block font-body">Password protezione (opzionale)</label>
                <input type="password" placeholder="••••••••" value={config.password}
                  onChange={e => setConfig(c => ({ ...c, password: e.target.value }))}
                  className="w-full bg-surface-2 border border-white/5 rounded-lg px-3 py-2 text-sm text-paper placeholder-muted font-body focus:outline-none focus:border-accent/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-muted mb-2 block font-body">Messaggio per il destinatario</label>
                <textarea placeholder="Aggiungi un messaggio..." value={config.message} rows={2}
                  onChange={e => setConfig(c => ({ ...c, message: e.target.value }))}
                  className="w-full bg-surface-2 border border-white/5 rounded-lg px-3 py-2 text-sm text-paper placeholder-muted font-body focus:outline-none focus:border-accent/50 transition-colors resize-none" />
              </div>
              <div>
                <label className="text-xs text-muted mb-2 block font-body">La tua email (opzionale)</label>
                <input type="email" placeholder="tu@esempio.com" value={config.senderEmail}
                  onChange={e => setConfig(c => ({ ...c, senderEmail: e.target.value }))}
                  className="w-full bg-surface-2 border border-white/5 rounded-lg px-3 py-2 text-sm text-paper placeholder-muted font-body focus:outline-none focus:border-accent/50 transition-colors" />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-body">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <button onClick={handleUpload} disabled={isUploading}
          className={`mt-4 w-full py-4 rounded-xl font-display font-600 text-base transition-all duration-200 ${
            isUploading ? 'bg-accent/50 text-ink/50 cursor-not-allowed' : 'bg-accent text-ink hover:bg-accent-dim active:scale-[0.98] shadow-lg shadow-accent/20'
          }`}>
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
              Caricamento in corso...
            </span>
          ) : `Carica e genera link →`}
        </button>
      )}
    </div>
  )
}