import { Message } from 'discord.js';
import { GuildService } from '../../../../database/services/GuildService';
import { LogService } from '../../../services/LogService';
import { IGuild } from '@/database/models/Guild';

export default {
  name: 'enable-logs',
  description: 'Active ou désactive les logs',
  usage: 'enable-logs <true/false>',
  
  /**
   * Active ou désactive les logs
   * @param message Le message Discord
   * @param args Les arguments de la commande
   * @param guildData Les données du serveur
   */
  async execute(message: Message, args: string[], guildData: IGuild) {
    try {
      if (!args.length) {
        return message.reply({
          content: '❌ Veuillez spécifier true ou false. Exemple: `enable-logs true`'
        });
      }

      const enableValue = args[0].toLowerCase();
      
      if (enableValue !== 'true' && enableValue !== 'false') {
        return message.reply({
          content: '❌ L\'argument doit être true ou false. Exemple: `enable-logs true`'
        });
      }

      const isEnabled = enableValue === 'true';

      await GuildService.updateFeatureSettings(message.guild?.id || '', 'logs', {
        enabled: isEnabled
      });

      await LogService.sendLog(
        message.guild?.id || '',
        `La fonctionnalité logs a été ${isEnabled ? 'activée' : 'désactivée'} par ${message.author.tag}`,
        'info'
      );

      const reply = await message.reply({
        content: `✅ Les logs ont été ${isEnabled ? 'activés' : 'désactivés'} !`
      });

      setTimeout(() => {
        reply.delete();
        message.delete();
      }, 5000);
    } catch (error) {
      console.error('Erreur dans la commande enable-logs:', error);
      await message.reply({
        content: '❌ Une erreur est survenue lors de l\'exécution de la commande.'
      });
    }
  }
}; 