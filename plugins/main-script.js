import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    // 📊 Información del repositorio (puedes cambiar la URL si querés que apunte al tuyo)
    let res = await fetch('https://api.github.com/repos/picolasYT/PicolasAIUltra-MD')
    let json = await res.json()

    // 🧾 Texto con la información
    let txt = '*`—  S C R I P T  〤  M A I N`*\n\n'
    txt += `*» Nombre* :: ${json.name}\n`
    txt += `*» Visitas* :: ${json.watchers_count}\n`
    txt += `*» Peso* :: ${(json.size / 1024).toFixed(2)} MB\n`
    txt += `*» Actualizado* :: ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`
    txt += `*» Url* :: ${json.html_url}\n`
    txt += `*» Forks* :: ${json.forks_count}\n`
    txt += `*» Stars* :: ${json.stargazers_count}\n\n`
    txt += `> ✩ *Powered by ☆ {ℙ𝕚𝕔𝕠𝕝𝕒𝕤𝔸𝕀𝐮𝐥𝐭𝐫𝐚-𝐌𝐃} ☆*`

    // 🖼️ GIF oficial del bot (de Catbox)
    let img = 'https://files.catbox.moe/hro1e1.gif'

    // 📩 Envío del mensaje con el GIF y el texto
    await conn.sendMessage(
      m.chat,
      {
        video: { url: img },
        caption: txt,
        gifPlayback: true,
        mentions: [m.sender]
      },
      { quoted: m }
    )

  } catch {
    await m.react('✖️')
  }
}

// 📜 Configuración del comando
handler.help = ['script']
handler.tags = ['main']
handler.command = ['script', 'sc']
handler.register = true

export default handler