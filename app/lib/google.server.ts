interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  verified_email: boolean;
}

async function exchangeAuthCodeForToken(authCode: string, env: Env) {
  const data = {
    code: authCode,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_REDIRECT_URL,
    grant_type: 'authorization_code'
  };

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(data) // converts the object to x-www-form-urlencoded format
  });

  const result: any = await response.json();

  if (response.ok) {
    return result.access_token
  }
  return ""
};
export async function getAccountInfo(code: string, env: Env) {
  const access = await exchangeAuthCodeForToken(code, env)

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });
  const data: GoogleProfile = await userInfoResponse.json()
  const userProfile = data;
  return userProfile
}