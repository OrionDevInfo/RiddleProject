const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Mod Commands')
        .addSubcommandGroup(group => group
            .setName('admin').setDescription('Admin Tools')
            .addSubcommand(subcommand => subcommand.setName('destroy').setDescription('Destroying bot client & process.'))
            .addSubcommand(subcommand => subcommand.setName('leaderboard').setDescription('Lauching leaderboard webhook.'))
            .addSubcommand(subcommand => subcommand
                .setName('deleteplayer').setDescription('Delete a player.')
                .addUserOption(option => option.setName('player').setDescription('Select a player.').setRequired(true))
            )
        )
        .addSubcommand(subcommand => subcommand.setName('clear').setDescription('Clear messages.')
            .addIntegerOption(option => option.setName('number').setDescription('Number of messages to clear').setMinValue(1).setMaxValue(99).setRequired(true))
        ),
	async execute(interaction, client) {
        if (![client.dev.orion, client.dev.anri].includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'Not Allowed',
                ephemeral: true
            });
        }

        if (interaction.options.getSubcommand() === 'destroy') {
            await interaction.reply({
                content: 'Destroying …',
                ephemeral: true
            });
            client.con.end();
            client.destroy();
            console.log('Client Destroyed');
            process.exit();
        }

        if (interaction.options.getSubcommand() === 'clear') {
            const number = interaction.options.getInteger('number');
            await interaction.channel.bulkDelete(number, true);
            return await interaction.reply({ content: `Messages cleared.`, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'deleteplayer') {
            const player = interaction.options.getMember('player');
            player.roles.remove('955062226887266344');
            player.roles.remove('955062156540399616');
            client.con.query(`SELECT *, Channel.id FROM Player INNER JOIN Channel WHERE Channel.name = Player.score HAVING Player.id = '${player.user.id}'`, async (err, rows) => {
                if (err) throw err;
                if (rows[0]) {
                    const channel = await client.channels.cache.get(rows[0].id);
                    channel.permissionOverwrites.delete(player.user.id);
                }
            });
            client.con.query(`DELETE FROM Player WHERE id = '${player.user.id}'`, async (err, rows) => {
                if (err) throw err;
            });

            return await interaction.reply({ content: `${player.toString()} is now deleted !`, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'leaderboard') {
            const e = new MessageEmbed({
                color: '#2D3264', timestamp: Date.now(),
                footer: { text: client.embed.footer, iconURL: client.embed.iconURL },
                title: `LEADERBOARD`
            });
            client.web.leaderboard.send({
                username: client.user.username,
                avatarURL: client.user.avatarURL(),
                embeds: [e]
            }).then(sentMessage => {
                msgId = sentMessage.id;
                edit = async () => {
                    client.con.query(`SELECT * FROM Player ORDER BY score DESC LIMIT 10`, async (err, rows) => {
                        if (err) throw err;
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
                        
                        await client.web.leaderboard.editMessage(msgId, {
                            username: client.user.username,
                            avatarURL: client.user.avatarURL(),
                            embeds: [e]
                        });
                    });
                    setTimeout(edit, 20 * 1000);
                };
                edit();
            });
        }
	},
};
