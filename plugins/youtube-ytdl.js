import { youtubedlv2, youtubedl } from '@bochilteam/scraper'
import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {

  if (!args[0]) 
    return conn.reply(m.chat, `🚩 *Ingresa un enlace de YouTube.*\n\nEjemplo:\n.ytdl https://youtu.be/xxxx`, m)

  await m.react('🕓')

  let url = args[0]
  let resolutions = ["144p", "240p", "360p", "480p", "720p", "1080p"]

  let yt
  try {
    yt = await youtubedl(url)
  } catch {
    yt = await youtubedlv2(url)
  }

  if (!yt || !yt.video) {
    await m.react('✖️')
    return m.reply("❌ No pude extraer información del video.")
  }

  let title = yt.title || "video"
  let thumbnail = yt.thumbnail || null
  let img = null

  if (thumbnail) {
    try {
      img = await (await fetch(thumbnail)).buffer()
    } catch (e) {}
  }

  // Selección automática de resolución disponible
  let downloadUrl = null
  let selectedResolution = null
  let size = "Desconocido"

  for (let res of resolutions.reverse()) {
    if (yt.video[res]) {
      selectedResolution = res
      size = yt.video[res].fileSizeH || "Desconocido"
      try {
        downloadUrl = await yt.video[res].download()
      } catch {}
      break
    }
  }

  if (!downloadUrl) {
    await m.react('✖️')
    return m.reply("❌ No pude generar un enlace de descarga.")
  }

  let txt = `*乂  Y O U T U B E  -  Y T D L*\n\n`
      txt += `✩ *Título* : ${title}\n`
      txt += `✩ *Tamaño* : ${size}\n`
      txt += `✩ *Calidad* : ${selectedResolution}\n\n`
      txt += `*- ↻ Enviando el archivo, espera...*`

  // Enviar info
  await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m).catch(() => {})

  // Enviar video
  await conn.sendFile(
      m.chat,
      downloadUrl,
      `${title}.mp4`,
      `🎋 *Título:* ${title}\n📁 *Calidad:* ${selectedResolution}`,
      m,
      false,
      { asDocument: false }
  )

  await m.react('✅')

}

handler.help = ['ytdl *<link yt>*']
handler.tags = ['downloader']
handler.command = /^ytdl|dlyt|youtubedl$/i
handler.premium = true

export default handler
