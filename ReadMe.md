# enomic- A game of hacking heroes and villains

A weekend hack inspired by the [nomic game](http://legacy.earlham.edu/~peters/nomic.htm) and some of the comments on last week's [hacker news post](https://news.ycombinator.com/item?id=10056705). See the [code on Github](https://github.com/enomic/enomic).

_enomic is a self-governing web game that allows its players to modify and evolve the code and rules.__

This is a minimal implementation of the game. If the objectives are met, enomic could grow into a massive democratic communication app, not unlike wikipedia.

## Objectives
- Allow anybody to become a player, regardless of location, device, or physical disability
- Provide a free communication tool that allows players to voice their opinions and stories
- Implement education tools and content to educate players so they can vote effectively
- All rules and code should be freely available. Always strive for transparency
- Stand secure against villains who attempt to attack the game and detract from the objectives
- Offer a reliable reputation system to distinguish heroes from villains
- Build auth layers with other apps to cross-verify players' identity and external reputation
- The game should hold regular elections to vote on keyholders and heros
- Code and rules should be consistent, readable, secure, and durable

## How to Play

### Players
- Get node or io.js
- Fork and clone the [github repository](https://github.com/enomic/enomic), or [browse the code here](/master/).
- Install dependencies with `npm install`
- Run the app with `npm run server`
- Edit ANY of the code or rules- It's your job to accomplish the objectives!
- If you don't know where to start, look through the issues on github
- Commit with git, push to your fork
- Make pull request. Discuss on github to get approved
- Rebase regularly so the PR can be automatically merged

### Heroes
To become a hero:

- Run `node init.js` to generate your key pair
- Introduce yourself in a PR that adds your public key to the `heroIds.txt` file

An existing Hero must then:

- Get the pull request commit hash
- Sign the hash: `node sign.js <commit_hash>`
- Comment on the pull request with "#approve <signature>"
- If the commit can be merged without conflicts, the game will merge and deploy the PR

### Keyholder
- Can commit directly to the repo
- Use gmail account, heroku, and github logins to maintain the release server and keep the main site online

## Current Rules & Guidelines
The rules are simple: If you can do it, it is 'legal' to do it.

For guidelines about how to play: see [Guidelines](/docs/Guidelines.md)