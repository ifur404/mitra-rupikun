
export async function sendIpurNotification(message:string, token:string) {
    const IPUR = { "id": 1134914682, "is_bot": false, "first_name": "Ru", "last_name": "Pi", "username": "ruprupi", "language_code": "en" }
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${token}/sendMessage`;
    
    try {
        const res = await fetch(TELEGRAM_API_URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
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