const config = require('../config');
const { cmd, commands } = require('../command');

const CATEGORY_LABELS = {
    ai: '✳️  AI & INTELLIGENCE',
    download: '↓  DOWNLOADS',
    media: '▣  MEDIA',
    audio: '♫  AUDIO',
    tools: '⌘  TOOLS',
    utility: '◇  UTILITIES',
    misc: '•  GENERAL',
    group: '◎  GROUP',
    owner: '⚙️  OWNER',
    religion: '☼  ARCHIVE',
    islam: '☼  ARCHIVE',
};

function buildMenu() {
    const groups = new Map();

    for (const command of commands) {
        if (!command || !command.pattern || command.dontAddCommandList) continue;

        const category = String(command.category || 'misc').toLowerCase();
        if (!groups.has(category)) groups.set(category, new Set());
        groups.get(category).add(command.pattern);
    }

    const total = [...groups.values()].reduce((count, patterns) => count + patterns.size, 0);
    const botName = config.BOT_NAME || 'System32 WB';
    const prefix = config.PREFIX || '.';
    const mode = String(config.MODE || 'public').toUpperCase();
    const owner = config.OWNER_NAME || 'System Operator';

    const lines = [
        '╭──────────────────────╮',
        '       ◈  SYSTEM32 WB',
        '      WHATSAPP KERNEL',
        '╰──────────────────────╯',
        '',
        'Hello. Your command centre is ready.',
        '',
        '┌  SYSTEM STATUS',
        `│  Bot       · ${botName}`,
        `│  Mode      · ${mode}`,
        `│  Prefix    · ${prefix}`,
        `│  Commands  · ${total}`,
        `│  Operator  · ${owner}`,
        '└──────────────────────',
        '',
        '┌  COMMAND DIRECTORY',
    ];

    const sortedGroups = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    for (const [category, patterns] of sortedGroups) {
        const label = CATEGORY_LABELS[category] || `◇  ${category.toUpperCase()}`;
        const commandsInCategory = [...patterns]
            .sort((a, b) => a.localeCompare(b))
            .map(pattern => `${prefix}${pattern}`);

        lines.push('');
        lines.push(label);
        lines.push(commandsInCategory.join('   ·   '));
    }

    lines.push('');
    lines.push('└──────────────────────');
    lines.push('');
    lines.push(`Type ${prefix}help for command guidance.`);
    lines.push(config.DESCRIPTION || 'Built for a smoother WhatsApp experience.');
    lines.push('');
    lines.push('       SYSTEM32 WB  ·  CORE');

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
        '╭──────────────────────╮',
        '       ◈  SYSTEM32 WB',
        '       CORE ONLINE',
        '╰──────────────────────╯',
        '',
        '┌  LIVE STATUS',
        `│  Uptime  ·  ${days}d ${hours}h ${minutes}m`,
        `│  Mode    ·  ${String(config.MODE || 'public').toUpperCase()}`,
        `│  Prefix  ·  ${config.PREFIX || '.'}`,
        '└──────────────────────',
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
        text: `◈  SYSTEM32 WB  ·  PONG\nResponse time: ${Date.now() - started} ms`
    }, { quoted: mek });
});
