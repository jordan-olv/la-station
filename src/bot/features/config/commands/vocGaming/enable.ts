import { Message } from 'discord.js';
import { GuildService } from '../../../../../database/services/GuildService';
// import { LogService } from '../../../../../database/services/LogService';

export default {
  name: 'enable-vocGaming',
  description: 'Active ou désactive la fonctionnalité vocGaming',
  usage: 'enable-vocGaming <true/false>',

  /**
   * Active ou désactive la fonctionnalité vocGaming
   * @param message Le message Discord
   * @param args Les arguments de la commande
   */
  async execute(message: Message, args: string[]) {
    try {
      // Vérifier si un argument a été fourni
      if (!args.length) {
        return message.reply({
          content: '❌ Veuillez spécifier true ou false. Exemple: `enable-vocGaming true`'
        });
      }

      const enableValue = args[0].toLowerCase();

      // Vérifier que l'argument est valide
      if (enableValue !== 'true' && enableValue !== 'false') {
        return message.reply({
          content: '❌ L\'argument doit être true ou false. Exemple: `enable-vocGaming true`'
        });
      }

      const isEnabled = enableValue === 'true';

      // Mettre à jour le statut dans la base de données
      await GuildService.updateFeatureSettings(message.guild?.id || '', 'vocGaming', {
        enabled: isEnabled,
      });

      // Ajouter le log
      // await LogService.sendLog(
      //   message.guild?.id || '',
      //   `La fonctionnalité vocGaming a été ${isEnabled ? 'activée' : 'désactivée'} par ${message.author.tag}`,
      //   'info'
      // );
   
      const reply = await message.reply({
        content: `✅ La fonctionnalité vocGaming a été ${isEnabled ? 'activée' : 'désactivée'} !`
      });

      setTimeout(() => { reply.delete(); message.delete(); }, 5000);
    } catch (error) {
      console.error('Erreur dans la commande enable-vocGaming:', error);
      await message.reply({
        content: '❌ Une erreur est survenue lors de l\'exécution de la commande.'
      });
    }
  }
};