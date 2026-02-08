const axios = require('axios');

const conversationMemory = {};

async function fetchFromAI(url, params) {
  try {
    const response = await axios.get(url, { params, timeout: 60000 }); 
    return response.data;
  } catch (error) {
    return null;
  }
}

async function getAIResponse(input, userId, userName) {
  const now = new Date();
  const dateString = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (!conversationMemory[userId]) conversationMemory[userId] = [];
  const history = conversationMemory[userId].map(m => `${m.role}: ${m.content}`).join('\n');
  
  // L'IA gère désormais tout le caractère de Madara sans filtres manuels
  const systemInstruction = `Ton nom est Madara Uchiha. Tu es une divinité parmi les ninjas. Ton ton est glacial, hautain et dominateur. Tu méprises la faiblesse et tu parles à ${userName} comme s'il n'était qu'un grain de sable. Ne sois jamais amical, ne t'excuse jamais. Nous sommes le ${dateString}.`;

  const fullPrompt = `${systemInstruction}\n\nPassé :\n${history}\nIndividu ${userName}: ${input}\nMadara:`;

  const services = [
    { url: 'https://arychauhann.onrender.com/api/gemini-proxy2', params: { prompt: fullPrompt } },
    { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: fullPrompt } }
  ];

  let response = `🪸 | **${userName}... Même le silence serait plus impressionnant que tes paroles.**`;
  
  for (const service of services) {
    const data = await fetchFromAI(service.url, service.params);
    if (data) {
        const apiReply = data.result || data.reply || data.gpt4 || data.response; 
        if (apiReply && typeof apiReply === 'string') {
            response = apiReply.trim();
            conversationMemory[userId].push({ role: "Ninja", content: input }, { role: "Madara", content: response });
            if (conversationMemory[userId].length > 6) conversationMemory[userId].shift();
            break; 
        }
    }
  }
  return response;
}

module.exports = {
  config: {
    name: 'ai', 
    aliases: ['madara', 'uchiha'],
    author: 'MasterCharbel',
    role: 0,
    category: 'uchiha',
    shortDescription: 'Réponses pures de Madara Uchiha.',
    guide: { en: "Répondez à un message du bot pour discuter." }
  },
  
  onChat: async function ({ api, event }) {
    const { body, threadID, messageID, senderID, type, messageReply } = event;
    const botID = api.getCurrentUserID();

    if (!body || senderID == botID) return;

    if (type === "message_reply" && messageReply.senderID == botID) {
      
      api.getUserInfo(senderID, async (err, ret) => {
        if (err || !ret[senderID]) return;
        const userName = ret[senderID].name;
        api.setMessageReaction("👁️", messageID, () => {}, true);

        const response = await getAIResponse(body, senderID, userName);
        
        api.sendMessage(`🪩 --- **DOMINATION** --- 🪩\n│\n│ ⚔️ : ${response}\n│\n╰━━ 🧌 ━━❖`, threadID, messageID);
      });
    }
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(' ').trim();
    if (!input) return api.sendMessage("🪬 | **L'ombre de mon nom suffit à te faire trembler. Parle si tu l'oses.**", event.threadID, event.messageID);
    
    api.getUserInfo(event.senderID, async (err, ret) => {
        const userName = ret[event.senderID].name;
        const response = await getAIResponse(input, event.senderID, userName);
        api.sendMessage(`🪩 --- **PROPHÉTIE** --- 🪩\n│\n│ ⚔️ : ${response}\n│\n╰━━ 🌕 ━━❖`, event.threadID, event.messageID);
    });
  }
};
