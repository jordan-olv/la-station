import { Client, Message } from 'discord.js';
import { BotClient } from '../../../BotClient';
import { GuildService } from '../../../../database/services/GuildService';
import { EmbedUtils } from '../../../utils/EmbedUtils';
import { Command } from '../../../interfaces/Command';
import { UserService } from '../../../../database/services/UserService';

export default {
  name: 'messageCreate',
  once: false,
  
  /**
   * Gère l'événement messageCreate pour exécuter les commandes
   * @param client Le client Discord
   * @param message Le message reçu
   */
  async execute(client: BotClient, message: Message) {
    // Ignorer les messages des bots et les messages sans préfixe
    if (message.channel.type !== 0) return;
    if (message.author.bot) return;
    if (!message.guild) return;
    
    const guildData = await GuildService.ensureGuild(message.guild.id, message.guild.name);
    if (!guildData) return;

    // Vérifier et créer l'utilisateur du serveur si nécessaire
    let guildUser = await UserService.getGuildUserByDiscordId(message.author.id, message.guild.id);
    if (!guildUser) {
      guildUser = await UserService.createGuildUser(message.author, message.guild);
    }

    // Incrémentation du nombre de messages total
    await UserService.incrementTotalMsg(message.author.id, message.guild.id);

    // Donne de l'xp aléatoire entre 6 et 10
    const randomXp = Math.floor(Math.random() * (10 - 6 + 1)) + 6;
    await UserService.giveXpToUser(client, message, randomXp);

    // Vérifie si c'est une commande
    const prefix = guildData.config.prefix;
    if (!message.content.startsWith(prefix)) return;
    
    // Extraction du nom de la commande et des arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    
    if (!commandName) return;
    
    // Recherche de la commande dans la collection
    const command = client.commands.get(commandName) as Command;
    
    if (!command) return;

    // Vérification des rôles requis
    if (command.roles && command.roles.length > 0) {
      const hasRole = message.member?.roles.cache.some(role => command.roles!.includes(role.id));
      if (!hasRole) {
        const embed = EmbedUtils.createErrorEmbed(
          'Permission refusée',
          'Vous n\'avez pas les rôles requis pour utiliser cette commande.'
        );
        return message.reply({ embeds: [embed] });
      }
    }
    
    // Exécution de la commande
    try {
      await command.execute(message, args, guildData);
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
      await message.reply('Une erreur est survenue lors de l\'exécution de cette commande.');
    }
  }
};