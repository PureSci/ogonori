import { Message } from "discord.js";
import bridge from "../utils/bridge.js";

export function filter(message: Message) {
    return message.embeds?.[0]?.title?.includes("(Sort By: Wishlist)")
        || message.embeds?.[0]?.title == "WISHLIST LEADERBOARD - CHARACTERS"
        || message.embeds?.[0]?.title == "WISHLIST LEADERBOARD - SERIES"
        || message.embeds?.[0]?.description?.includes("Cards Collected:")
        || message.embeds?.[0]?.description?.includes("Card ID:");
}

export function run(message: Message) {
    if (message.embeds?.[0]?.title?.includes("(Sort By: Wishlist)")) {
        let rows = message.embeds[0].description!.split("\n");
        rows.forEach(row => {
            bridge.updateCard({
                wl: parseInt(row.split("> `")[1].split("`")[0].trim()),
                name: row.split("**")[1].split("**")[0].trim(),
                series: row.split("•  *")[1].split("*")[0].trim()
            });
        });
    } else if (message.embeds?.[0]?.title == "WISHLIST LEADERBOARD - CHARACTERS") {
        let rows = message.embeds[0].description?.split("\n");
        rows?.forEach(row => {
            bridge.updateCard({
                wl: parseInt(row.split("> `")[1].split("`")[0]),
                name: row.split("` • **")[1].split("** • *")[0],
                series: row.split("** • *")[1].split("*")[0]
            });
        });
    } else if (message.embeds?.[0]?.title == "WISHLIST LEADERBOARD - SERIES") {
        let rows = message.embeds[0].description?.split("\n");
        rows?.forEach(row => {
            bridge.updateSeries({
                wl: parseInt(row.split("> `")[1].split("`")[0]),
                series: row.split("` • **")[1].split("**")[0]
            });
        });
    } else if (message.embeds?.[0]?.description?.includes("Cards Collected:")) {
        let rows = message.embeds[0].fields[0].value.split("\n");
        let series = message.embeds[0].title!;
        rows?.forEach(row => {
            bridge.updateCard({
                wl: parseInt(row.split("❤️ `")[1].split("`")[0].trim()),
                name: row.split("**")[1].split("**")[0].trim(),
                series: series
            });
        });
        if (!series) return;
        bridge.updateSeries({
            wl: parseInt(message.embeds[0].description.split("*Total Wishlist:* **")[1].split("**")[0].trim()),
            series: series
        });
    } else if (message.embeds?.[0]?.description?.includes("Card ID:")) {
        let rows = message.embeds[0].description?.split("\n").filter(x => x.trim().length !== 0);
        if (!rows) return;
        bridge.updateCharacterData({
            series: rows[0].split("**")[2].trim(),
            name: message.embeds[0].title!,
            category: rows[1].split("**")[2].trim(),
            wl: parseInt(rows[2].split("➜** `")[1].split("`")[0].trim()),
            generated: parseInt(rows[3].split("➜** `")[1].split("`")[0].trim()),
            burned: parseInt(rows[4].split("➜** `")[1].split("`")[0].trim()),
            threed: parseInt(rows[5].split("➜** `")[1].split("`")[0].trim()),
            id: rows[rows.length - 1].split("** `")[1].split("`")[0].trim()
        });
    }
}