const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Lien d\'invitation'),
	async execute(interaction) {
		await interaction.reply({
            content: 'https://discord.gg/zsS89C9JjJ',
            ephemeral: true
        });
	},
};
