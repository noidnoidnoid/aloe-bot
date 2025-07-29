require('dotenv').config({ path: './token.env' });

const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

const WELCOME_CHANNEL_ID = '1397782920982433873';
const AUTO_ROLE_NAME = 'afantasic';

// Lista de padrões suspeitos no nome
const suspiciousPatterns = ['announcements', 'ann0uncements', 'anɴouncements', 'announcementz'];

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', async (member) => {
  try {
    const username = member.user.username.toLowerCase();
    const suspiciousName = suspiciousPatterns.some(pattern => username.includes(pattern));
    const suspiciousDiscriminator = member.user.discriminator === '0000'; // comum em bots
    const accountAgeInDays = (Date.now() - member.user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recentlyCreated = accountAgeInDays < 1; // conta criada há menos de 1 dia

    if (suspiciousName || suspiciousDiscriminator || recentlyCreated) {
      console.log(`⚠️ Banning suspicious account: ${member.user.tag}`);

      await member.ban({ reason: 'Automatic anti-spam: suspicious username or account age.' });
      return;
    }

    // Atribui cargo automático
    const role = member.guild.roles.cache.find(r => r.name === AUTO_ROLE_NAME);
    if (role) {
      await member.roles.add(role);
      console.log(`✅ Assigned role '${AUTO_ROLE_NAME}' to ${member.user.tag}`);
    } else {
      console.warn(`⚠️ Role '${AUTO_ROLE_NAME}' not found`);
    }

    // Envia mensagem de boas-vindas com gif
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeMessage = `Welcome to Tempo, ${member}`;
    const gifPath = path.join(__dirname, 'assets/gif/Welcome.gif');
    const gifAttachment = new AttachmentBuilder(gifPath);

    await channel.send({ content: welcomeMessage, files: [gifAttachment] });
    console.log(`📨 Sent welcome message to ${member.user.tag}`);

  } catch (error) {
    console.error('❌ Error in guildMemberAdd:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
