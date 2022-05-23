const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { ASCII_GENERAL_CI } = require('mysql/lib/protocol/constants/charsets');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Mod Commands')
        .addSubcommandGroup(group => group
            .setName('admin').setDescription('Admin Tools')
            .addSubcommand(subcommand => subcommand.setName('destroy').setDescription('Destroying bot client & process.'))
            .addSubcommand(subcommand => subcommand.setName('leaderboard').setDescription('Lauching leaderboard webhook.'))
            .addSubcommand(subcommand => subcommand.setName('rules').setDescription('Lauching rules webhook.'))
            .addSubcommand(subcommand => subcommand.setName('howtoplay').setDescription('Lauching howtoplay webhook.'))
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
                interaction.reply({
                    content: 'Started.',
                    ephemeral: true
                });                
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
                    setTimeout(edit, 60 * 60 * 1000); // Each hour
                };
                edit();
            });
        }
        if (interaction.options.getSubcommand() === 'rules') {
            const e = new MessageEmbed({
                color: '#2D3264', timestamp: Date.now(),
                footer: { text: client.embed.footer, iconURL: client.embed.iconURL },
                title: `Règles du serveur`,
                fields: [
                    {name : 'Être civil et respecteux', value : 'Traiter tout le monde avec respect. Aucun harcélement, sexisme, racisme ou discours haineux ne sera toléré.'}, 
                    {name : 'Pas de spam ni d\'auto-promotion', value : 'Cela inclut les invitations de serveurs, les pubs etc sans la permission d\'un administrateur. Cette règle inclut les messages privés aux membres du serveur.'}, 
                    {name : 'Pas de contenu NSFW', value : 'Pas de contenu pour adultes ou obscène. Cela inclut les messages, images ou liens incluant la nudité, le sexe, la violence et le gore.'},
                    {name : 'Aidez à garder le serveur en bon état', value : 'Si vous voyez quelque chose ne respectant pas les règles du serveur ou vous rendant mal à l\'aise, merci de contacter le staff.'},
                    {name : 'Respectez le travail effectué par les développeurs', value : 'Ne partagez aucun indice permettant de réussir les énigmes. Les équipes ne sont pas autorisées. Il est également interdit d\'écrire des messages dans les salons de la catégorie GAME.'},
                    {name : '\u200B', value : 'PS : Si vous utilisez internet pour répondre aux énigmes, vous gâchez votre expérience de jeu et cela ne vous apportera rien. Réfléchissez, vous trouverez les réponses par vous même.'}
                ]
            });
            client.web.rules.send({
                username: client.user.username,
                avatarURL: client.user.avatarURL(),
                embeds: [e]
            }).then(
                interaction.reply({
                    content: 'Sent.',
                    ephemeral: true
                })
            );
        }
        if (interaction.options.getSubcommand() === 'howtoplay') {
            const e = new MessageEmbed({
                color: '#2D3264', timestamp: Date.now(),
                footer: { text: client.embed.footer, iconURL: client.embed.iconURL },
                title: `Liste des commandes disponibles`,
                fields: [
                    {name : '/start', value : 'Utilisez cette commande dans <#955062479229169744> pour commencer le jeu.'}, 
                    {name : '/question', value : 'Saisissez cette commande dans le salon de jeu pour afficher la question de votre niveau.'}, 
                    {name : '/answer', value : 'Écrivez cette commande dans le salon de jeu pour proposer une réponse à l\'énigme'},
                    {name : '/invit', value : 'Recopiez le lien envoyé en réponse et partagez-le pour promouvoir le serveur.'},
                    {name : '/ping', value : 'Donne des informations sur le bot et sur le temps de latence'},
                    {name : '/leaderboard', value : 'Permet de voir le classement général en direct.'}
                ]
            });
            client.web.howtoplay.send({
                username: client.user.username,
                avatarURL: client.user.avatarURL(),
                embeds: [e]
            }).then(
                interaction.reply({
                    content: 'Sent.',
                    ephemeral: true
                })
            );
        }
	},
};
