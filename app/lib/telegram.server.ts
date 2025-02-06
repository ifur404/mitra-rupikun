const API_TG = `https://api.telegram.org/`
const KV_TG_LAST_ID = "telegram_lastid"

export async function sendIpurNotification(message: string, token: string) {
    const IPUR = { "id": 1134914682, "is_bot": false, "first_name": "Ru", "last_name": "Pi", "username": "ruprupi", "language_code": "en" }
    const TELEGRAM_API_URL = `${API_TG}bot${token}/sendMessage`;

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

interface TelegramUpdate {
    update_id: number;
    message?: {
        message_id: number;
        from: {
            id: number;
            first_name: string;
            username?: string;
        };
        chat: {
            id: number;
            first_name: string;
            username?: string;
            type: string;
        };
        date: number;
        text?: string;
    };
}

interface TelegramResponse {
    ok: boolean;
    result: TelegramUpdate[];
}

export async function checkMessage(token: string): Promise<TelegramUpdate[]> {
    try {
        const response = await fetch(`${API_TG}bot${token}/getUpdates`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TelegramResponse = await response.json();

        if (!data.ok) {
            throw new Error("Telegram API returned an error");
        }

        return data.result;
    } catch (error) {
        console.error("Error fetching Telegram messages:", error);
        throw error;
    }
}

export async function getTelegramLastID(env: Env) {
    const cache = await env.KV.get(KV_TG_LAST_ID)
    if (cache) {
        return Number(cache) || 0
    }
    return 0
}

export async function setTelegramLastID(env: Env, value: string) {
    await env.KV.put(KV_TG_LAST_ID, value)
}

interface TelegramMessageResponse {
  ok: boolean;
  result: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      type: string;
    };
    date: number;
    text: string;
  };
}

export async function sendMessage(
  token: string,
  chatId: number | string,
  message: string,
  options: {
    parse_mode?: "HTML" | "MarkdownV2" | "Markdown";
    disable_notification?: boolean;
    protect_content?: boolean;
  } = {}
): Promise<TelegramMessageResponse> {
  try {
    // Create the base parameters
    const params: Record<string, string> = {
      chat_id: chatId.toString(),
      text: message,
    };

    // Add optional parameters if they are defined
    if (options.parse_mode) {
      params.parse_mode = options.parse_mode;
    }
    if (options.disable_notification !== undefined) {
      params.disable_notification = options.disable_notification.toString();
    }
    if (options.protect_content !== undefined) {
      params.protect_content = options.protect_content.toString();
    }

    const urlParams = new URLSearchParams(params);

    const response = await fetch(`${API_TG}bot${token}/sendMessage?${urlParams}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TelegramMessageResponse = await response.json();

    if (!data.ok) {
      throw new Error("Telegram API returned an error");
    }

    return data;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}
