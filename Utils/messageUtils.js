/* global Set */
const cooldown = new Set();
const cooldownWarning = new Set();
const Discord = require("discord.js");

module.exports = {
	/**
	* This function will return 0 if the user isn't on CD, it'll return 3 if it's on CD and i'll return 4 if it was warned that it's on CD but still trying.
	* @function
	* @param {string} id - The message author ID.
	* @returns {number}
	*/
	applyCooldown: function(id) {

		const applyCDWarning = () => {
			cooldownWarning.add(id);

			setTimeout(() => {
				cooldownWarning.delete(id);
			}, process.env.COOLDOWN);
		};

		if (id === process.env.OWNER) {
			return 0;
		}

		if (cooldownWarning.has(id)) {
			return 3;
		}

		if (cooldown.has(id)) {
			applyCDWarning();

			return 4;
		}

		cooldown.add(id);
		setTimeout(() => {
			cooldown.delete(id);
		}, process.env.COOLDOWN);

		return 0;
	},
	/**
	* Returns a embed with default options.
	* @function
	* @param {object} member - The message member.
	* @returns {object}
	*/
	zerinhoEmbed: function(member) {
		const ZeroEmbed = new Discord.RichEmbed();

		ZeroEmbed.setAuthor(member.user.tag, member.user.displayAvatarURL);
		ZeroEmbed.setColor(member.displayHexColor);
		ZeroEmbed.setTimestamp();
		return ZeroEmbed;
	},
	/**
	* Sets up the channel so you don't need to pass it every time for the zerinhoSend function that's what it returns.
	* @function
	* @param {object} channel - The channel object.
	* @param {object} t - The translate function.
	* @returns {object} Returns the zerinhoSend function.
	*/
	zerinhoConfigSend: function(channel, t) {
		/**
		* @function
		* @param {(string|object)} content - The content to send.
		* @param {boolean} [literal] - If the content is a path-to-string for the translate function.
		*/
		return function zerinhoSend(content, literal) {
			//If literal is true, then it'll use the content as param for the translate function, else it'll just use the content as the message, literally.
			content = literal ? t(content) : content;

			channel.startTyping(6);
			channel.send(content);
			channel.stopTyping(true);
		};
	},
	/**
	 * Uses the discord fetchMessage function trying to find the message.
	 * @async
	 * @function
	 * @param {object} bot - The Discord bot instance.
	 * @param {object} message - The message object.
	 * @param {string} guildID - The ID of the guild where the message is.
	 * @param {string} channelID - The ID of channel where the message is.
	 * @param {string} messageID - The message ID.
	 * @returns {object} - Null if it doesn't find the message.
	 */
	findMessage: async function(bot, message, guildID, channelID, messageID) {
		const GUILD = guildID === message.guild.id ? message.guild : bot.guilds.get(guildID);
		const CHANNEL = GUILD !== null ? channelID === message.channel.id ? message.channel : GUILD.channels.get(channelID) : null;
		//We don't want to give a lot of jobs to the bot without reason.
		if (CHANNEL !== null) {
			try {
				const MSG = await CHANNEL.fetchMessage(messageID);
				return MSG || null;
			} catch (e) {
				return null;
			}
		} else {
			return null;
		}
	}
};