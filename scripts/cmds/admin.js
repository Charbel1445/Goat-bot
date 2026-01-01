const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "1.6",
		author: "Master Charbel",
		countDown: 5,
		role: 2,
		description: {
			vi: "Thêm, xóa, sửa quyền admin",
			en: "Gérer la hiérarchie des Goules (Admins)"
		},
		category: "box chat",
		guide: {
			en: '   {pn} [add | -a] <uid | @tag>: Élever au rang de Goule Supérieure'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Déchoir un Admin de son rang'
				+ '\n	  {pn} [list | -l]: Voir les Maîtres de l\'Anteiku'
		}
	},

	langs: {
		en: {
			added: "🩸 | **ÉLÉVATION DE RANG**\n━━━━━━━━━━━━━━━━━━━\nL'autorité a été accordée à %1 membre(s) :\n%2\n\n✨ *Kaneki : 'Leur force appartient désormais à l'organisation.'*",
			alreadyAdmin: "\n⚠️ | %1 membre(s) possèdent déjà des Cellules RC de classe Admin :\n%2",
			missingIdAdd: "❌ | **ERREUR**\nQui doit rejoindre le sommet ? Identifiez une cible ou entrez un UID.",
			removed: "💀 | **RÉVOCATION**\n━━━━━━━━━━━━━━━━━━━\nLe grade de %1 membre(s) a été réduit en poussière :\n%2\n\n👁️ *'Tu n'es plus qu'une proie.'*",
			notAdmin: "⚠️ | %1 membre(s) ne font pas partie de l'élite :\n%2",
			missingIdRemove: "❌ | **ERREUR**\nQui doit être banni de la hiérarchie ?",
			listAdmin: "👑 | **CONSEIL DES GOULES (Rang SSS)**\n━━━━━━━━━━━━━━━━━━━\nVoici les maîtres de ce monde :\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		switch (args[0]) {
			case "add":
			case "-a": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					config.adminBot.push(...notAdminIds);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdAdd"));
			}
			case "remove":
			case "-r": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions); // Correction ici pour accepter plusieurs tags
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					for (const uid of adminIds)
						config.adminBot.splice(config.adminBot.indexOf(uid), 1);
					const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdRemove"));
			}
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
			}
			default:
				return message.SyntaxError();
		}
	}
};
