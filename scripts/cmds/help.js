const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ 🧩 | 𝐊𝐄𝐍 𝐊𝐀𝐍𝐄𝐊𝐈 | 🧩 ]";

module.exports = {
    config: {
        name: "help",
        version: "1.21", 
        author: "𝑹𝒊𝒏𝒏𝒈𝒂𝒏 (Corrigé par Gemini)",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "Affiche l'aide et la liste des commandes du bot en deux pages.",
        },
        longDescription: {
            en: "Affiche une liste complète des commandes par catégorie sur deux messages et le détail d'utilisation d'une commande spécifique.",
        },
        category: "info",
        guide: {
            en: "{pn} : Liste de toutes les commandes (Page 1/2).\n{pn} <nom_commande> : Affiche les détails d'une commande.",
        },
        priority: 1,
    },
    onStart: async function ({ message, args, event, threadsData, role }) {
        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        const prefix = getPrefix(threadID);

        const roleTextToString = (role) => {
            switch (role) {
                case 0: return "0 (Tous les utilisateurs)";
                case 1: return "1 (Administrateurs de groupe)";
                case 2: return "2 (Administrateur du bot)";
                default: return "Rôle inconnu";
            }
        };

        if (args.length === 0) {
            const categories = {};
            const availableCommands = new Map();

            for (const [name, value] of commands) {
                if (value.config.role <= role) {
                    availableCommands.set(name, value);
                    const category = value.config.category || "Uncategorized";
                    categories[category] = categories[category] || { commands: [] };
                    categories[category].commands.push(name);
                }
            }

            const sortedCategories = Object.keys(categories).sort();
            const totalCategories = sortedCategories.length;
            const cutOffIndex = Math.ceil(totalCategories / 2);

            let msg1 = "";
            let msg2 = "";

            // --- Construction de la Page 1 (Thème Tokyo Ghoul) ---
            msg1 += `\n╭─────── ☕ ───────╮\n   𝐊𝐄𝐍 𝐊𝐀𝐍𝐄𝐊𝐈 𝐇𝐄𝐋𝐏 (𝟭/𝟮) 👁️\n╰─────── ☕ ───────╯\n`;
            
            for (let i = 0; i < cutOffIndex; i++) {
                const category = sortedCategories[i];
                if (categories[category].commands.length === 0) continue;
                
                msg1 += `\n┌── 🩸 ─── 『 ${category.toUpperCase()} 』`;
                
                const names = categories[category].commands.sort();
                for (let j = 0; j < names.length; j += 3) {
                    const lineCommands = names.slice(j, j + 3).map((item) => `•${item}`);
                    msg1 += `\n│ ${lineCommands.join(" | ")}`;
                }
                msg1 += `\n└──────────── 🕸️`;
            }

            // --- Construction de la Page 2 ---
            msg2 += `\n╭─────── ☕ ───────╮\n   𝐊𝐄𝐍 𝐊𝐀𝐍𝐄𝐊𝐈 𝐇𝐄𝐋𝐏 (𝟮/𝟮) 👁️\n╰─────── ☕ ───────╯\n`;
            
            for (let i = cutOffIndex; i < totalCategories; i++) {
                const category = sortedCategories[i];
                if (categories[category].commands.length === 0) continue;
                
                msg2 += `\n┌── 🩸 ─── 『 ${category.toUpperCase()} 』`;
                
                const names = categories[category].commands.sort();
                for (let j = 0; j < names.length; j += 3) {
                    const lineCommands = names.slice(j, j + 3).map((item) => `•${item}`);
                    msg2 += `\n│ ${lineCommands.join(" | ")}`;
                }
                msg2 += `\n└──────────── 🕸️`;
            }
            
            const totalCommands = availableCommands.size;
            const footer = `\n\n\n💀 𝑱'𝒂𝒊 ${totalCommands} 𝒄𝒂𝒑𝒂𝒄𝒊𝒕𝒆́𝒔 𝒅𝒆 𝒈𝒐𝒖𝒍𝒆`;
            const footer2 = `\n\n🗨️ 𝑻𝑨𝑷𝑬 ${prefix}𝗵𝗲𝗹𝗽4 + 𝒏𝒐𝒎 𝒑𝒐𝒖𝒓 𝒍𝒆𝒔 𝒅𝒆́𝒕𝒂𝒊𝒍𝒔`;
            const footer3 = `\n\n☕ {%anteikugc} 𝑝𝑜𝑢𝑟 𝑟𝑒𝑗𝑜𝑖𝑛𝑑𝑟𝑒 𝑙'𝐴𝑛𝑡𝑒𝑖𝑘𝑢`;
            const footer4 = `\n\n📜| 𝐂𝐞 𝐧'𝐞𝐬𝐭 𝐩𝐚𝐬 le monde qui est mauvais, c'est ce qu'il contient. Nous sommes tous des monstres.`;

            msg2 += footer + footer2 + footer3 + footer4;

            await message.reply(msg1);
            await message.send(msg2);

        } else {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || commands.get(aliases.get(commandName));

            if (!command) {
                await message.reply(`❌ Commande "${commandName}" introuvable.`);
            } else {
                const configCommand = command.config;
                const roleText = roleTextToString(configCommand.role);
                const author = configCommand.author || "Inconnu";
                const longDescription = configCommand.longDescription?.en || "Pas de description détaillée.";
                const guideBody = configCommand.guide?.en || "Pas de guide disponible.";
                
                const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);
                
                const response = `
╭─── 𝙆𝘼𝙉𝙀𝙆𝙄-𝙄𝙉𝙁𝙊 ───⭓
│ 👁️ NOM : ${configCommand.name} 
├── 𝘿𝙀𝙏𝘼𝙄𝙇𝙎 
│ 📝 Description: ${longDescription} 
│ 🔗 Alias : ${configCommand.aliases ? configCommand.aliases.join(", ") : "Aucun"} 
│ ☕ Groupe: %anteikugc 
│ 🧩 Version: ${configCommand.version || "1.0"} 
│ 🎖️ Rôle: ${roleText} 
│ ⏳ Attente: ${configCommand.countDown || 1}s 
│ ✍️ Auteur: ${author} 
├── 𝙐𝙏𝙄𝙇𝙄𝙎𝘼𝙏𝙄𝙊𝙉
│ ${usage} 
╰━━━━━━━ 🕸️`;

                await message.reply(response);
            }
        }
    },
};
