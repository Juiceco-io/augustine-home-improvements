/**
 * Cognito auth helper using amazon-cognito-identity-js.
 *
 * Handles: sign-in, sign-out, token refresh, session persistence.
 * Tokens: access token in memory, refresh token in localStorage.
 *
 * Usage:
 *   await signIn("brandon@...", "password")
 *   const token = await getAccessToken()   // auto-refreshes if expired
 *   signOut()
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID as string;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID as string;

if (!USER_POOL_ID || !CLIENT_ID) {
  console.warn(
    "[auth] VITE_COGNITO_USER_POOL_ID or VITE_COGNITO_CLIENT_ID not set. Auth will not work."
  );
}

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID ?? "",
  ClientId: CLIENT_ID ?? "",
});

let currentUser: CognitoUser | null = null;

export interface AuthUser {
  email: string;
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
        resolve({
          email,
          accessToken: session.getAccessToken().getJwtToken(),
        });
      },
      onFailure(err) {
        reject(new Error(err.message ?? "Authentication failed"));
      },
      newPasswordRequired() {
        reject(new Error("Password change required. Please use the AWS Console to set a permanent password."));
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

export function getAccessToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const user = currentUser ?? userPool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) return resolve(null);
      currentUser = user;
      resolve(session.getAccessToken().getJwtToken());
    });
  });
}

export function getCurrentUserEmail(): string | null {
  const user = currentUser ?? userPool.getCurrentUser();
  return user?.getUsername() ?? null;
}
