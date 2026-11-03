const path = require('path');
const fs = require('fs');
const config = require('../config');
const { cmd, commands } = require('../command');


const CATEGORY_TAGS = {
    ai: '[AI]',
    download: '[DOWNLOAD]',
    media: '[MEDIA]',
    audio: '[AUDIO]',
    tools: '[TOOLS]',
    utility: '[UTILITY]',
    misc: '[MISC]',
    group: '[GROUP]',
    owner: '[ROOT]',
    religion: '[ARCHIVE]',
    islam: '[ARCHIVE]',
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
        `╭─〔 ${config.BOT_NAME} 〕`,
        `├─ Prefix: ${config.PREFIX}`,
        `├─ Mode: ${config.MODE}`,
        `├─ Operator: ${config.OWNER_NAME}`,
        `├─ Commands: ${[...groups.values()].reduce((n, s) => n + s.size, 0)}`,
        `╰─ Command Info: ${config.PREFIX}help`,
        '',
    ];

    for (const [category, patterns] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        const tag = CATEGORY_TAGS[category] || '[SYS]';
        lines.push(`${tag} ${category.toUpperCase()}`);
        lines.push([...patterns].sort().map((p) => `${config.PREFIX}${p}`).join('  '));
        lines.push('');
    }

    lines.push(`_${config.DESCRIPTION || 'System32 WB Core Kernel'}_`);
    return lines.join('\n');
}

cmd({
    pattern: "menu",
    alias: ["help", "commands", "list"],
    desc: "Show all available commands",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const menuText = buildMenu();
        const menuImgPath = path.join(__dirname, '..', 'assets', 'menu.jpg');
        if (fs.existsSync(menuImgPath)) {
            return await conn.sendMessage(from, {
                image: fs.readFileSync(menuImgPath),
                caption: menuText
            }, { quoted: mek });
        }
        return reply(menuText);
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
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    const seconds = Math.floor(process.uptime());
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const aliveText = `[SYSTEM32 WB] Core Active\n\nUptime: ${d}d ${h}h ${min}m\nPrefix: ${config.PREFIX}\nMode: ${config.MODE}\nNode: ${config.OWNER_NAME}`;
    const logoImgPath = path.join(__dirname, '..', 'assets', 'logo.jpg');
    if (fs.existsSync(logoImgPath)) {
        return await conn.sendMessage(from, {
            image: fs.readFileSync(logoImgPath),
            caption: aliveText
        }, { quoted: mek });
    }
    return reply(aliveText);
});

cmd({
    pattern: "ping",
    alias: ["speed"],
    desc: "Measure response time",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    const started = Date.now();
    await conn.sendMessage(from, { text: `[PONG] Response time: ${Date.now() - started} ms` }, { quoted: mek });
});
