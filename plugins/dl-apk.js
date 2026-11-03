const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "apk",
    alias: ["app"],
    react: "📲",
    desc: "📥 Download APK directly",
    category: "📁 Download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ *Please provide an app name!*");

        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Fetch APK from new API
        const apiUrl = `https://api.princetechn.com/api/download/apkdl?apikey=prince&appName=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.result?.download_url) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *No APK found with that name, please try again.*");
        }

        const app = data.result;

        // Send APK file
        await conn.sendMessage(from, {
            document: { url: app.download_url },
            mimetype: app.mimetype || "application/vnd.android.package-archive",
            fileName: `${app.appname}.apk`,
            caption: `✅ *APK successfully downloaded*\nPowered By VORTEX-MD 🤍`
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *An error occurred while fetching the APK.*");
    }
});
