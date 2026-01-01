const axios = require("axios");

// Mémoire partagée par le groupe
if (!global.anteikuSharedChat) global.anteikuSharedChat = {};

module.exports = {
  config: {
    name: "ai",
    aliases: ["kaneki", "ask", "quiz"],
    version: "3.0",
    author: "Master Charbel (Style par Gemini)",
    countDown: 2,
    role: 0,
    shortDescription: { en: "IA avec mémoire de groupe et gain de points." },
    category: "intelligence",
    guide: { en: "{pn} <votre message>" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const prompt = args.join(" ");

    if (!prompt) return api.sendMessage("👁️ 𝑲𝒂𝒏𝒆𝒌𝒊 : Le silence règne à l'Anteiku... Tu veux lancer un quiz ou discuter ?", threadID, messageID);

    // Initialisation de la mémoire du groupe
    if (!global.anteikuSharedChat[threadID]) {
      global.anteikuSharedChat[threadID] = [];
    }

    // Récupération des données du joueur
    const userData = await usersData.get(senderID);
    const name = userData.name;

    // On ajoute le message à l'historique avec le nom du membre
    global.anteikuSharedChat[threadID].push({ role: "user", content: `${name}: ${prompt}` });

    if (global.anteikuSharedChat[threadID].length > 15) {
      global.anteikuSharedChat[threadID].shift();
    }

    try {
      api.setMessageReaction("☕", messageID, () => {}, true);

      const systemPrompt = `Tu es Ken Kaneki. Tu parles à tous les membres du groupe de Master Charbel.
      COMPORTEMENT :
      1. Tu es humain, protecteur et mélancolique.
      2. Si tu lances un quiz et que quelqu'un trouve la bonne réponse, tu DOIS inclure exactement le mot-clé "[WINNER]" dans ta réponse.
      3. Tu te souviens des questions posées juste avant.
      4. Si un membre gagne, félicite-le par son nom.`;

      const response = await axios.get(`https://api.kenliejugar.com/blackbox/?text=${encodeURIComponent(
        `System: ${systemPrompt}\n\nHistorique: ${JSON.stringify(global.anteikuSharedChat[threadID])}`
      )}`);

      let reply = response.data.response || "𝑱'𝒂𝒊 𝒖𝒏𝒆 𝒅𝒐𝒖𝒍𝒆𝒖𝒓 𝒂̀ 𝒍'𝒐𝒆𝒊𝒍... 𝑹𝒆𝒑𝒆̂𝒕𝒆 ?";

      // Système de récompense (Cellules RC)
      if (reply.includes("[WINNER]")) {
        reply = reply.replace("[WINNER]", "").trim();
        const pointsGagnes = Math.floor(Math.random() * (500 - 100 + 1)) + 100; // Entre 100 et 500 points
        
        // Ajout de l'argent/points via les données du bot
        await usersData.set(senderID, {
            money: (userData.money || 0) + pointsGagnes
        });

        reply += `\n\n🎁 **+${pointsGagnes} 𝐂𝐞𝐥𝐥𝐮𝐥𝐞𝐬 𝐑𝐂** ajoutées à ton stock, ${name} !`;
        api.setMessageReaction("🎭", messageID, () => {}, true);
      }

      global.anteikuSharedChat[threadID].push({ role: "assistant", content: reply });

      const finalMsg = 
        `╭─────── ☕ ───────╮\n` +
        `   👁️  𝐊𝐀𝐍𝐄𝐊𝐈-𝐀𝐈  👁️\n` +
        `╰─────── ☕ ───────╯\n\n` +
        `${reply}\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `👥 𝐀𝐧𝐭𝐞𝐢𝐤𝐮 𝐌𝐞𝐦𝐨𝐫𝐲 | 𝐌𝐚𝐬𝐭𝐞𝐫 𝐂𝐡𝐚𝐫𝐛𝐞𝐥`;

      return api.sendMessage(finalMsg, threadID, messageID);

    } catch (error) {
      return api.sendMessage("🛑 𝑲𝒂𝒏𝒆𝒌𝒊 : Erreur de connexion aux cellules RC.", threadID, messageID);
    }
  }
};
