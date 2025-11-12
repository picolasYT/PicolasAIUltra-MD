let handler = async (m, { conn }) => {

let img = 'https://files.catbox.moe/hro1e1.gif' // GIF oficial PicolasAIUltra-MD

let txt = `*¡Hola! Te invito a unirte a los grupos oficiales del bot y ser parte de la comunidad ⭐*

1- ☆ {PicolasAIUltra-MD} ☆  — Grupo I
*✰* ${global.group}

2- ☆ {PicolasAIUltra-MD} ☆  — Grupo II
*✰* ${global.group2}

3- ☆ {PicolasAIUltra-MD} ☆  — Grupo III
*✰* ${global.group3}

*─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ*

📣 *¿Los enlaces no funcionan? Entra aquí:*

Canal oficial:
*✰* ${global.canal}

> ☆ {ℙ𝕚𝕔𝕠𝕝𝕒𝕤𝔸𝕀𝐮𝐥𝐭𝐫𝐚-𝐌𝐃} ☆  
> ${global.textbot}
`

// 🔥 Enviar GIF como video para que funcione en celular
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

}

handler.help = ['grupos']
handler.tags = ['main']
handler.command = /^(grupos)$/i

export default handler
