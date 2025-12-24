const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ 🧩 | 𝐊𝐄𝐍 𝐊𝐀𝐍𝐄𝐊𝐈 | 🧩 ]";

module.exports = {
    config: {
        name: "help",
        version: "1.25", 
        author: "𝑹𝒊𝒏𝒏𝒈𝒂𝒏 (Corrigé par Gemini)",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "Affiche la liste des commandes par page.",
        },
        longDescription: {
            en: "Affiche les commandes disponibles. Utilisez 'help4 2' pour voir la suite.",
        },
        category: "info",
        guide: {
            en: "{pn} : Page 1\n{pn} 2 : Page 2\n{pn} <nom_commande> : Détails",
        },
        priority: 1,
    },
    onStart: async function ({ message, args, event, threadsData, role }) {
        const { threadID } = event;
        const prefix = getPrefix(threadID);

        const roleTextToString = (role) => {
            switch (role) {
                case 0: return "0 (Tous)";
                case 1: return "1 (Admin Groupe)";
                case 2: return "2 (Admin Bot)";
                default: return "Inconnu";
            }
        };

        // --- Logique d'affichage de la liste ---
        if (args.length === 0 || args[0] === "1" || args[0] === "2") {
            const page = (args[0] === "2") ? 2 : 1;
            const categories = {};
            const availableCommands = [];

            // Filtrer les commandes par rôle
            for (const [name, value] of commands) {
                if (value.config.role <= role) {
                    availableCommands.push(name);
                    const category = value.config.category || "Autres";
                    categories[category] = categories[category] || { commands: [] };
                    categories[category].commands.push(name);
                }
            }

            const sortedCategories = Object.keys(categories).sort();
            const cutOffIndex = Math.ceil(sortedCategories.length / 2);
            
            // Sélection des catégories selon la page
            const categoriesToShow = (page === 1) 
                ? sortedCategories.slice(0, cutOffIndex) 
                : sortedCategories.slice(cutOffIndex);

            let msg = `\n╭─────── ☕ ───────╮\n   𝐊𝐄𝐍 𝐊𝐀𝐍𝐄𝐊𝐈 𝐇𝐄𝐋𝐏 (${page}/2) 👁️\n╰─────── ☕ ───────╯\n`;
            
            for (const category of categoriesToShow) {
                msg += `\n┌── 🩸 ── 『 ${category.toUpperCase()} 』`;
                const names = categories[category].commands.sort();
                for (let j = 0; j < names.length; j += 3) {
                    const lineCommands = names.slice(j, j + 3).map((item) => `•${item}`);
                    msg += `\n│ ${lineCommands.join(" | ")}`;
                }
                msg += `\n└──────────── 🕸️`;
            }

            if (page === 1) {
                msg += `\n\n📖 𝑻𝒂𝒑𝒆 [ ${prefix}help4 2 ] 𝒑𝒐𝒖𝒓 𝒍𝒂 𝒔𝒖𝒊𝒕𝒆...`;
            } else {
                msg += `\n\n📜 𝑭𝒊𝒏 𝒅𝒆 𝒍𝒂 𝒍𝒊𝒔𝒕𝒆. (${availableCommands.length} commandes)`;
            }

            msg += `\n☕ {%anteikugc} 𝑝𝑜𝑢𝑟 𝑙'𝐴𝑛𝑡𝑒𝑖𝑘𝑢`;

            return message.reply(msg);

        // --- Détails d'une commande spécifique ---
        } else {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || commands.get(aliases.get(commandName));

            if (!command) {
                return message.reply(`❌ La commande "${commandName}" n'existe pas dans ma mémoire de goule.`);
            }

            const configCommand = command.config;
            const usage = (configCommand.guide?.en || "Non disponible").replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name).replace(/{pn}/g, prefix + configCommand.name);
            
            const response = `
╭─── 𝙆𝘼𝙉𝙀𝙆𝙄-𝙄𝙉𝙁𝙊 ───⭓
│ 👁️ NOM : ${configCommand.name} 
├── 𝘿𝙀𝙏𝘼𝙄𝙇𝙎 
│ 📝 Description: ${configCommand.longDescription?.en || "..."} 
│ 🔗 Alias : ${configCommand.aliases ? configCommand.aliases.join(", ") : "Aucun"} 
│ 🎖️ Rôle: ${roleTextToString(configCommand.role)} 
│ ⏳ Attente: ${configCommand.countDown || 1}s 
├── 𝙐𝙏𝙄𝙇𝙄𝙎𝘼𝙏𝙄𝙊𝙉
│ ${usage} 
╰━━━━━━━ 🕸️`;

            return message.reply(response);
        }
    },
};
