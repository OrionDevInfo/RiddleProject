const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong !'),
	async execute(interaction, client) {
        uptime = client.uptime/(1000*60);
        const pong = new MessageEmbed({
            color: '#2D3264', timestamp: Date.now(),
            footer: { text: client.embed.footer, iconURL: client.embed.iconURL },
            title: '🏓 Pong !',
            description: `Websocket heartbeat: \`${client.ws.ping}\`ms.
            Uptime : \`${uptime.toFixed(1)}\`min.
            Last \`READY\` event : <t:${Math.floor(client.readyAt / 1000)}:R>.`
        });
		await interaction.reply({
            embeds: [pong],
            ephemeral: true
        });
	},
};
