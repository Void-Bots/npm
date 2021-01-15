const EventEmitter = require('events');
const fetch = require("node-fetch");

const isLib = (library, client) => {
  try {
    const lib = require.cache[require.resolve(library)];
    return lib && client instanceof lib.exports.Client;
  } catch (e) {
    return false;
  }
};

const isASupportedLibrary = client => isLib('discord.js', client) || isLib('eris', client);

class VoidBots extends EventEmitter {
   /**
   * Creates a new VoidBots Instance.
   * @param {string} token Your voidbots.net token for this bot.
   * @param {Object} [options] Your VBAPI options.
   * @param {number} [options.statsInterval=1800000] How often the autoposter should post stats in ms. May not be smaller than 900000 and defaults to 1800000.
   * @param {any} [client] Your Client instance, if present and supported it will auto update your stats every `options.statsInterval` ms.
   */
	constructor(token, options, client) {
    super();
    this.token = token;
    if(isASupportedLibrary(options)) {
      client = options;
      options = {};
    }
    this.options = options || {};

    if (client && isASupportedLibrary(client)) {
      if (!this.options.statsInterval) this.options.statsInterval = 1800000;
      if (this.options.statsInterval < 900000) throw new Error('statsInterval may not be shorter than 900000 (15 minutes)');

      /**
       * Event that fires when the stats have been posted successfully by the autoposter
       * @event posted
       */

      /**
       * Event to notify that the autoposter post request failed
       * @event error
       * @param {error} error The error
       */

      this.client = client;
      this.client.on('ready', () => {
        this.postStats()
          .then(() => this.emit('posted'))
          .catch(e => this.emit('error', e));
        setInterval(() => {
          this.postStats()
            .then(() => this.emit('posted'))
            .catch(e => this.emit('error', e));
        }, this.options.statsInterval);
      });
    } else if (client) {
      console.error(`[voidbots autopost] The provided client is not supported. Please add an issue or pull request to the github repo https://github.com/TheVoidDevs/VoidBots-NPM`); // eslint-disable-line no-console
    }

  }
	
    /**
     * Post Stats to Void Bots.
     * @param {number|number[]} serverCount The server count of your bot.
     * @param {number} [shardCount] The count of all shards of your bot.
     * @returns {string}
     */
    async postStats(serverCount, shardCount = 0) {
		  if(!serverCount) throw new Error('[voidbots] postStats: missing "serverCount"');
		  const data = {};
		
      if(serverCount) {
        data.server_count = serverCount;
        data.shard_count = shardCount;
      } else {
        data.server_count = this.client.guilds.size || this.client.guilds.cache.size;
        if (this.client.shards && this.client.shards.size !== 1) {
          data.shard_count = this.client.shard.count;
        }
      }
      
      if(!this.token) return console.warn('[voidbots] Warning: No VB token has been provided.');

      const res = await fetch(`https://api.voidbots.net/bot/stats/${this.client.user.id}`, {
        method: "POST",
        headers: { 
          Authorization: `${this.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const response = await res.text();

      return response;
    }
	
    /**
     * Returns true if a user has voted for your bot in the last 12h.
     * @param { string } id - The ID of the user to check for.
     * @returns { string } The json content from the api.
     */
    async hasVoted(id) {
      if(!this.token) return console.warn('[voidbots] Warning: No VB token has been provided.');
      const res = await fetch(`https://api.voidbots.net/bot/voted/${this.client.user.id}/${id}`, { headers: { 
        Authorization: `${this.token}`,
        "Content-Type": "application/json"
      }});
      return res.text();
    }

    async getBotInfo(id) {
      if(!this.token) return console.warn('[voidbots] Warning: No VB token has been provided.');
      const res = await fetch(`https://api.voidbots.net/bot/info/${id}`, {
        method: "GET",
        headers: {
          Authorization: `${this.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const response = await res.json();

      return response;
    }

    async getReviews() {
      if(!this.token) return console.warn('[voidbots] Warning: No VB token has been provided.');

      const res = await fetch(`https://api.voidbots.net/bot/reviews/${this.client.user.id}`, {
        method: "POST",
        headers: { 
          Authorization: `${this.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const response = await res.json();

      return response;
    }

    async getAnalytics() {
      if(!this.token) return console.warn('[voidbots] Warning: No VB token has been provided.');

      const res = await fetch(`https://api.voidbots.net/bot/analytics/${this.client.user.id}`, {
        method: "POST",
        headers: { 
          Authorization: `${this.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const response = await res.json();

      return response;
    }


}
module.exports = VoidBots;