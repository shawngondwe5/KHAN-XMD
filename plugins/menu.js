const config = require('../config');
const { cmd, commands } = require('../command');

const CATEGORY_EMOJI = {
    ai: '🤖',
    download: '📥',
    media: '🎬',
    audio: '🎧',
    tools: '🛠️',
    utility: '🧰',
    misc: '📦',
    group: '👥',
    owner: '👑',
    religion: '📖',
    islam: '📖',
};

function buildMenu() {
    const groups = new Map();

    for (const c of commands) {
        if (!c || !c.pattern || c.dontAddCommandList) continue;
        const category = (c.category || 'misc').toLowerCase();
        if (!groups.has(category)) groups.set(category, new Set());
        groups.get(category).add(c.pattern);
    }

    const lines = [
        `╭─〔 *${config.BOT_NAME}* 〕`,
        `├─ Prefix: *${config.PREFIX}*`,
        `├─ Mode: *${config.MODE}*`,
        `├─ Commands: *${[...groups.values()].reduce((n, s) => n + s.size, 0)}*`,
        `╰─ Type *${config.PREFIX}help* any time`,
        '',
    ];

    for (const [category, patterns] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        const emoji = CATEGORY_EMOJI[category] || '▫️';
        lines.push(`${emoji} *${category.toUpperCase()}*`);
        lines.push([...patterns].sort().map((p) => `${config.PREFIX}${p}`).join('  '));
        lines.push('');
    }

    lines.push(`_${config.DESCRIPTION || 'Powered by KHAN-MD'}_`);
    return lines.join('\n');
}

cmd({
    pattern: "menu",
    alias: ["help", "commands", "list"],
    desc: "Show all available commands",
    category: "utility",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        return reply(buildMenu());
    } catch (e) {
        console.error('menu error:', e);
        return reply('Could not build the menu.');
    }
});

cmd({
    pattern: "alive",
    alias: ["status"],
    desc: "Check if the bot is online",
    category: "utility",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    const seconds = Math.floor(process.uptime());
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    return reply(`🤖 *${config.BOT_NAME} is online*\n\nUptime: ${d}d ${h}h ${min}m\nPrefix: ${config.PREFIX}\nMode: ${config.MODE}`);
});

cmd({
    pattern: "ping",
    alias: ["speed"],
    desc: "Measure response time",
    category: "utility",
    react: "🏓",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    const started = Date.now();
    await conn.sendMessage(from, { text: '🏓 Pong!' }, { quoted: mek });
    await conn.sendMessage(from, { text: `⚡ ${Date.now() - started} ms` }, { quoted: mek });
});
