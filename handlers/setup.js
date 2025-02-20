const { Client, GatewayIntentBits } = require("discord.js");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const cliColor = require("cli-color");
const axios = require("axios");
const fs = require("node:fs");

/* 
    NOTE:
    Do not put your credentials here!
*/

const questions = [
    "Entrez le nom de votre panel pterodactyl: ",
    "Entrez le lien du panel: ",
    "Entrez votre client api key: ",
    "Entrez le token de votre bot: ",
    "Entrez l'id du salon ou le bot enverra le message: "
];

const Question = {
    panelName: 0,
    panelUrl: 1,
    panelApiKey: 2,
    botToken: 3,
    channelId: 4,
}

const answers = [];

const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = function Setup() {
    console.log(cliColor.cyanBright("Bienvenue sur le bot PteroStats!"))
    console.log(cliColor.yellow("Please fill in the following credentials to set up the app.\n "));

    const askQuestion = (index) => {
        if (index < questions.length) {
            console.log(questions[index]);

            readline.question('> ', answer => {
                let isValid = true;

                if (index === Question.panelUrl && !isValidURL(answer)) {
                    console.log(cliColor.redBright('❌ URL du panel invalide. Veuillez saisir une URL valide. Exemple correcte: "https://panel.ultimedev.fr"'));
                    isValid = false;
                } else if (index === Question.panelApiKey && !/^(plcn_|ptlc_|peli_|ptla_)/.test(answer)) {
                    console.log(cliColor.redBright("❌ Client api key non valide. Il doit commencer par 'plcn_' ou 'ptlc_'."));
                    isValid = false;
                } else if (index === Question.channelId && !/^\d+$/.test(answer)) {
                    console.log(cliColor.redBright("❌ ID de salon invalide. Ce doit être un nombre."));
                    isValid = false;
                }

                if (index === Question.panelApiKey && /^(peli_|ptla_)/.test(answer)) console.log(cliColor.yellow("L'utilisation des clés API d'application est obsolète, vous devez utiliser les clés API client"));

                if (isValid) {
                    answers.push(isValidURL(answer) ? new URL(answer).origin : answer);
                    askQuestion(index + 1);
                } else {
                    askQuestion(index);
                }
            });
        } else {
            axios(`${new URL(answers[Question.panelUrl]).origin}/api/application/nodes?include=servers,location,allocations`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${answers[Question.panelApiKey]}`
                },
            }).then(() => {
                console.log(" \n" + cliColor.green("✓ Configuration panel validé."));
                const client = new Client({
                    intents: [GatewayIntentBits.Guilds]
                })

                client.login(answers[Question.botToken]).then(async () => {
                    console.log(cliColor.green("✓ Configuration token bot validé"));
                    client.channels.fetch(answers[Question.channelId]).then(() => {
                        console.log(cliColor.green("✓ Configuration du salon validé"));

                        fs.writeFileSync(".setup-complete", "Si vous souhaitez re-configuré le processus d'installation, vous pouvez supprimer ce fichier.", "utf8");

                        fs.writeFileSync(
                            ".env",
                            `PanelURL=${answers[Question.panelUrl]}\n` +
                            `PanelKEY=${answers[Question.panelApiKey]}\n` +
                            `DiscordBotToken=${answers[Question.botToken]}\n` +
                            `DiscordChannel=${answers[Question.channelId]}`,
                            "utf8"
                        );

                        fs.writeFileSync(
                            "config.yml",
                            fs.readFileSync("./config.yml", "utf8")
                                .replaceAll("Hosting Panel", answers[0])
                                .replaceAll("https://panel.example.com", answers[1]),
                            "utf-8"
                        );

                        console.log(" \n" + cliColor.green(`Configuration sauvegarder dans ${cliColor.blueBright(".env")} and ${cliColor.blueBright("config.yml")}.\n `));

                        require("./application.js")()
                    }).catch(() => {
                        console.log(cliColor.redBright("❌ ID de salon invalide."));
                        console.log(" \n" + cliColor.redBright("Recommencez la configuration et remplissez les informations d'identification correctes."));
                        process.exit()
                    })
                }).catch(() => {
                    console.log(cliColor.redBright("❌ Token du bot invalide."));
                    console.log(" \n" + cliColor.redBright("Recommencez la configuration et remplissez les informations d'identification correctes."));
                    process.exit()
                })
            }).catch((error) => {
                console.log(" \n" + cliColor.redBright("❌ URL du panel invalide."));
                if (error.code === "ENOTFOUND") {
                    console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("ENOTFOUND | DNS Error. Ensure your network connection and DNS server are functioning correctly."));
                } else if (error.code === "ECONNREFUSED") {
                    console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("ECONNREFUSED | Connection refused. Ensure the panel is running and reachable."));
                } else if (error.code === "ETIMEDOUT") {
                    console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("ETIMEDOUT | Connection timed out. The panel took too long to respond."));
                } else if (error.code === "ECONNRESET") {
                    console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("ECONNRESET | Connection reset by peer. The panel closed the connection unexpectedly."));
                } else if (error.code === "EHOSTUNREACH") {
                    console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("EHOSTUNREACH | Host unreachable. The panel is down or not reachable."));
                } else if (error.response) {
                    if (error.response.status === 401) {
                        console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("401 | Unauthorized. Invalid Application Key or API Key doesn't have permission to perform this action."));
                    } else if (error.response.status === 403) {
                        console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("403 | Forbidden. Invalid Application Key or API Key doesn't have permission to perform this action."));
                    } else if (error.response.status === 404) {
                        console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("404 | Not Found. Invalid Panel URL or the Panel doesn't exist."));
                    } else if (error.response.status === 429) {
                        console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("429 | Too Many Requests. You have sent too many requests in a given amount of time."));
                    } else if ([500, 502, 503, 504].includes(error.response.status)) {
                        console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright("500 | Internal Server Error. This is an error with your panel, PteroStats is not the cause."));
                    } else {
                        console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright(`${error.response.status} | Unexpected error: ${error.response.statusText}`));
                    }
                } else {
                    console.log(cliColor.cyanBright("[PteroStats] ") + cliColor.redBright(`Unexpected error: ${error.message}`));
                }
                console.log(" \n" + cliColor.redBright("Recommencez la configuration et remplissez les informations d'identification correctes."));
                process.exit()
            })
        }
    };

    askQuestion(0);
}