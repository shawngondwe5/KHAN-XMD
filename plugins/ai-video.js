/*
Sora AI Video Generator Command for Khan MD
Generates a short AI video from a text prompt using Okatsu API
*/

const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "sora",
    desc: "Generate AI video from a text prompt",
    category: "ai",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, args }) => {
    try {
        // Get user input
        const input = args.join(" ") || (quoted && (quoted.text || quoted.caption)) || null;

        if (!input) {
            return await conn.sendMessage(from, { 
                text: `✍️ *Please provide a prompt!*\n\nExample:\n.sora anime girl with short blue hair` 
            }, { quoted: mek });
        }

        // API URL
        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/txt2video?text=${encodeURIComponent(input)}`;

        // Request to API
        const { data } = await axios.get(apiUrl, {
            timeout: 60000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const videoUrl = data?.videoUrl || data?.result || data?.data?.videoUrl;

        if (!videoUrl) {
            return await conn.sendMessage(from, { 
                text: `❌ *Failed to generate video.*\nPlease try again with a different prompt.` 
            }, { quoted: mek });
        }

        // Send generated video
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `🎥 *Sora AI Video*\n\n📝 Prompt: ${input}\n\nPowered by *KHAN-MD*`
        }, { quoted: mek });

    } catch (err) {
        console.error('Sora CMD Error:', err);
        return await conn.sendMessage(from, { 
            text: `❌ Error generating video. Please try again later.` 
        }, { quoted: mek });
    }
});
