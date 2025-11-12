let handler = async (m, { conn }) => {

  // 🔥 Si es el bot principal → NO permitir apagar
  if (global.conn.user.jid === conn.user.jid) {
    return m.reply("⚠️ No puedes apagar el Bot principal.")
  }

  // 🔥 Mensaje de despedida del Sub Bot
  await conn.sendMessage(
    m.chat,
    { text: "🔌 Sub-Bot desconectado.\nGracias por usar ☆ {PicolasAIUltra-MD} ☆" },
    { quoted: m }
  )

  try {
    conn.ws.close() // apagar subbot
  } catch {}

}

handler.help = ['stop']
handler.tags = ['serbot']
handler.command = ['stop', 'stopbot', 'stopbebot']
handler.owner = true

export default handler
