const axios = require("axios");
const { cmd } = require('../command');

// Two independent public APIs. They are tried in order so one dead endpoint
// does not take the whole command down.
const PROVIDERS = [
    {
        name: 'bk9',
        url: (link) => `https://bk9.fun/download/instagram?url=${encodeURIComponent(link)}`,
        parse: (data) => {
            const item = data?.BK9?.[0];
            if (!item?.url) return null;
            const isVideo = /video|mp4/i.test(item.type || item.url);
            return [{ url: item.url, type: isVideo ? 'video' : 'image' }];
        }
    },
    {
        name: 'sparky',
        url: (link) => `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(link)}`,
        parse: (data) => {
            if (!data?.status || !Array.isArray(data.data)) return null;
            return data.data
                .filter((item) => item?.url)
                .map((item) => ({
                    url: item.url,
                    type: item.type === 'video' ? 'video' : 'image'
                }));
        }
    }
];

cmd({
    pattern: "igdl",
    alias: ["instagram", "insta", "ig"],
    react: "⬇️",
    desc: "Download Instagram videos, reels and photos",
    category: "download",
    use: ".igdl <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        const link = q || m.quoted?.text;
        if (!link || !link.includes("instagram.com")) {
            return reply('❌ Send an Instagram link.\nExample: .igdl https://instagram.com/reel/...');
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let media = null;
        for (const provider of PROVIDERS) {
            try {
                const { data } = await axios.get(provider.url(link), { timeout: 20000 });
                media = provider.parse(data);
                if (media && media.length) break;
            } catch (error) {
                console.error(`[igdl] ${provider.name} failed:`, error?.message || error);
            }
        }

        if (!media || !media.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply('❌ Could not fetch that post. It may be private, or the download services are down.');
        }

        for (const item of media.slice(0, 10)) {
            await conn.sendMessage(from, {
                [item.type]: { url: item.url },
                caption: `📥 *Instagram Download*\n\n> Powered by System32 WB`
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    } catch (error) {
        console.error('[igdl] error:', error?.message || error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply('❌ Download failed. Please try again later.');
    }
});
