// scripts/translate-keys.mjs
// Traduce solo le chiavi mancanti nei file lingua esistenti
// Uso: node scripts/translate-keys.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const LANGUAGES = [
    { code: 'it', deepl: 'IT', name: 'Italiano' },
    { code: 'de', deepl: 'DE', name: 'Tedesco' },
    { code: 'fr', deepl: 'FR', name: 'Francese' },
    { code: 'es', deepl: 'ES', name: 'Spagnolo' },
    { code: 'pt', deepl: 'PT-PT', name: 'Portoghese' },
    { code: 'ja', deepl: 'JA', name: 'Giapponese' },
    { code: 'zh', deepl: 'ZH', name: 'Cinese' },
    { code: 'ar', deepl: 'AR', name: 'Arabo' },
]

function loadEnv() {
    const envPath = path.join(ROOT, '.env.local')
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIndex = trimmed.indexOf('=')
        if (eqIndex === -1) continue
        const key = trimmed.slice(0, eqIndex).trim()
        const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '')
        if (key === 'DEEPL_API_KEY') return value
    }
    console.error('❌ DEEPL_API_KEY non trovata'); process.exit(1)
}

const BASE_URL = 'https://api-free.deepl.com'
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function fetchWithRetry(url, options, retries = 5) {
    for (let i = 0; i < retries; i++) {
        const res = await fetch(url, options)
        if (res.status === 429) {
            const wait = (i + 1) * 3000
            console.log(`  ⏳ Rate limit, aspetto ${wait / 1000}s...`)
            await sleep(wait)
            continue
        }
        return res
    }
    throw new Error('Troppi tentativi falliti (429)')
}

// Trova le chiavi presenti in source ma non in target (ricorsivo)
function findMissingKeys(source, target, keyPath = '') {
    const missing = {}
    for (const [key, value] of Object.entries(source)) {
        const currentPath = keyPath ? `${keyPath}.${key}` : key
        if (!(key in target)) {
            missing[key] = value
        } else if (typeof value === 'object' && !Array.isArray(value) && typeof target[key] === 'object') {
            const nestedMissing = findMissingKeys(value, target[key], currentPath)
            if (Object.keys(nestedMissing).length > 0) {
                missing[key] = nestedMissing
            }
        }
    }
    return missing
}

// Estrai stringhe piatte da oggetto
function extractStrings(obj, keyPath = '', result = []) {
    if (Array.isArray(obj)) return result
    if (typeof obj === 'string') {
        result.push({ path: keyPath, value: obj })
        return result
    }
    if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
            extractStrings(value, keyPath ? `${keyPath}.${key}` : key, result)
        }
    }
    return result
}

function encodePlaceholders(text) {
    const vars = []
    const encoded = text.replace(/\{(\w+)\}/g, (match) => {
        vars.push(match)
        return `__V${vars.length - 1}__`
    })
    return { encoded, vars }
}

function decodePlaceholders(text, vars) {
    return text.replace(/__V(\d+)__/g, (_, idx) => vars[parseInt(idx)] ?? `__V${idx}__`)
}

async function translateBatch(strings, targetLang, apiKey) {
    const BATCH_SIZE = 50
    const results = []
    const prepared = strings.map(s => {
        const { encoded, vars } = encodePlaceholders(s.value)
        return { path: s.path, encoded, vars }
    })

    for (let i = 0; i < prepared.length; i += BATCH_SIZE) {
        const chunk = prepared.slice(i, i + BATCH_SIZE)
        const res = await fetchWithRetry(`${BASE_URL}/v2/translate`, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: chunk.map(t => t.encoded),
                source_lang: 'EN',
                target_lang: targetLang,
                preserve_formatting: true,
            }),
        })

        if (!res.ok) {
            const err = await res.text()
            throw new Error(`DeepL error ${res.status}: ${err}`)
        }

        const data = await res.json()
        for (let j = 0; j < chunk.length; j++) {
            results.push({
                path: chunk[j].path,
                translated: decodePlaceholders(data.translations[j].text, chunk[j].vars),
            })
        }

        if (i + BATCH_SIZE < prepared.length) await sleep(1000)
    }
    return results
}

// Merga le traduzioni nell'oggetto target
function mergeTranslations(target, missingObj, translations) {
    const map = {}
    for (const { path, translated } of translations) map[path] = translated

    function merge(targetNode, missingNode, keyPath = '') {
        for (const [key, value] of Object.entries(missingNode)) {
            const currentPath = keyPath ? `${keyPath}.${key}` : key
            if (typeof value === 'string') {
                targetNode[key] = map[currentPath] ?? value
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                if (!targetNode[key]) targetNode[key] = {}
                merge(targetNode[key], value, currentPath)
            } else {
                targetNode[key] = value
            }
        }
    }

    merge(target, missingObj)
    return target
}

async function main() {
    const apiKey = loadEnv()
    const messagesDir = path.join(ROOT, 'messages')
    const enJson = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8'))

    const usageRes = await fetch(`${BASE_URL}/v2/usage`, {
        headers: { 'Authorization': `DeepL-Auth-Key ${apiKey}` },
    })
    const usage = await usageRes.json()
    console.log(`\n📊 DeepL: ${usage.character_count.toLocaleString()} / ${usage.character_limit.toLocaleString()} caratteri usati\n`)

    for (const lang of LANGUAGES) {
        const outputPath = path.join(messagesDir, `${lang.code}.json`)
        const existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))

        const missing = findMissingKeys(enJson, existing)
        const missingStrings = extractStrings(missing)

        if (missingStrings.length === 0) {
            console.log(`✅ ${lang.name} — nessuna chiave mancante`)
            continue
        }

        console.log(`\n🌍 ${lang.name} — ${missingStrings.length} chiavi mancanti...`)

        try {
            const translations = await translateBatch(missingStrings, lang.deepl, apiKey)
            const updated = mergeTranslations(existing, missing, translations)
            fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2), 'utf-8')
            console.log(`✅ ${lang.name} aggiornato`)
            await sleep(1000)
        } catch (err) {
            console.error(`❌ Errore per ${lang.name}: ${err.message}`)
        }
    }

    console.log('\n🎉 Completato!\n')
}

main()
