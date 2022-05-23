const { WebhookClient } = require("discord.js");

module.exports = {
    addWebhooks: async function (client) {
        client.con.query(`SELECT * FROM Config WHERE id LIKE ('rules%' OR 'howtoplay%' OR 'leaderboard%')`, async (err, rows) => {
            if (err) throw err;
            const rules = new WebhookClient({
                url: rows[0].value
            });
            const howtoplay = new WebhookClient({
                url: rows[1].value
            });
            const leaderboard = new WebhookClient({
                url: rows[2].value
            });
            Object.assign(client, {
                web: {
                    rules: rules,
                    howtoplay: howtoplay,
                    leaderboard: leaderboard
                }
            });
        });
    }
};
