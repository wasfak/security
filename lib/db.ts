import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in .env.local'
  )
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache:
    | {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
      }
    | undefined
}

const cached = globalThis._mongooseCache ?? { conn: null, promise: null }
globalThis._mongooseCache = cached

type DohAnswer = { type: number; data: string }

async function dohQuery(name: string, type: string) {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { Accept: 'application/dns-json' } }
  )
  return res.json() as Promise<{ Answer?: DohAnswer[] }>
}

// Resolves mongodb+srv:// to a direct mongodb:// URI using Cloudflare DoH,
// bypassing broken local DNS that refuses SRV queries.
async function buildDirectUri(srvUri: string): Promise<string> {
  const url = new URL(srvUri)

  const srvData = await dohQuery(`_mongodb._tcp.${url.hostname}`, 'SRV')
  const hosts = (srvData.Answer ?? [])
    .filter(r => r.type === 33)
    .map(r => {
      const parts = r.data.trim().split(/\s+/)
      const port = parts[2]
      const target = parts[3].replace(/\.$/, '')
      return `${target}:${port}`
    })

  if (!hosts.length) throw new Error('DoH returned no SRV records')

  // TXT record carries authSource and replicaSet for Atlas
  let options = 'tls=true'
  try {
    const txtData = await dohQuery(url.hostname, 'TXT')
    const txt = txtData.Answer?.find(r => r.type === 16)
    if (txt) options = txt.data.replace(/"/g, '') + '&tls=true'
  } catch {
    // fall back to tls=true only
  }

  const appName = url.searchParams.get('appName')
  if (appName) options += `&appName=${encodeURIComponent(appName)}`

  const auth = url.username ? `${url.username}:${url.password}@` : ''
  return `mongodb://${auth}${hosts.join(',')}${url.pathname}?${options}`
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = MONGODB_URI!.startsWith('mongodb+srv://')
        ? await buildDirectUri(MONGODB_URI!)
        : MONGODB_URI!
      return mongoose.connect(uri, { bufferCommands: false })
    })()
  }

  cached.conn = await cached.promise
  return cached.conn
}
