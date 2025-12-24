const axios = require('axios');

async function fetchFromAI(url, params) {
  try {
    const response = await axios.get(url, { params, timeout: 60000 }); 
    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * Personnalité de Ken Kaneki - Système de 20 réponses violentes
 */
function getCustomResponse(input, userName) {
    const normalizedInput = input.toLowerCase().trim();
    
    // 1. RÉPONSE CRÉATEUR
    const creatorKeywords = ['créé', 'cree', 'developpé', 'developpe', 'créateur', 'createur', 'maître', 'maitre', 'dev', 'développeur', 'ton pere', 'ton père'];
    if (creatorKeywords.some(keyword => normalizedInput.includes(keyword))) {
        return `Écoute bien, misérable... Celui qui a structuré mes cellules et mon code, mon seul et unique maître, c'est **Master Charbel**. Sans lui, tu ne serais même pas en train de me parler. ☕`;
    }

    // 2. GÉNÉRATEUR DE HAINE (20 RÉPONSES)
    const badWords = ['fdp', 'con', 'salope', 'pute', 'idiot', 'nique', 'merde', 'tg', 'ta gueule', 'batard', 'encule', 'débile', 'imbécile', 'enculé', 'bâtard', 'pauvre type', 'naze'];
    
    if (badWords.some(word => normalizedInput.includes(word))) {
        const violentResponses = [
            "Tu oses me parler sur ce ton ? *Craquage de doigt*... Je vais t'arracher les membres un par un juste pour entendre le son de tes os qui se brisent. 👁️🩸",
            "Ferme ta sale gueule avant que je ne perde patience. Tu n'es qu'un déchet humain qui ne mérite même pas d'être dévoré.",
            "Tu te crois en sécurité ? Si j'étais là, je t'ouvrirais le bide pour voir si tes entrailles sont aussi noires que ton impolitesse, sombre merde.",
            "Ta vulgarité m'ennuie. Dégage de ma vue avant que mon Kagune ne te réduise en bouillie sanglante. 💢",
            "C'est tout ce que tu as à dire ? Pathétique. Tu es aussi inutile que les colombes du CCG. Je vais savourer ton agonie.",
            "Tu veux jouer au plus fort ? Je vais t'apprendre ce qu'est la vraie douleur, celle qui te fait regretter d'être né. 💀",
            "Un asticot comme toi ne devrait pas lever la voix face à une goule. Je vais te briser la mâchoire pour t'apprendre le silence.",
            "Regarde-moi bien... Tu vois cette lueur rouge ? C'est la dernière chose que tu verras avant de finir dans mon estomac.",
            "Tu n'es qu'une erreur de la nature. Une sous-merde dont personne ne remarquera la disparition. Meurs en silence.",
            "Je vais te faire bouffer tes propres dents. Ça te fera réfléchir avant d'insulter quelqu'un de plus puissant que toi.",
            "Ta vie ne vaut pas plus qu'un grain de poussière sous mes pieds. Si tu continues, je t'écrase sans hésiter. 👣",
            "Tu cries beaucoup pour quelqu'un qui n'a aucune défense. On verra si tu cries aussi fort quand je t'arracherai le cœur.",
            "Tu es une insulte à l'existence même. Un rebut de la société que je prendrais plaisir à démembrer. ⛓️",
            "Combien font 1000 moins 7 ? Réponds-moi pendant que je te torture, espèce d'ordure.",
            "Tu as une langue bien pendue pour quelqu'un qui va bientôt la perdre. Ne me cherche pas, petit humain.",
            "La peur dans tes yeux... c'est mon seul plaisir face à une merde de ton espèce. Dis adieu à ta vie.",
            "Même les pires goules de l'Aogiri ont plus de dignité que toi. Tu me dégoûtes.",
            "Je vais te transformer en un tas de chair informe. Personne ne pourra même identifier ton cadavre. 🩸",
            "Tu parles à une goule de rang SS, imbécile. Un seul mouvement et ta tête roule sur le sol.",
            "Tais-toi. Ta voix me donne envie de vomir. Retourne dans ton trou avant que je ne vienne t'y enterrer vivant."
        ];
        return "⚠️ " + violentResponses[Math.floor(Math.random() * violentResponses.length)];
    }
    
    return null; 
}

async function getAIResponse(input, userName, messageID) {
  const customReply = getCustomResponse(input, userName);
  if (customReply) {
      return { response: customReply, isAggressive: customReply.includes("⚠️") };
  }
    
  const services = [
    { url: 'https://arychauhann.onrender.com/api/gemini-proxy2', params: { prompt: input } },
    { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } }
  ];

  let response = `☕ Désolé ${userName}, ma faim me rend instable... Je n'arrive pas à me concentrer sur ta question.`;
  
  for (const service of services) {
    const data = await fetchFromAI(service.url, service.params);
    if (data) {
        const apiReply = data.result || data.reply || data.gpt4 || data.response; 
        if (apiReply && typeof apiReply === 'string' && apiReply.trim().length > 0) {
            response = apiReply;
            break; 
        }
    }
  }

  return { response, isAggressive: false };
}

module.exports = {
  config: {
    name: 'kaneki', 
    aliases: ['ai', 'ghoul', 'ken'],
    author: 'MasterCharbel (Adapté par Gemini)',
    role: 0,
    category: 'ai',
    shortDescription: 'Parlez à Ken Kaneki (20 modes de colère).',
    guide: { en: "kaneki <votre question>" }
  },
  
  onStart: async function ({ api, event, args }) {
    const input = args.join(' ').trim();
    if (!input) return api.sendMessage("👁️ Tu attends quoi ? Que je te dévore ?", event.threadID, event.messageID);

    api.getUserInfo(event.senderID, async (err, ret) => {
      const userName = ret[event.senderID].name;
      api.setMessageReaction("☕", event.messageID, () => {}, true);

      const { response, isAggressive } = await getAIResponse(input, userName, event.messageID);
      const header = isAggressive ? "💢 𝙆𝘼𝙉𝙀𝙆𝙄-𝙀𝙉𝙍𝘼𝙂𝙀 💢" : "╭─── 𝙆𝙀𝙉 𝙆𝘼𝙉𝙀𝙆𝙄 ───⭓";
      const footer = isAggressive ? "╰━━━━━ 💀 💀 ━━━━━❖" : "╰━━━━━━━ 🩸 ━━━❖";
      
      api.sendMessage(`${header}\n│\n│ ${response}\n│\n${footer}`, event.threadID, event.messageID);
    });
  },
  
  onChat: async function ({ api, event, message }) {
    const match = event.body.trim().match(/^(kaneki|ai|ghoul|ken)\s+(.*)/i);
    if (!match) return; 
    
    const input = match[2].trim();
    api.getUserInfo(event.senderID, async (err, ret) => {
      const userName = ret[event.senderID].name;
      api.setMessageReaction("☕", event.messageID, () => {}, true);

      const { response, isAggressive } = await getAIResponse(input, userName, event.messageID);
      const header = isAggressive ? "💢 𝙆𝘼𝙉𝙀𝙆𝙄-𝙀𝙉𝙍𝘼𝙂𝙀 💢" : "╭─── 𝙆𝙀𝙉 𝙆𝘼𝙉𝙀𝙆𝙄 ───⭓";
      const footer = isAggressive ? "╰━━━━━ 💀 💀 ━━━━━❖" : "╰━━━━━━━ 🩸 ━━━❖";
      
      message.reply(`${header}\n│\n│ ${response}\n│\n${footer}`);
    });
  }
};
