// princeapi — YouTube → mp3 link (inapitisha ombi kwa Nexray v1/ytmp3, inarudisha JSON ile ile)
// Njia: GET /downloader/v1/ytmp3?url=<youtube url>
// Env (hiari): UPSTREAM = anuani ya Nexray (default https://api.nexray.eu.cc)
const UPSTREAM = (process.env.UPSTREAM || 'https://api.nexray.eu.cc').replace(/\/$/, '')
const YT = /^https?:\/\/(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\//i

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const url = String((req.query && req.query.url) || '').trim()

  if (!url) {
    return res.status(200).json({ status: true, name: 'princeapi', usage: '/downloader/v1/ytmp3?url=<youtube url>' })
  }
  if (!YT.test(url)) {
    return res.status(400).json({ status: false, message: 'Only YouTube links are allowed' })
  }

  try {
    const r = await fetch(`${UPSTREAM}/downloader/v1/ytmp3?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      signal: AbortSignal.timeout(50000)
    })
    const text = await r.text()
    let data
    try { data = JSON.parse(text) } catch { data = null }
    if (!data) return res.status(502).json({ status: false, message: `Upstream returned non-JSON (HTTP ${r.status})` })

    // cache jibu la mafanikio kwa dakika 10 (wimbo ule ule hauombwi mara mbili)
    if (r.status < 400 && data.status !== false) {
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=60')
    }
    return res.status(r.status).json(data)
  } catch (e) {
    return res.status(504).json({ status: false, message: `Upstream error: ${e.message}` })
  }
}
