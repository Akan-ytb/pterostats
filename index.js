const fs = require("node:fs");
const cliColor = require("cli-color");
const package = require("./package.json");
const axios = require("axios");
const errorLogging = require("./handlers/errorLogging.js");

process.stdout.write(cliColor.reset);
if (fs.existsSync("logs.txt")) {
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs")
    fs.renameSync("logs.txt", `logs/${Date.now()}.txt`);
}

console.log(
    `    _${cliColor.blueBright.bold(`${cliColor.underline("Ptero")}dact${cliColor.underline("yl & P")}eli${cliColor.underline("can")}`)}___    ______   ______   \n` +
    `   /\\  ___\\  /\\__  _\\ /\\  __ \\  /\\__  _\\ /\\  ___\\  \n` +
    `   \\ \\___  \\ \\/_ \\ \\/ \\ \\ \\_\\ \\ \\/_/\\ \\/ \\ \\___  \\ \n` +
    `    \\/\\_____\\   \\ \\_\\  \\ \\_\\ \\_\\   \\ \\_\\  \\/\\_____\\ \n` +
    `     \\/_____/    \\/_/   \\/_/\\/_/    \\/_/   \\/_____/${cliColor.yellowBright.bold(`${package.version}`)}`
);

console.log(
    ` \nCopyright © 2022 - ${new Date().getFullYear()} Akan X Solarydev\n ` +
    " \nDiscord: https://discord.gg/ultimedev" +
    " \n Source: https://github.com/Akan-ytb" +
    " \nLicense: https://github.com/Akan-ytb" +
    ` \n \n${package.description}\n `
);

axios.get("https://github.com/Akan-ytb/pterostats").then(response => {
    if (response.data && response.data.version !== package.version) console.log(
        cliColor.yellowBright(`+============================================================+\n`) +
        `              Update available: ${package.version} → ${cliColor.green(response.data.version)}\n` +
        `  Download at ${cliColor.blueBright("https://github.com/Akan-ytb/pterostats")} to update.\n` +
        cliColor.redBright(`   Make sure to backup ${cliColor.blueBright("config.yml")} and ${cliColor.blueBright(".env")} before updating.\n`) +
        cliColor.yellowBright(`+============================================================+`)
    )
}).catch(error => console.log(`${cliColor.cyanBright("[PteroStats]")} ${cliColor.redBright("Failed to check for updates.")}`));

if (!fs.existsSync(".env") || !fs.existsSync(".setup-complete")) return require("./handlers/setup.js")();

process.on('uncaughtException', (error) => errorLogging(error))
process.on('unhandledRejection', (error) => errorLogging(error))

require("./handlers/application.js")();