# VoidBots-NPM
An official module for interacting with the voidbots.net API

## Installation
`npm install voidbots`

## Documentation
Documentation can be found [here](https://docs.voidbots.net/)

## Example

### Example of posting server count with supported libraries (Discord.js and Eris)
```js
const Discord = require("discord.js");
const client = new Discord.Client();
const VoidBotsClient = require("voidbots");
const voidbots = new VoidBotsClient('Your voidbots.net token', { autoPost: true, webhookEnabled: true }, client);

// Optional events
voidbots.on('posted', () => {
  console.log('Server count posted!');
})

voidbots.on('error', e => {
 console.log(`Oops! ${e}`);
})

voidbots.on('voted', data => {
  console.log(`${data.user} has voted for ${data.bot}`)
})
```
