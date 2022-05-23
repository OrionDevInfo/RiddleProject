module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		client.user.setPresence({ activities: [{ name: 'Riddle Project' }], status: 'online' });
		console.log(`${new Date().toDateString()} - ${new Date().toLocaleTimeString()} | Ready - ${client.user.tag}`);
	},
};
