
export async function sendIpurNotification(message:string) {
    const IPUR = { "id": 1134914682, "is_bot": false, "first_name": "Ru", "last_name": "Pi", "username": "ruprupi", "language_code": "en" }
    const BOT_TOKEN = '7535837780:AAHfzpOb2jdX0rLydtGSt59k1TVyuJNYNN8'
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const res = await fetch(TELEGRAM_API_URL, {
            method: "POST",
            body: JSON.stringify({
                chat_id: IPUR.id,
                text: message,
            })
        })
        return true
    } catch (error) {
        return false
    }
}