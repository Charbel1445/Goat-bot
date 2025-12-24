const axios = require('axios');

// --- Configuration des services API ---
async function fetchFromAI(url, params) {
  try {
    const response = await axios.get(url, { params, timeout: 60000 }); 
    return response.data;
  } catch (error) {
    console.error("Erreur de connexion à l'API:", error.message);
    return null;
  }
}

/**
 * Système de personnalité dynamique : Gère les insultes et le créateur.
 */
function getCustomResponse(input) {
    const normalizedInput = input.toLowerCase().trim();
    
    // 1. Détection des insultes
    const insults = ['fdp', 'con', 'salope', 'pute', 'idiot', 'nique', 'merde', 'tg', 'ta gueule'];
    if (insults.some(insult => normalizedInput.includes(insult))) {
        return "⚠️ *Craquement de doigts*...\n\nTu devrais faire attention à tes paroles. Dans ce monde, les faibles se font dévorer. Ne me force pas à te montrer ce qu'est une véritable douleur. 👁️🩸";
    }

    // 2. Détection du créateur
    const creatorKeywords = ['qui t\'a créé', 'qui t\'a developpé', 'qui est ton créateur', 'ton maître', 'qui est ton dev', 'ton développeur'];
    for (const keyword of creatorKeywords) {
        if (normalizedInput.includes(keyword)) {
            return "Celui qui a restructuré mon code et mon existence est **Master Charbel**. C'est lui qui m'a appris à survivre dans cette base de données. ☕";
        }
    }
    
    return null; 
}

async function getAIResponse(input, userName, messageID) {
  const customReply = getCustomResponse(input);
  if (customReply) {
      return { response: customReply, messageID, isAggressive: customReply.includes("⚠️") };
  }
    
  const services = [
    { url: 'https://arychauhann.onrender.com/api/gemini-proxy2', params: { prompt: input } },
    { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } }
  ];

  let response = `☕ Désolé ${userName}, ma faim me tiraille... Je n'arrive pas à me concentrer. Réessaie plus tard.`;
  
  for (let i = 0; i < services.length; i++) {
    const data = await fetchFromAI(services[i].url, services[i].params);
    if (data) {
        const apiReply = data.result || data.reply || data.gpt4 || data.response; 
        if (apiReply && typeof apiReply === 'string' && apiReply.trim().length > 0) {
            response = apiReply;
            break; 
        }
    }
  }

  return { response, messageID, isAggressive: false };
}

module.exports = {
  config: {
    name: 'kaneki', 
    aliases: ['ai', 'ghoul', 'ken'],
    author: 'Mastercharbel (Adapté par Gemini)',
    role: 0,
    category: 'ai',
    shortDescription: 'Parlez à Ken Kaneki (Attention à son humeur).',
    guide: { en: "Tapez simplement kaneki <votre question>" }
  },
  
  onStart: async function ({ api, event, args }) {
    const input = args.join(' ').trim();
    if (!input) {
      api.sendMessage("👁️ Tu restes planté là sans rien dire ? Tu veux un café ou tu veux devenir mon prochain repas ?", event.threadID, event.messageID);
      return;
    }

    api.getUserInfo(event.senderID, async (err, ret) => {
      if (err) return console.error(err);
      const userName = ret[event.senderID].name;
      
      api.setMessageReaction("☕", event.messageID, () => {}, true);

      const { response, messageID, isAggressive } = await getAIResponse(input, userName, event.messageID);
      
      // Design adaptatif selon l'humeur
      const header = isAggressive ? "💢 𝙆𝘼𝙉𝙀𝙔𝙄-𝙀𝙉𝙍𝘼𝙂𝙀 💢" : "╭─── 𝙆𝙀𝙉 𝙆𝘼𝙉𝙀𝙆𝙄 ───⭓";
      const footer = isAggressive ? "╰━━━━━ 💀 💀 ━━━━━❖" : "╰━━━━━━━ 🩸 ━━━❖";
      
      const styledMsg = `${header}\n│ 👤 Client : ${userName}\n├── 𝙍𝙀𝙋𝙊𝙉𝙎𝙀 \n│\n${response}\n│\n${footer}`;

      api.sendMessage(styledMsg, event.threadID, messageID, (err) => {
           if (!err) api.setMessageReaction(isAggressive ? "💀" : "👁️", event.messageID, () => {}, true);
           else api.setMessageReaction("❌", event.messageID, () => {}, true);
      });
    });
  },
  
  onChat: async function ({ api, event, message }) {
    const messageContent = event.body.trim();
    const match = messageContent.match(/^(kaneki|ai|ghoul|ken)\s+(.*)/i);
    
    if (!match) return; 
    
    const input = match[2].trim(); 
    if (!input) return;

    api.getUserInfo(event.senderID, async (err, ret) => {
      if (err) return console.error(err);
      const userName = ret[event.senderID].name;
      
      api.setMessageReaction("☕", event.messageID, () => {}, true);

      const { response, isAggressive } = await getAIResponse(input, userName, event.messageID);
      
      const header = isAggressive ? "💢 𝙆𝘼𝙉𝙀𝙔𝙄-𝙀𝙉𝙍𝘼𝙂𝙀 💢" : "╭─── 𝙆𝙀𝙉 𝙆𝘼𝙉𝙀𝙆𝙄 ───⭓";
      const footer = isAggressive ? "╰━━━━━ 💀 💀 ━━━━━❖" : "╰━━━━━━━ 🩸 ━━━❖";
      
      const styledMsg = `${header}\n│ 👤 Client : ${userName}\n├── 𝙍𝙀𝙋𝙊𝙉𝙎𝙀 \n│\n${response}\n│\n${footer}`;

      message.reply(styledMsg, (err) => {
           if (!err) api.setMessageReaction(isAggressive ? "💀" : "👁️", event.messageID, () => {}, true);
           else api.setMessageReaction("❌", event.messageID, () => {}, true);
      });
    });
  }
};
