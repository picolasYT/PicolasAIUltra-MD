import { promises as fs } from "fs"

let handler = async (m, { conn: parentw }) => {

  // 🔥 Identifica la persona a eliminar su subbot
  let who = m.mentionedJid && m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.fromMe
      ? parentw.user.jid
      : m.sender

  let uniqid = who.split('@')[0]

  try {
    // 🔥 Eliminar carpeta del sub-bot
    await fs.rmdir(`./serbot/${uniqid}`, { recursive: true, force: true })

    await parentw.sendMessage(
      m.chat,
      { text: '🚩 Sub-Bot eliminado correctamente.' },
      { quoted: m }
    )

  } catch (err) {
    if (err.code === 'ENOENT') {
      await parentw.sendMessage(
        m.chat,
        { text: "⚠️ No existe ninguna sesión activa para eliminar." },
        { quoted: m }
      )
    } else {
      await m.react('✖️')
    }
  }
}

handler.tags = ['serbot']
handler.help = ['delserbot', 'logout', 'deletesession']
handler.command = /^(deletesess?ion|eliminarsesion|borrarsesion|delsess?ion|cerrarsesion|delserbot|logout)$/i

export default handler
