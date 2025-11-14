import Starlights from '@StarlightsTeam/Scraper'
import fetch from 'node-fetch' 

let limit = 300 // MB máximo permitido

let handler = async (m, { conn, args, usedPrefix, command }) => {

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `[ ✰ ] Ingresa un enlace de YouTube.\n\nEjemplo:\n> *${usedPrefix + command}* https://youtu.be/QSvaCSt8ixs`,
      m
    )
  }

  await m.react('🕓')

  try {

    let result = await Starlights.ytmp4(args[0])
    if (!result) throw `No se pudo obtener el video.`

    let { title, size, quality, thumbnail, dl_url } = result

    //----------- MANEJO SEGURO DEL TAMAÑO -----------//
    let sizeMB = 0
    if (size) {
      let clean = size.replace(/[^\d.]/g, "") // sólo números
      sizeMB = parseFloat(clean)
    }

    if (sizeMB >= limit) {
      await m.react('✖️')
      return conn.reply(
        m.chat,
        `🚫 Este archivo pesa **${size}**, supera el límite de ${limit} MB.`,
        m
      )
    }

    //----------- MINIATURA SEGURA -----------//
    let img = null
    if (thumbnail) {
      try {
        img = await (await fetch(thumbnail)).buffer()
      } catch {}
    }

    //----------- VALIDAR URL DE DESCARGA -----------//
    if (!dl_url) {
      await m.react('✖️')
      return conn.reply(
        m.chat,
        `❌ No pude obtener el enlace de descarga del video.`,
        m
      )
    }

    //----------- TEXTO -----------//
    let txt = '`乂  Y O U T U B E  -  M P 4  D O C`\n\n'
    txt += `✩ *Título:* ${title}\n`
    txt += `✩ *Calidad:* ${quality}\n`
    txt += `✩ *Tamaño:* ${size}\n\n`
    txt += `> ↻ *Enviando documento... espera un momento.*`

    // Enviar thumbnail o mensaje simple
    if (img) {
      await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m)
    } else {
      await conn.reply(m.chat, txt, m)
    }

    //----------- ENVÍO DEL DOCUMENTO -----------//
    await conn.sendMessage(
      m.chat,
      {
        document: { url: dl_url },
        caption: '',
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      },
      { quoted: m }
    )

    await m.react('✅')

  } catch (err) {
    console.error(err)
    await m.react('✖️')
    conn.reply(m.chat, `❌ Ocurrió un error al procesar el video.`, m)
  }
}

handler.help = ['ytmp4doc *<link yt>*']
handler.tags = ['downloader']
handler.command = ['ytmp4doc', 'ytvdoc', 'ytdoc']
handler.register = true

export default handler
