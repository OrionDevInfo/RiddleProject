const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('question')
        .setDescription('Affiche l\'énigme à résoudre'),
    async execute(interaction, client) {
        client.con.query(`SELECT *, Player.score, Player.id FROM Enigme INNER JOIN Player WHERE Enigme.id = Player.score HAVING Player.id = ${interaction.user.id}`, async (err, rows) => {
            if(err) throw err;
            if (!rows[0]) return await interaction.reply({
                content: 'Use `/start` to join the game.',
                ephemeral: true
            });
            if (interaction.channel.id !== rows[0].channelid) {
                return await interaction.reply({
                    content: 'Rendez vous sur le salon de jeu pour utiliser cette commande !',
                    ephemeral: true
                });
            };
            const embed = new MessageEmbed({
                color: '#2D3264', timestamp: Date.now(),
                footer: { text: client.embed.footer, iconURL: client.embed.iconURL },
                title: `${rows[0].name}`,
                description: `${rows[0].question}`,
                fields: [
                    { name: '\u200B', value: 'You can now use `/answer`.'}
                ]
            });
            return await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        });
    },
};
