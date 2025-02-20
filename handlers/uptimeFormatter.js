module.exports = function uptimeFormatter(time) {
    let text = []
    const days = Math.floor(time / 86400000);
    const hours = Math.floor(time / 3600000) % 24;
    const minutes = Math.floor(time / 60000) % 60;
    const seconds = Math.floor(time / 1000) % 60;
    if (days > 0) text.push(`${days} jours`)
    if (hours > 0) text.push(`${hours} heures`)
    if (minutes > 0) text.push(`${minutes} minutes`)
    if (text.length > 0) text.push(`and ${seconds} secondes`)
    else text.push(`${seconds} secondes`)
    return text.join(", ").replace(", and", " and")
}
