const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Voir les joueurs au niveau le plus élevé'),
    async execute (interaction, client) {
        client.con.query(`SELECT * FROM Player ORDER BY score DESC LIMIT 10`, async (err, rows) => {
            const n = rows.length < 10 ? rows.length : 10;
            let i = 1;
            let l = '';
            
            rows.forEach(player => {
                if ([1,2,3].includes(i)) {
                    if (i == 1) t = ':first_place:'
                    else if (i == 2) t = ':second_place:'
                    else t = ':third_place:'
                }
                else t = `${i}e`
                l += `\n${t} • <@${player.id}> - ${player.score < 2 ? `Pas d'énigme complétée.` : `A complété ${player.score == 2 ? 'la première énigme.' : `${player.score - 1} énigmes.`}`}`
                i++
            });
            const e = new MessageEmbed({
                color: '#2D3264', timestamp: Date.now(),
                footer: { text: client.embed.footer, iconURL: client.embed.iconURL },
                title: `${n == 1 ? 'MEILLEUR JOUEUR' : `${n} MEILLEURS JOUEURS`}`, description: l
            });
            await interaction.reply({
                embeds: [e],
                ephemeral: false
            });
        });
    }
}
