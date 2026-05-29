# Security Specification: Vector Motion Studio

## 1. Data Invariants
1. **UserProfile Integrity**: A user document under `/users/{userId}` can only be created or modified by the user themselves (`request.auth.uid == userId`). The `uid` in the payload must strictly match the authenticated UID.
2. **Owner Isolation for Logos**: A logo design under `/logos/{logoId}` can only be created, read, updated, or deleted by its creator. The `ownerId` field in the document must match the authenticated user's ID (`request.auth.uid == resource.data.ownerId` or `request.resource.data.ownerId`).
3. **Temporal Sanity**: `createdAt` is immutable after creation. Both `createdAt` (on create) and `updatedAt` (on update) must be secured using `request.time` (the Firestore server-side time) rather than client-provided timestamps.
4. **Verified Credentials**: All writes require `request.auth.token.email_verified == true` to prevent fraudulent access.
5. **No System Overwrites**: Clients cannot overwrite system recommended animations with invalid types.

---

## 2. The "Dirty Dozen" Vulnerability Payloads

Here are the 12 malicious payloads designed to bypass bounds, spoof users, or inject junk data:

### Payload 1: PII Identity Spoofing (Create profile for another user)
```json
// Target: /users/victimUserId (By attacker auth.uid = "attacker123")
{
  "uid": "victimUserId",
  "displayName": "Spoofed Victim",
  "email": "victim@domain.com",
  "createdAt": "2026-05-29T08:00:00Z"
}
```
*Expected: PERMISSION_DENIED* (Fails because `request.auth.uid` is `attacker123` instead of `victimUserId`).

### Payload 2: Logo Ownership Spoofing (Create logo with someone else's ownerId)
```json
// Target: /logos/logo999 (By attacker auth.uid = "attacker123")
{
  "ownerId": "victimUserId",
  "companyName": "STEAL ARCHITECTS",
  "tagline": "MINE NOW",
  "concept": "Intrusion",
  "hexColors": ["#000000"],
  "logoSvg": "<svg>...</svg>",
  "recommendedAnimation": "draw-in",
  "animationSettings": { "duration": 2 },
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```
*Expected: PERMISSION_DENIED* (Fails because `incoming().ownerId` is not equal to `request.auth.uid`).

### Payload 3: Blanket Read Attack (Listing all logos as signed-in user without filter)
Request filter: None (queries all `/logos`).
*Expected: PERMISSION_DENIED* (Fails because list rule requires checking that `resource.data.ownerId == request.auth.uid`).

### Payload 4: PII Blanket Read (Access victim's private profile)
Target path: `/users/victimUserId` (By attacker auth.uid = "attacker123").
*Expected: PERMISSION_DENIED* (Fails because read is restricted to `request.auth.uid == userId`).

### Payload 5: Temporal Fraud (Forge the creation time on creation)
```json
// Target: /logos/logo101 (By auth.uid = "user123")
{
  "ownerId": "user123",
  "companyName": "CHRONO TECH",
  "tagline": "TIME TRAVELER",
  "concept": "Metaphor",
  "hexColors": ["#FFFFFF"],
  "logoSvg": "<svg>...</svg>",
  "recommendedAnimation": "draw-in",
  "animationSettings": { "duration": 2 },
  "createdAt": "1999-12-31T23:59:59Z", // Forged client time
  "updatedAt": "request.time"
}
```
*Expected: PERMISSION_DENIED* (Fails because `incoming().createdAt` must equal `request.time`).

### Payload 6: Immutable CreatedAt Hack (Altering creation date during update)
```json
// Existing Document: createdAt = "2026-05-29T08:00:00Z"
// Target: /logos/logo101 (By auth.uid = "user123") - Update Payload:
{
  "ownerId": "user123",
  "companyName": "CHRONO TECH",
  "tagline": "TIME TRAVELER",
  "concept": "Metaphor",
  "hexColors": ["#FFFFFF"],
  "logoSvg": "<svg>...</svg>",
  "recommendedAnimation": "draw-in",
  "animationSettings": { "duration": 2 },
  "createdAt": "1999-12-31T23:59:59Z", // Attacker attempts to change creation year
  "updatedAt": "request.time"
}
```
*Expected: PERMISSION_DENIED* (Fails because update block enforces `incoming().createdAt == existing().createdAt`).

### Payload 7: Shadow Field Injection (Adding isPremium: true to bypass paywalls on profile)
```json
// Target: /users/user123 (By auth.uid = "user123")
{
  "uid": "user123",
  "displayName": "User One",
  "email": "user@domain.com",
  "createdAt": "request.time",
  "isPremium": true // Ghost field
}
```
*Expected: PERMISSION_DENIED* (Fails because key count constraint `keys().size() == 5` prohibits extra fields).

### Payload 8: Value Poisoning (Inject heavy 10MB string into an ID field)
```json
// Document ID path: `/logos/SOME_EXTREMELY_LARGE_JUNK_STRING_OF_10_MEGABYTES...`
```
*Expected: PERMISSION_DENIED* (Fails because `isValidId` restricts path variable size to `<=` 128 characters).

### Payload 9: Invalid Animation Transition Curve (Value poisoning easing selector)
```json
// Target: /logos/logo101 - Update Payload:
{
  "animationSettings": {
    "easing": "JUNK_CRASH_EASING_VALUE"
  }
}
```
*Expected: PERMISSION_DENIED* (Fails because `isValidLogo` validates that `animationSettings.easing` is one of the enum values).

### Payload 10: Anonymous Write Hijacking (Unauthenticated write)
Write request with `request.auth == null`
*Expected: PERMISSION_DENIED* (Fails signature check `isSignedIn()`).

### Payload 11: Unverified Email Hijack
Write request where `request.auth.token.email_verified == false`
*Expected: PERMISSION_DENIED* (Fails signature check `request.auth.token.email_verified == true`).

### Payload 12: Hostile Logo Ownership Takeover (Changing ownerId on update)
```json
// Target: /logos/logo101 (Existing ownerId = "user123") - Update Payload:
{
  "ownerId": "attacker123", // Attempting takeover
  "companyName": "CHRONO TECH",
  "tagline": "TIME TRAVELER",
  "concept": "Metaphor",
  "hexColors": ["#FFFFFF"],
  "logoSvg": "<svg>...</svg>",
  "recommendedAnimation": "draw-in",
  "animationSettings": { "duration": 2 },
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```
*Expected: PERMISSION_DENIED* (Fails because update rule checks `incoming().ownerId == existing().ownerId`).

---

## 3. Test Runner Shell Verification (`firestore.rules.test.ts`)
We will verify these policies via a standard Jest / Firebase emulator testing suite to assert that permissions are securely protected against malicious requests.
