const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start playing !'),
    async execute(interaction, client) {
        if (interaction.channel.id !== client.guildChannels.general.id) return await interaction.reply({
            content: 'Not allowed !',
            ephemeral: true
        });
        client.con.query(`SELECT * FROM Player WHERE id = '${interaction.user.id}'`, async (err, rows) => {
            if(err) throw err;
            if (!rows[0]) {
                client.con.query(`INSERT INTO Player VALUES ('${interaction.user.id}', '${interaction.user.username}', 1)`, async (err) => {if (err) throw err;});

                const channel = await client.channels.cache.get(client.guildChannels.one.id);
                interaction.member.roles.add('955062226887266344');
                channel.permissionOverwrites.create(interaction.member.id, { VIEW_CHANNEL: true });

                await interaction.reply({
                   content: `You are now added to the game ! Check <#${client.guildChannels.one.id}> to begin.`,
                   ephemeral: true
                });
            }
            else return await interaction.reply({
                content: "You're already registered.",
                ephemeral: true
            });
        });
    },
};
