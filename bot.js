require('dotenv').config({ path: './token.env' });

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages]
});

const WELCOME_CHANNEL_ID = '1397782920982433873';
const AUTO_ROLE_NAME = 'afantasic';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', async (member) => {
  try {
    const suspiciousName = member.user.username.toLowerCase().includes('announcements');
    const suspiciousDiscriminator = member.user.discriminator === '0000'; // exemplo comum de bot
    const accountAgeInDays = (Date.now() - member.user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recentlyCreated = accountAgeInDays < 1; // menos de 1 dia de existência

    if (suspiciousName || suspiciousDiscriminator || recentlyCreated) {
      console.log(`⚠️ Banning suspicious account: ${member.user.tag}`);

      await member.ban({ reason: 'Automatic anti-spam: username or account age suspicious.' });
      return;
    }

    // Assign role
    const role = member.guild.roles.cache.find(r => r.name === AUTO_ROLE_NAME);
    if (role) {
      await member.roles.add(role);
      console.log(`Assigned role '${AUTO_ROLE_NAME}' to ${member.user.tag}`);
    } else {
      console.warn(`Role '${AUTO_ROLE_NAME}' not found`);
    }

    // Send welcome embed
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const { AttachmentBuilder } = require('discord.js');
    const path = require('path');

    const welcomeMessage = `Welcome to Tempo, ${member}`;
    const gifPath = path.join(__dirname, 'assets/gif/Welcome.gif');
    const gifAttachment = new AttachmentBuilder(gifPath);

    await channel.send({ content: welcomeMessage, files: [gifAttachment] });
    console.log(`Sent welcome message to ${member.user.tag}`);

  } catch (error) {
    console.error('Error in guildMemberAdd:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
