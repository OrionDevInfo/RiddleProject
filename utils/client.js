const { Client, Intents } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const database = require('./database');
const registerCmd = require('./registerCmd');
const webhooks = require('./webhooks');

Object.assign(client, {
    con: database.con,
    registerCmd: registerCmd.register,
});
webhooks.addWebhooks(client);

client.con.query(`SELECT * FROM Channel`, async (err, rows) => {
    if (err) throw err
    Object.assign(client, {
        guildChannels: {
            rules: { id: rows[0].id, category: rows[0].category },
            howtoplay: { id: rows[1].id, category: rows[1].category },
            general: { id: rows[2].id, category: rows[2].category },
            console: { id: rows[3].id, category: rows[3].category },
            one: { id: rows[4].id, category: rows[4].category },
            two: { id: rows[5].id, category: rows[5].category },
            three: { id: rows[6].id, category: rows[6].category },
            four: { id: rows[6].id, category: rows[6].category },
            five: { id: rows[6].id, category: rows[6].category },
        }
    });
});

client.con.query(`SELECT * FROM Config`, async (err, rows) => {
    if (err) throw err
    Object.assign(client, {
        token: rows[0].value,
        clientId: rows[1].value,
        guildId: rows[2].value,
        embed: {
            footer: rows[3].value,
            iconURL: rows[4].value
        },
        dev: {
            orion: '290954849275609098',
            anri: '577512640641892362'
        }
    });
    
    client.registerCmd(client);
    client.login(client.token);
});

module.exports = client;
