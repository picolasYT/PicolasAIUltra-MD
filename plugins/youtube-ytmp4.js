import Starlights from '@StarlightsTeam/Scraper'
import fetch from 'node-fetch' 

let limit = 100 // MB máximo permitido

let handler = async (m, { conn, args, usedPrefix, command }) => {

  if (!args[0]) 
    return conn.reply(m.chat, `[ ✰ ] Ingresa un enlace de YouTube.\n\nEjemplo:\n> *${usedPrefix + command}* https://youtu.be/QSvaCSt8ixs`, m)

  await m.react('🕓')

  try {
    
    let result = await Starlights.ytmp4(args[0])
    if (!result) throw `No pude obtener el video.`

    let { title, size, quality, thumbnail, dl_url } = result

    // Manejo seguro de tamaño
    let sizeMB = 0
    if (size) {
      let clean = size.replace(/[^\d.]/g, "") // solo números
      sizeMB = parseFloat(clean)
    }

    if (sizeMB >= limit)
      return m.reply(`🚫 El archivo pesa **${size}**, supera el límite de ${limit} MB.`, m)
        .then(_ => m.react('✖️'))

    // Miniatura segura
    let img = null
    if (thumbnail) {
      try { img = await (await fetch(thumbnail)).buffer() } catch {}
    }

    let txt = '`乂  Y O U T U B E  -  M P 4`\n\n'
    txt += `✩ *Título:* ${title}\n`
    txt += `✩ *Calidad:* ${quality}\n`
    txt += `✩ *Tamaño:* ${size}\n\n`
    txt += `> ↻ *Enviando el video... espera un momento.*`

    if (img) {
      await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m)
    } else {
      await conn.reply(m.chat, txt, m)
    }

    await conn.sendMessage(
      m.chat,
      { video: { url: dl_url }, caption: `${title}`, mimetype: 'video/mp4', fileName: `${title}.mp4` },
      { quoted: m }
    )

    await m.react('✅')

  } catch (err) {
    console.error(err)
    await m.react('✖️')
    conn.reply(m.chat, `❌ Error al descargar el video.`, m)
  }
}

handler.help = ['ytmp4 *<link>*']
handler.tags = ['downloader']
handler.command = ['ytmp4', 'ytv', 'yt']
handler.register = true 

export default handler
