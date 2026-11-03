const config = require('../config');
const { cmd, commands } = require('../command');

const CATEGORY_LABELS = {
    ai: '✳️ AI & INTELLIGENCE',
    download: '↓ DOWNLOADS',
    media: '▣ MEDIA',
    audio: '♫ AUDIO',
    tools: '⌘ TOOLS',
    utility: '◇ UTILITIES',
    misc: '• GENERAL',
    group: '◎ GROUP',
    owner: '⚙️ OWNER',
    religion: '☼ ARCHIVE',
    islam: '☼ ARCHIVE',
};

function buildMenu() {
    const groups = new Map();

    for (const command of commands) {
        if (!command || !command.pattern || command.dontAddCommandList) continue;

        const category = String(command.category || 'misc').toLowerCase();
        if (!groups.has(category)) groups.set(category, new Set());
        groups.get(category).add(String(command.pattern).trim());
    }

    const sortedGroups = [...groups.entries()]
        .map(([category, patterns]) => [
            category,
            [...patterns].filter(Boolean).sort((a, b) => a.localeCompare(b)),
        ])
        .filter(([, patterns]) => patterns.length > 0)
        .sort((a, b) => a[0].localeCompare(b[0]));

    const total = sortedGroups.reduce((sum, [, patterns]) => sum + patterns.length, 0);
    const prefix = config.PREFIX || '.';
    const botName = config.BOT_NAME || 'System32 WB';
    const mode = String(config.MODE || 'public').toUpperCase();
    const owner = config.OWNER_NAME || 'System Operator';

    const lines = [
        '┏━━━━━━━━━━━━━━━━━━━━┓',
        '     ◈ *SYSTEM32 WB*',
        '      _WHATSAPP KERNEL_',
        '┗━━━━━━━━━━━━━━━━━━━━┛',
        '',
        '*YOUR COMMAND CENTRE*',
        'A cleaner way to get things done.',
        '',
        '┌─ *SYSTEM OVERVIEW*',
        `│  ◉ Bot: ${botName}`,
        `│  ◉ Mode: ${mode}`,
        `│  ◉ Prefix: ${prefix}`,
        `│  ◉ Commands: ${total}`,
        `│  ◉ Sections: ${sortedGroups.length}`,
        `└─ Operator: ${owner}`,
        '',
        '┌─ *COMMAND DIRECTORY*',
    ];

    for (const [category, patterns] of sortedGroups) {
        const label = CATEGORY_LABELS[category] || `◇ ${category.toUpperCase()}`;
        lines.push('');
        lines.push(`* ${label}  ·  ${patterns.length} *`);
        lines.push(patterns.map(pattern => `  • ${prefix}${pattern}`).join('\n'));
    }

    lines.push('');
    lines.push('└━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push(`_Use ${prefix}help for command guidance._`);
    lines.push(config.DESCRIPTION || 'Built for a smoother WhatsApp experience.');
    lines.push('');
    lines.push('*SYSTEM32 WB*  ·  _CORE_');

    return lines.join('\n');
}

cmd({
    pattern: 'menu',
    alias: ['help', 'commands', 'list'],
    desc: 'Show all available commands',
    category: 'utility',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Send text only; do not attach legacy KHAN-branded menu artwork.
        return await conn.sendMessage(from, { text: buildMenu() }, { quoted: mek });
    } catch (error) {
        console.error('menu error:', error);
        return reply('Could not build the menu.');
    }
});

cmd({
    pattern: 'alive',
    alias: ['status'],
    desc: 'Check if the bot is online',
    category: 'utility',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    const seconds = Math.floor(process.uptime());
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const status = [
        '┏━━━━━━━━━━━━━━━━━━━━┓',
        '     ◈ *SYSTEM32 WB*',
        '       _CORE ONLINE_',
        '┗━━━━━━━━━━━━━━━━━━━━┛',
        '',
        '*LIVE STATUS*',
        `◉ Uptime: ${days}d ${hours}h ${minutes}m`,
        `◉ Mode: ${String(config.MODE || 'public').toUpperCase()}`,
        `◉ Prefix: ${config.PREFIX || '.'}`,
        '',
        'All systems operational.'
    ].join('\n');

    return reply(status);
});

cmd({
    pattern: 'ping',
    alias: ['speed'],
    desc: 'Measure response time',
    category: 'utility',
    filename: __filename
}, async (conn, mek, m, { from }) => {
    const started = Date.now();
    await conn.sendMessage(from, {
        text: `◈ *SYSTEM32 WB*  ·  PONG\nResponse time: ${Date.now() - started} ms`
    }, { quoted: mek });
});
