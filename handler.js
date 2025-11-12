//=====================================================================
//   PICOLAS AIULTRA-MD — HANDLER.JS PERSONALIZADO (BLOQUE 1/4)
//=====================================================================

import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default

//-------------------------------------------------------------
//  DECORACIÓN GLOBAL
//-------------------------------------------------------------
global.picolasBrand = "☆ {ℙ𝕚𝕔𝕠𝕝𝕒𝕤𝔸𝕀𝐮𝐥𝐭𝐫𝐚-𝐌𝐃} ☆"

//-------------------------------------------------------------
//  TAG DE CONSOLA PERSONALIZADO
//-------------------------------------------------------------
function consoleTag(text) {
    console.log(chalk.hex("#12f2ff")(`[PicolasAIUltra-MD] ${text}`))
}

//-------------------------------------------------------------
//  VALIDADORES BASE
//-------------------------------------------------------------
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => new Promise(res => setTimeout(res, ms))

//-------------------------------------------------------------
//  FUNCIÓN PRINCIPAL
//-------------------------------------------------------------
export async function handler(chatUpdate) {

    this.msgqueque = this.msgqueque || []

    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    if (global.db.data == null) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return

        m.exp = 0
        m.limit = false

        //-------------------------------------------------------------
        //  REGISTRO AUTOMÁTICO DE USUARIOS
        //-------------------------------------------------------------
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}

            if (user) {
                if (!isNumber(user.exp)) user.exp = 0
                if (!isNumber(user.limit)) user.limit = 10
                if (!("premium" in user)) user.premium = false
                if (!("registered" in user)) user.registered = false
                if (!isNumber(user.age)) user.age = -1
                if (!isNumber(user.bank)) user.bank = 0
                if (!isNumber(user.level)) user.level = 0
                if (!isNumber(user.afk)) user.afk = -1
                if (!("afkReason" in user)) user.afkReason = ""
                if (!("banned" in user)) user.banned = false
            } else {
                global.db.data.users[m.sender] = {
                    exp: 0,
                    limit: 10,
                    registered: false,
                    name: m.name || "Usuario",
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: "",
                    banned: false,
                    premium: false,
                    bank: 0,
                    level: 0
                }
            }

            //---------------------------------------------------------
            //   CONFIGURACIÓN GLOBAL DE CHATS
            //---------------------------------------------------------
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}

            if (chat) {
                if (!("isBanned" in chat)) chat.isBanned = false
                if (!("bienvenida" in chat)) chat.bienvenida = true
                if (!("antiLink" in chat)) chat.antiLink = false
                if (!("nsfw" in chat)) chat.nsfw = false
                if (!isNumber(chat.expired)) chat.expired = 0
            } else {
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    bienvenida: true,
                    antiLink: false,
                    nsfw: false,
                    expired: 0
                }
            }

            //---------------------------------------------------------
            //   CONFIGURACIÓN DEL SISTEMA
            //---------------------------------------------------------
            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object')
                global.db.data.settings[this.user.jid] = {}

            if (settings) {
                if (!("self" in settings)) settings.self = false
                if (!("autoread" in settings)) settings.autoread = false
            } else {
                global.db.data.settings[this.user.jid] = {
                    self: false,
                    autoread: false,
                    status: 0
                }
            }

        } catch (e) {
            consoleTag("ERROR en sistema de usuarios: " + e)
        }

        //-------------------------------------------------------------
        //   FILTROS GENERALES
        //-------------------------------------------------------------
        if (!m.fromMe && opts['self']) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return

        if (typeof m.text !== "string") m.text = ""

        consoleTag(`Mensaje recibido de ${m.sender}`)

        //-------------------------------------------------------------
        //   SISTEMA DE GANANCIA POR MENSAJE
        //-------------------------------------------------------------
        m.exp += Math.ceil(Math.random() * 10)

        //-------------------------------------------------------------
        //  SISTEMA DE PERMISOS (OWNER / ADMIN / PREMIUM)
        //-------------------------------------------------------------
        let _user = global.db.data?.users?.[m.sender]

        const isROwner = [
            conn.decodeJid(global.conn.user.id),
            ...global.owner.map(([n]) => n)
        ].map(v => v.replace(/[^0-9]/g, '') + "@s.whatsapp.net")
         .includes(m.sender)

        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods
            .map(v => v.replace(/[^0-9]/g, '') + "@s.whatsapp.net")
            .includes(m.sender)
        const isPrems = isOwner || global.prems
            .map(v => v.replace(/[^0-9]/g, '') + "@s.whatsapp.net")
            .includes(m.sender) || _user.premium === true

        //-------------------------------------------------------------
        //   SISTEMA DE SPAM (OPCIONAL)
        //-------------------------------------------------------------
        if (opts["queque"] && m.text && !(isMods || isPrems)) {
            let queue = this.msgqueque
            const lastID = queue[queue.length - 1]
            queue.push(m.key.id)

            setInterval(async () => {
                if (queue.indexOf(lastID) === -1) clearInterval(this)
                await delay(800)
            }, 800)
        }

        // Evita que responda mensajes de Baileys
        if (m.isBaileys) return

        //-------------------------------------------------------------
        //  OBTENER METADATOS DE GRUPOS
        //-------------------------------------------------------------
        const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat).catch(_ => null) : {}
        const participants = groupMetadata?.participants || []

        const user = participants.find(u => u.id === m.sender) || {}
        const bot = participants.find(u => u.id === this.user.jid) || {}

        const isRAdmin = user.admin === "superadmin"
        const isAdmin = isRAdmin || user.admin === "admin"
        const isBotAdmin = bot.admin === "admin" || bot.admin === "superadmin"

        //-------------------------------------------------------------
        //  PROCESAR PREFIJOS Y COMANDOS
        //-------------------------------------------------------------
        let usedPrefix

        const __dirname = path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            "./plugins"
        )

        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue
            if (plugin.disabled) continue

            const __filename = join(__dirname, name)

            //---------------------------------------------------------
            //  PLUGIN ALL() SE EJECUTA EN TODOS LOS MENSAJES
            //---------------------------------------------------------
            if (typeof plugin.all === "function") {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __filename,
                        __dirname
                    })
                } catch (e) {
                    consoleTag("Error en plugin ALL: " + e)
                }
            }

            //---------------------------------------------------------
            //  PREFIJOS
            //---------------------------------------------------------
            const toRegex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")

            let prefix =
                plugin.customPrefix ||
                conn.prefix ||
                global.prefix

            let match = (
                prefix instanceof RegExp
                    ? [[prefix.exec(m.text), prefix]]
                    : Array.isArray(prefix)
                    ? prefix.map(p => {
                          let regex = p instanceof RegExp ? p : new RegExp(toRegex(p))
                          return [regex.exec(m.text), regex]
                      })
                    : typeof prefix === "string"
                    ? [[new RegExp(toRegex(prefix)).exec(m.text), new RegExp(toRegex(prefix))]]
                    : [[[], new RegExp()]]
            ).find(p => p[1])

            //---------------------------------------------------------
            //  BEFORE()
            //---------------------------------------------------------
            if (typeof plugin.before === "function") {
                let res = await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isAdmin,
                    isRAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname,
                    __filename
                })
                if (res) continue
            }

            //---------------------------------------------------------
            //  SI NO ES FUNCIÓN, SIGUIENTE
            //---------------------------------------------------------
            if (typeof plugin !== "function") continue

            //---------------------------------------------------------
            //  SI EL PREFIJO NO COINCIDE, SIGUIENTE
            //---------------------------------------------------------
            if (!(usedPrefix = (match[0] || "")[0])) continue

            //---------------------------------------------------------
            //  PROCESAR COMANDO
            //---------------------------------------------------------
            let noPrefix = m.text.replace(usedPrefix, "")
            let [command, ...args] = noPrefix.trim().split(/\s+/g)
            args = args || []
            let text = args.join(" ")

            command = (command || "").toLowerCase()

            const isCmd =
                plugin.command instanceof RegExp
                    ? plugin.command.test(command)
                    : Array.isArray(plugin.command)
                    ? plugin.command.some(cmd =>
                          cmd instanceof RegExp ? cmd.test(command) : cmd === command
                      )
                    : typeof plugin.command === "string"
                    ? plugin.command === command
                    : false

            if (!isCmd) continue

            m.plugin = name
            m.isCommand = true

            //---------------------------------------------------------
            //  FILTROS DE BANEOS Y RESTRICCIONES
            //---------------------------------------------------------
            if (global.db.data.chats[m.chat]?.isBanned) return
            if (global.db.data.users[m.sender]?.banned) return

            //---------------------------------------------------------
            //  RESTRICCIONES ESPECÍFICAS
            //---------------------------------------------------------
            let fail = plugin.fail || global.dfail

            if (plugin.rowner && !isROwner) return fail("rowner", m, this, usedPrefix)
            if (plugin.owner && !isOwner) return fail("owner", m, this, usedPrefix)
            if (plugin.mods && !isMods) return fail("mods", m, this, usedPrefix)
            if (plugin.premium && !isPrems) return fail("premium", m, this, usedPrefix)
            if (plugin.group && !m.isGroup) return fail("group", m, this, usedPrefix)
            if (plugin.private && m.isGroup) return fail("private", m, this, usedPrefix)
            if (plugin.botAdmin && !isBotAdmin) return fail("botAdmin", m, this, usedPrefix)
            if (plugin.admin && !isAdmin) return fail("admin", m, this, usedPrefix)
            if (plugin.register && !_user.registered)
                return fail("unreg", m, this, usedPrefix)

            //---------------------------------------------------------
            //  EJECUCIÓN DEL COMANDO
            //---------------------------------------------------------
            m.exp += plugin.exp ? plugin.exp : 17

            try {
                await plugin.call(this, m, {
                    match,
                    usedPrefix,
                    noPrefix,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isAdmin,
                    isRAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname,
                    __filename
                })
            } catch (e) {
                m.error = e
                consoleTag("ERROR EJECUTANDO PLUGIN: " + e)
                m.reply(
                    String(e)
                        .replace(/Bot|bot/gi, "PicolasAIUltra-MD")
                )
            }

            break
        } // FIN DEL FOR DE PLUGINS

        //-------------------------------------------------------------
        //  SISTEMA DE LÍMITES (ESTRELLAS)
        //-------------------------------------------------------------
        if (!isPrems && plugin.limit) {
            let userLimit = global.db.data.users[m.sender].limit
            if (userLimit < plugin.limit) {
                return this.reply(
                    m.chat,
                    `⚠️ *No te quedan Estrellas ⭐*\n` +
                    `Compra más o espera el reinicio diario.\n\n` +
                    `${global.picolasBrand}`,
                    m
                )
            }
            global.db.data.users[m.sender].limit -= plugin.limit
            this.reply(
                m.chat,
                `✨ Usaste *${plugin.limit}* Estrella(s) ⭐\n${global.picolasBrand}`,
                m
            )
        }

        //-------------------------------------------------------------
        //  AFTER() — SE EJECUTA LUEGO DE TODOS LOS COMANDOS
        //-------------------------------------------------------------
        if (typeof plugin.after === "function") {
            try {
                await plugin.after.call(this, m, {
                    conn: this,
                    args,
                    command
                })
            } catch (e) {
                consoleTag("Error AFTER: " + e)
            }
        }

    } catch (e) {
        consoleTag("ERROR GENERAL EN HANDLER: " + e)
    } finally {
        //-------------------------------------------------------------
        //  LIBERAR COLA DE MENSAJES
        //-------------------------------------------------------------
        if (opts["queque"] && m.text) {
            const idx = this.msgqueque.indexOf(m.id || m.key.id)
            if (idx !== -1) this.msgqueque.splice(idx, 1)
        }

        //-------------------------------------------------------------
        //  AÑADIR EXP, LÍMITES, LOGS
        //-------------------------------------------------------------
        if (m) {
            let usuario = global.db.data.users[m.sender]
            if (usuario) {
                usuario.exp += m.exp
                usuario.limit -= m.limit * 1
            }
        }

        //-------------------------------------------------------------
        //  TAG DE CONSOLA BONITO
        //-------------------------------------------------------------
        consoleTag(`Plugin ejecutado: ${m.plugin || "mensaje normal"}`)

        //-------------------------------------------------------------
        //  AUTOREAD GLOBAL
        //-------------------------------------------------------------
        const settingsREAD = global.db.data.settings[this.user.jid] || {}
        if (opts["autoread"]) await this.readMessages([m.key])
        if (settingsREAD.autoread) await this.readMessages([m.key])
    }

    //-------------------------------------------------------------
    //  FIRMA AUTOMÁTICA EN TODAS LAS RESPUESTAS
    //-------------------------------------------------------------
    const originalReply = this.reply
    this.reply = function (jid, text, quoted, options = {}) {
        try {
            let finalText = text

            // Reemplazo automático de "bot" → tu marca
            finalText = finalText.replace(/bot|Bot|BOT/gi, "PicolasAIUltra-MD")

            // Firma automática
            finalText += `\n\n> ${global.picolasBrand}`

            return originalReply.call(this, jid, finalText, quoted, options)
        } catch (e) {
            consoleTag("Error enviando mensaje decorado: " + e)
            return originalReply.call(this, jid, text, quoted, options)
        }
    }

} // FIN DEL HANDLER PRINCIPAL

//=====================================================================
//   SISTEMA DE ERRORES PERSONALIZADOS — PICOLAS AIULTRA-MD
//=====================================================================

global.dfail = (type, m, conn, usedPrefix) => {

    const errors = {
        rowner: `⚠️ *Solo el Creador Oficial de PicolasAIUltra-MD puede usar este comando.*`,
        owner: `⚠️ *Solo el Creador o SubBots autorizados pueden usar este comando.*`,
        mods: `⚠️ *Solo los Moderadores de PicolasAIUltra-MD pueden ejecutar este comando.*`,
        premium: `⚠️ *Este comando es exclusivo para usuarios Premium.*`,
        group: `⚠️ *Este comando solo puede usarse en Grupos.*`,
        private: `⚠️ *Este comando solo puede usarse en el Chat Privado.*`,
        admin: `⚠️ *Este comando requiere ser Administrador del Grupo.*`,
        botAdmin: `⚠️ *PicolasAIUltra-MD necesita ser Administrador para ejecutar este comando.*`,
        unreg: `⚠️ *Debes estar Registrado para usar este comando.*\n\nUsa:\n*/reg nombre.edad*\n\nEjemplo:\n*/reg Luis.26*`,
        restrict: `⚠️ *Esta función está deshabilitada actualmente.*`
    }

    let msg = errors[type] || "❌ *Error desconocido.*"
    msg += `\n\n> ${global.picolasBrand}`

    return conn.reply(m.chat, msg, m)
}

//=====================================================================
//   AUTO-RELOAD DEL HANDLER AL MODIFICARLO (WATCHFILE)
//=====================================================================

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
    unwatchFile(file)
    console.log(chalk.greenBright("\n✨ Handler actualizado — PicolasAIUltra-MD ✨"))
    import(`${file}?update=${Date.now()}`)
})
