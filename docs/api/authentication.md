# Authentication APIs

QueueIt uses short-lived JWT access tokens and rotating refresh tokens. Password flows require email verification where configured, and Google OAuth maps a verified Google identity to a QueueIt user.

## Endpoints

| Endpoint | Purpose | Auth | Success |
|---|---|---|---|
| `POST /api/v1/auth/register` | Create user and organization/customer context | Anonymous | `201` user plus tokens or verification required |
| `POST /api/v1/auth/login` | Authenticate with email/password | Anonymous | `200` tokens/session |
| `POST /api/v1/auth/logout` | Revoke current refresh token/session | Bearer | `204` |
| `POST /api/v1/auth/refresh` | Rotate refresh token and issue access token | Refresh token | `200` token pair |
| `POST /api/v1/auth/forgot-password` | Start reset email | Anonymous | `202` |
| `POST /api/v1/auth/reset-password` | Complete password reset | Reset token | `204` |
| `POST /api/v1/auth/email/verify` | Verify email token | Verification token | `204` |
| `POST /api/v1/auth/email/resend` | Resend verification | Bearer or anonymous email | `202` |
| `POST /api/v1/auth/password/change` | Change known password | Bearer | `204` |
| `GET /api/v1/auth/google` | Start Google OAuth | Anonymous | `302` |
| `GET /api/v1/auth/google/callback` | Complete Google OAuth | Anonymous | `302` or `200` |
| `GET /api/v1/auth/sessions` | List sessions/devices | Bearer | `200` |
| `DELETE /api/v1/auth/sessions/{sessionId}` | Revoke one session/device | Bearer | `204` |
| `POST /api/v1/auth/tokens/revoke` | Revoke refresh token family | Bearer | `204` |

## Example login request

```json
{ "email": "operator@example.com", "password": "correct horse battery staple", "deviceName": "Chrome on macOS" }
```

## Example token response

```json
{ "success": true, "data": { "accessToken": "eyJ...", "refreshToken": "rft_...", "expiresIn": 900, "tokenType": "Bearer", "sessionId": "64f1a0000000000000000999" }, "meta": { "requestId": "req_01H" } }
```
