#!/usr/bin/env node
// Translates messages/en.json to target languages via DeepL API

const fs = require('fs')
const path = require('path')

const DEEPL_KEY = process.env.DEEPL_API_KEY || ''
const DEEPL_URL = 'https://api-free.deepl.com/v2/translate'
const MESSAGES_DIR = path.join(__dirname, '..', 'messages')

const TARGETS = [
  { file: 'fr.json', lang: 'FR',    formality: 'prefer_less' },
  { file: 'de.json', lang: 'DE',    formality: 'prefer_less' },
  { file: 'es.json', lang: 'ES',    formality: 'prefer_less' },
  { file: 'pt.json', lang: 'PT-BR', formality: 'prefer_less' },
  { file: 'nl.json', lang: 'NL',    formality: 'prefer_less' },
  { file: 'pl.json', lang: 'PL',    formality: 'prefer_less' },
  { file: 'ja.json', lang: 'JA',    formality: null },
]

// Flatten nested JSON to [{path, value}]
function flatten(obj, prefix = '') {
  const out = []
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') {
      out.push({ path: p, value: v })
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === 'string') out.push({ path: `${p}.${i}`, value: item })
      })
    } else if (v && typeof v === 'object') {
      out.push(...flatten(v, p))
    }
  }
  return out
}

// Set a value in a deep-cloned object by dot-path (arrays already in place)
function setByPath(obj, pathStr, val) {
  const parts = pathStr.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
  cur[parts[parts.length - 1]] = val
}

// Replace brand name and {placeholders} with numbered tokens DeepL won't translate
function protect(text) {
  const tokens = []
  const result = text
    .replace(/VaultTransfer/g, () => { const i = tokens.length; tokens.push('VaultTransfer'); return `[VT${i}]` })
    .replace(/\{[^}]+\}/g, m  => { const i = tokens.length; tokens.push(m);              return `[VT${i}]` })
  return { result, tokens }
}

function unprotect(text, tokens) {
  return text.replace(/\[VT(\d+)\]/g, (_, i) => tokens[parseInt(i)] ?? '')
}

async function callDeepL(texts, targetLang, formality) {
  const body = new URLSearchParams()
  body.append('target_lang', targetLang)
  if (formality) body.append('formality', formality)
  texts.forEach(t => body.append('text', t))

  const res = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepL ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.translations.map(t => t.text)
}

async function translateAll(entries, lang, formality) {
  // Only send strings that contain actual translatable words
  const translatable = entries.filter(e => /[a-zA-Z]{2,}/.test(e.value))
  const passthrough  = entries.filter(e => !/[a-zA-Z]{2,}/.test(e.value))

  const protectedData = translatable.map(e => protect(e.value))
  const protectedTexts = protectedData.map(p => p.result)

  const BATCH = 50
  const translated = []
  for (let i = 0; i < protectedTexts.length; i += BATCH) {
    const batch = protectedTexts.slice(i, i + BATCH)
    const batchNum = Math.floor(i / BATCH) + 1
    const total    = Math.ceil(protectedTexts.length / BATCH)
    process.stdout.write(`  batch ${batchNum}/${total} (${batch.length} strings)... `)
    const results = await callDeepL(batch, lang, formality)
    translated.push(...results)
    console.log('ok')
    if (i + BATCH < protectedTexts.length) await new Promise(r => setTimeout(r, 300))
  }

  const map = {}
  translatable.forEach((e, i) => { map[e.path] = unprotect(translated[i], protectedData[i].tokens) })
  passthrough.forEach(e  => { map[e.path] = e.value })
  return map
}

async function main() {
  if (!DEEPL_KEY) { console.error('DEEPL_API_KEY not set'); process.exit(1) }

  const enSource = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, 'en.json'), 'utf8'))
  const entries  = flatten(enSource)
  const enKeys   = entries.map(e => e.path)
  console.log(`Loaded ${entries.length} strings from en.json\n`)

  for (const { file, lang, formality } of TARGETS) {
    console.log(`▶  ${lang}  →  ${file}`)
    const map = await translateAll(entries, lang, formality)

    const output = JSON.parse(JSON.stringify(enSource)) // preserve structure
    for (const e of entries) {
      if (map[e.path] !== undefined) setByPath(output, e.path, map[e.path])
    }

    fs.writeFileSync(path.join(MESSAGES_DIR, file), JSON.stringify(output, null, 2) + '\n', 'utf8')
    console.log(`  ✓ written\n`)
  }

  // Validate
  console.log('─'.repeat(50))
  console.log('Validating keys...')
  let allOk = true
  for (const { file } of TARGETS) {
    const data    = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, file), 'utf8'))
    const fileKeys = new Set(flatten(data).map(e => e.path))
    const missing  = enKeys.filter(k => !fileKeys.has(k))
    if (missing.length) {
      console.error(`  ❌  ${file}: ${missing.length} missing keys`)
      missing.forEach(k => console.error(`      ${k}`))
      allOk = false
    } else {
      console.log(`  ✓  ${file}`)
    }
  }
  if (allOk) console.log('\n✅  All validations passed!')
  else { console.error('\n❌  Some files have missing keys'); process.exit(1) }
}

main().catch(e => { console.error(e); process.exit(1) })
