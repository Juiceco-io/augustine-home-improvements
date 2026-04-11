/**
 * Cognito auth helper using amazon-cognito-identity-js.
 *
 * Handles: sign-in, sign-out, token refresh, session persistence,
 *          forgot-password (request code + confirm new password).
 * Tokens: ID token used for API Gateway authorization (the Cognito
 *         COGNITO_USER_POOLS authorizer validates the ID token, not the
 *         access token — access tokens lack the `aud` claim and are
 *         rejected with 401). Refresh token persisted in localStorage.
 *
 * Usage:
 *   await signIn("brandon@...", "password")
 *   const token = await getIdToken()   // auto-refreshes if expired
 *   signOut()
 *   await forgotPasswordRequest("brandon@...")
 *   await forgotPasswordConfirm("brandon@...", "123456", "NewPass1!")
 *
 * NOTE: getAccessToken() is kept as an alias for getIdToken() so callers
 * don't need to be updated; internally it always returns the ID token.
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "";
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "";

if (typeof window !== "undefined" && (!USER_POOL_ID || !CLIENT_ID)) {
  console.warn(
    "[auth] NEXT_PUBLIC_COGNITO_USER_POOL_ID or NEXT_PUBLIC_COGNITO_CLIENT_ID not set. Auth will not work."
  );
}

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});

let currentUser: CognitoUser | null = null;

export interface AuthUser {
  email: string;
  /** The Cognito ID token — use this for API Gateway Authorization headers. */
  idToken: string;
  /** @deprecated Alias for idToken. API GW COGNITO_USER_POOLS authorizers
   *  require the ID token (which carries the `aud` claim). Access tokens
   *  lack `aud` and are rejected with 401. */
  accessToken: string;
}

export function signIn(email: string, password: string): Promise<AuthUser> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess(session: CognitoUserSession) {
        currentUser = cognitoUser;
        const idToken = session.getIdToken().getJwtToken();
        resolve({
          email,
          idToken,
          // Keep accessToken populated for backward compat, but point it at
          // the ID token — API GW COGNITO_USER_POOLS authorizer requires the
          // ID token (has `aud` claim). Access tokens lack `aud` → 401.
          accessToken: idToken,
        });
      },
      onFailure(err) {
        reject(new Error(err.message ?? "Authentication failed"));
      },
      newPasswordRequired() {
        reject(
          new Error(
            "Password change required. Please use the AWS Console to set a permanent password."
          )
        );
      },
    });
  });
}

export function signOut(): void {
  const user = currentUser ?? userPool.getCurrentUser();
  if (user) {
    user.signOut();
    currentUser = null;
  }
}

/**
 * Returns the Cognito ID token for the current session (auto-refreshes if
 * expired). Use this in Authorization headers — API Gateway's
 * COGNITO_USER_POOLS authorizer validates the ID token, not the access token.
 */
export function getIdToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const user = currentUser ?? userPool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) return resolve(null);
      currentUser = user;
      resolve(session.getIdToken().getJwtToken());
    });
  });
}

/**
 * @deprecated Use getIdToken() instead. This alias exists so existing callers
 * continue to work without changes; it returns the ID token.
 */
export const getAccessToken = getIdToken;

/**
 * Returns the email from the current session's ID token payload.
 * Decoding the JWT is safe here because we trust the Cognito-issued token
 * (signature validation happens on the API GW side).
 * Falls back to getUsername() if the ID token isn't available yet.
 */
export function getCurrentUserEmail(): string | null {
  // Try to extract email from the in-memory session first.
  const user = currentUser ?? userPool.getCurrentUser();
  if (!user) return null;

  // Synchronously read the cached session from localStorage if available.
  // amazon-cognito-identity-js stores the last session tokens in localStorage
  // under CognitoIdentityServiceProvider.<clientId>.<username>.idToken
  // but there's no sync accessor. Use getUsername() as fallback — for user
  // pools with username_attributes=["email"] the stored value IS the email.
  // For pools where Cognito normalizes the username to UUID we decode the
  // token payload instead.
  const username = user.getUsername();
  // If it looks like a UUID (Cognito internal sub), try the token payload.
  if (/^[0-9a-f-]{36}$/i.test(username)) {
    try {
      const pool = (user as unknown as { pool: { storage: Record<string, string> } }).pool;
      const clientId = CLIENT_ID;
      const idTokenKey = `CognitoIdentityServiceProvider.${clientId}.${username}.idToken`;
      const raw = pool?.storage?.[idTokenKey] ?? (typeof localStorage !== "undefined" ? localStorage.getItem(idTokenKey) : null);
      if (raw) {
        const payload = JSON.parse(atob(raw.split(".")[1]));
        return payload.email ?? username;
      }
    } catch {
      // fall through
    }
  }
  return username;
}

/**
 * Step 1: Send a password-reset code to the user's verified email.
 */
export function forgotPasswordRequest(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.forgotPassword({
      onSuccess() {
        resolve();
      },
      onFailure(err) {
        reject(new Error(err.message ?? "Failed to send reset code"));
      },
    });
  });
}

/**
 * Step 2: Confirm the reset with the code + new password.
 */
export function forgotPasswordConfirm(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess() {
        resolve();
      },
      onFailure(err) {
        reject(new Error(err.message ?? "Failed to reset password"));
      },
    });
  });
}
