const fs = require('node:fs');
const { Collection } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {
    register: async function (client) {
        const commands = []
        client.commands = new Collection();
        const commandFiles = fs.readdirSync('commands').filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
        const rest = new REST({ version: '9' }).setToken(client.token);

        rest.put(Routes.applicationGuildCommands(client.clientId, client.guildId), { body: commands })
            .then(() => console.log(`${new Date().toDateString()} - ${new Date().toLocaleTimeString()} | Successfully registered slash commands.`));
    }
};
