const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('answer')
        .setDescription('Answer a riddle !')
        .addStringOption(option => option
            .setName('answer')
            .setDescription('Write your answer.')
            .setRequired(true)
        ),
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
            }
            const ans = interaction.options.getString('answer').toUpperCase().split(' ');
            const embed = new MessageEmbed({
                color: '#2D3264', timestamp: Date.now(),
                footer: { text: client.embed.footer, iconURL: client.embed.iconURL },
                title: `${rows[0].name}`
            });
            if (ans.includes(rows[0].answer)) {
                embed.setDescription(`${rows[0].win}`);
                await client.con.query(`SELECT COUNT(*) as c FROM Enigme`, async (err, r) => {
                    if (err) throw err;
                    if (rows[0].score + 1 < r[0].c || rows[0].score + 1 == r[0].c) {
                        embed.addField('\u200B', `Next channel unlocked in 15 sec.`);
                        await client.con.query(`UPDATE Player SET score = score + 1 WHERE id = ${interaction.user.id}`, async (err) => { if (err) throw err; });
                        await client.con.query(`SELECT * FROM Enigme INNER JOIN Player WHERE Enigme.id = Player.score HAVING Player.id = ${interaction.user.id}`, async (err, rows) => {
                            if (err) throw err;
                            const channel = await client.channels.cache.get(rows[0].channelid);
                            interaction.channel.permissionOverwrites.delete(interaction.member.id);
                            channel.permissionOverwrites.create(interaction.member.id, { VIEW_CHANNEL: true });
                        });
                    }
                    if (rows[0].score + 1 == r[0].c || rows[0].score + 1 > r[0].c) {
                        embed.addField('\u200B', `There is no more riddle available for now.\nYou won !`);
                        interaction.member.roles.remove('955062226887266344');
                        interaction.member.roles.add('955062156540399616');
                        const channel = await client.channels.cache.get('972869068291965029');
                        const eWin = new MessageEmbed({
                            color: '#2D3264', timestamp: Date.now(),
                            footer: { text: client.embed.footer, iconURL: client.embed.iconURL },
                            title: `${interaction.user.username}`,
                            thumbnail: { url: interaction.user.displayAvatarURL({ dynamic: true }) }
                        });
                        channel.send({
                            embeds: [eWin]
                        })
                    }
                });
            } else embed.setDescription(`${rows[0].lose}`).addField('\u200B', 'You can retry with `/answer`');

            return await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        });
    },
};
