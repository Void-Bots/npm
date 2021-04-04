const EventEmitter = require("events");
const fetch = require("node-fetch");
const baseURL = "https://api.voidbots.net";

const isLib = (library, client) => {
  try {
    const lib = require(library);
    return lib && client instanceof lib.Client;
  } catch (e) {
    return false;
  }
};

const isASupportedLibrary = (client) => isLib("discord.js", client) || isLib("eris", client);

class VoidBots extends EventEmitter {
	
	
   static version = require("./package.json").version;

   /**
   * Creates a new VoidBots instance.
   * @param {string} token Your VoidBots.net token.
   * @param {Object} [options] Your VoidBotsAPI options.
   * @param {number} [options.statsInterval=1800000] How often the autoposter should post stats in milliseconds. May not be smaller than 900000 and defaults to 1800000.
   * @param {boolean} [options.webhookEnabled=false] Whether the webhook server is enabled
   * @param {any} [client] Your Client instance, if present and supported it will auto update your stats every `options.statsInterval` ms.
   */
    constructor(token, options, client) {
      super();
      if (typeof token !== "string") throw new TypeError("Argument 'token' must be a string");
      Object.defineProperty(this, "token", {
        value: token,
        enumerable: false,
        writable: true,
        configurable: true
      });
      if (isASupportedLibrary(options)) {
        client = options;
        options = {};
      }
      this.options = options ?? {};
      if (!(client && isASupportedLibrary(client))) throw "Argument 'client' must be a client instance of a supported library (Discord.js or Eris)";
      if (typeof this.options.statsInterval !== "number") this.options.statsInterval = 1800000;
      if (this.options.statsInterval < 900000) throw new RangeError("'options.statsInterval' may not be shorter than 900000 milliseconds (15 minutes)");

      /**
       * Event that fires when the stats have been posted successfully by the autoposter.
       * @event posted
       */

      /**
       * Event to notify that the autoposter request failed.
       * @event error
       * @param {Error} error The error
       */

      this.client = client;
      this.client.once("ready", async () => {
        this.checkAuth()
        if(this.options.webhookEnabled) this._webhookServer();
        async function post(vbClass) {
          return vbClass.postStats()
          .then(() => vbClass.emit("posted"))
          .catch((e) => vbClass.emit("error", e));
        }
        post(this);
        setInterval(post, this.options.statsInterval);
      });
    }
	
    /**
     * Post stats to Void Bots.
     * @param {number|number[]} serverCount The server count of your bot.
     * @param {number} [shardCount] The count of all shards of your bot.
     * @returns {string}
     */
    async postStats(serverCount, shardCount = 0) {
      this.tokenAvailable();
      if (!this.client) {
        if (typeof serverCount !== "number") throw new TypeError("[VoidBots → postStats()] Argument 'serverCount' must be a number.");
        if (typeof shardCount !== "number") throw new TypeError("[VoidBots → postStats()] Argument 'shardCount' must be a number.");
      }
      const data = {
        server_count: this.client ? (this.client.guilds.size ?? this.client.guilds.cache.size) : serverCount,
        shard_count: this.client?.shards?.size > 1 ? this.client?.shard?.count : shardCount
      };

      return this._request(`/bot/stats/${this.client.user.id}`, "POST", data).then((res) => res.text());
    }
	
    /**
     * Returns true if a user has voted for your bot in the last 12 hours.
     * @param {string} id The ID of the user to check for.
     * @returns {string} The JSON content from the API.
     */
    async hasVoted(id) {
      this.tokenAvailable();
      return this._request(`/bot/voted/${this.client.user.id}/${id}`, "GET").then((res) => res.text());
    }
    async checkAuth() {
      this.tokenAvailable();
      let data = await this._get(`/bot/info/${this.client.user.id}`, "GET").then((res) => res.json());
      if (data.message === 'Invalid authorization key provided') throw Error('Token is not valid')
    }

    async getBotInfo(id) {
      this.tokenAvailable();
      return this._request(`/bot/info/${id}`, "GET").then((res) => res.json());
    }

    async getReviews() {
      this.tokenAvailable();
      return this._request(`/bot/reviews/${this.client.user.id}`).then((res) => res.json());
    }

    async getAnalytics() {
      this.tokenAvailable();
      return this._request(`/bot/analytics/${this.client.user.id}`).then((res) => res.json());
    }

    async _webhookServer() {
      if(this.Fudshjifgsdujytfryoiklajsdhnigdtswkuidfhbjsrfytusahkjhvf_FireOnce) throw Error('This function may only be run once.');
      this.Fudshjifgsdujytfryoiklajsdhnigdtswkuidfhbjsrfytusahkjhvf_FireOnce = true;
      let localtunnel, express;
      try {
        localtunnel = require('localtunnel'), express = require('express');
      } catch (err) {
        throw Error('Error while requiring packages (localtunnel, express)')
      }
      const app = express(), port = 5600
      app.use(express.json())
      let tunnel = await localtunnel({ port: port })
      this.voteWebhook = { url: `${tunnel.url}/vote`, auth: this._createKey(36) }
      this._request(`/bot/votewebhook/${this.client.user.id}`, 'POST', { webhook_url: this.voteWebhook.url, webhook_auth: this.voteWebhook.auth });
      app.post('/vote', async (req, res, next) => {
        if (req.header('Authorization') !== this.voteWebhook.auth) return res.status(401).end();
        this.emit('voted', req.body);
        res.status(200).end();
      });
      app.listen(port, async () => { console.log(`Webhook server initialized`) });
    }

    _createKey(len=44) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < len; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
    }

   _request(url, type = "POST", data = {}) {
    return fetch(`${baseURL}${url}`, {
      method: type,
      headers: { 
        Authorization: this.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
   }
   _get(url) {
    return fetch(`${baseURL}${url}`, {
      method: 'GET',
      headers: { 
        Authorization: this.token,
        "Content-Type": "application/json"
      },
    })
   }

   tokenAvailable() {
     if (!this.token) throw new ReferenceError("No VoidBots token found in this instance.");
     this.checkAuth
     return true;
   }

}

module.exports = VoidBots;
