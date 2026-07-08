const TOKEN_KEY = "manthanx_token";

export function saveToken(token: string) {
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function getToken(): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${TOKEN_KEY}=([^;]+)`));
  return match ? match[2] : null;
}

export function clearToken() {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}