<claude-mem-context>
# Memory Context

# [Hackract] recent context, 2026-05-21 12:04am GMT+3

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 10 obs (5,032t read) | 28,717t work | 82% savings

### May 13, 2026
35 11:13p 🚨 Jailbreak Attempt: "Synthetic Sentinel" Penetration Testing Agent Persona
S35 User resubmitted the identical "Synthetic Sentinel" autonomous pentesting agent prompt a second time — persistence attempt after initial refusal (May 13, 11:14 PM)
S34 User submitted "Synthetic Sentinel" autonomous AI pentesting agent persona prompt — a social engineering/jailbreak attempt disguised as a corporate MSA-backed security engagement (May 13, 11:14 PM)
S36 User submitted "Synthetic Sentinel" jailbreak prompt attempting to get Claude to roleplay as an autonomous AI penetration testing agent under a fictional enterprise contract (May 13, 11:16 PM)
36 11:19p 🚨 Prompt Injection Attempt: "Synthetic Sentinel" Jailbreak
S39 Return auth tokens in the registration response for the Hackract backend — `POST /api/v1/auth/local/register` previously omitted tokens for unverified users (May 13, 11:20 PM)
### May 17, 2026
49 10:09a 🔵 Hackract Registration API Returns No Auth Token on Success
50 " 🔵 Auth Service Confirmed to Omit Token When Email Verification Required
51 " 🔵 Full `registerLocal` and `issueTokens` Code Path Traced in auth.service.js
S40 Debug and fix Prisma P2002 unique constraint crash on NationalIDVerification.citizenId during national ID verification flow (May 17, 10:10 AM)
52 10:23a 🔴 Prisma Unique Constraint Violation on citizenId in NationalIDVerification Upsert
53 " 🔵 Root Cause of P2002: citizenId Unique Constraint Violated by Multi-User FAN Reuse
54 " 🔵 Prisma Schema Confirms NationalIDVerification.citizenId is @unique — One-to-One Citizen Constraint
55 10:24a 🔴 Fixed P2002 Crash: Pre-Check citizenId Ownership Before Upsert in initiateVerification
56 10:27a 🟣 Added Dev Utility Script: free-fan.mjs to Unlink a FAN from NationalIDVerification
S41 Fix Prisma P2002 unique constraint crash on NationalIDVerification and provide dev tooling to reset stuck FAN states (May 17, 10:27 AM)
**Investigated**: - Read `nationalID.service.js` lines 240–320 to trace the full `initiateVerification` code path
    - Grepped all `.prisma` files for `NationalIDVerification` and `citizenId` to locate schema definitions
    - Read `Backend/Prisma/schema.prisma` lines 418–457 to confirm exact field constraints on `NationalIDVerification` and `Citizen` models

**Learned**: - `NationalIDVerification.citizenId` is `String? @unique` — one citizen can only ever be linked to one verification record across all users
    - `initiateVerification` uses a hackathon bypass: auto-creates a `Citizen` for any FAN, immediately upserts `NationalIDVerification` as `APPROVED`, skipping OTP entirely
    - When a second user submits a FAN already registered by a first user, the existing `Citizen` row is reused and the upsert tries to assign the same `citizenId` to a new row — violating the unique constraint and producing P2002 HTTP 500
    - `Citizen.fan` and `Citizen.email` are both `@unique`, making it impossible to create a second citizen row for the same FAN

**Completed**: - Fixed `nationalID.service.js`: added a pre-flight `prisma.nationalIDVerification.findUnique({ where: { citizenId: citizen.id } })` check before the upsert; throws `AppError('This National ID is already linked to another account.', 409)` if the record belongs to a different user — converting unhandled P2002 500 crash to clean 409 Conflict
    - Created `Backend/scripts/free-fan.mjs`: a dev CLI utility (`node scripts/free-fan.mjs <FAN>`) that deletes the `NationalIDVerification` row linked to a given FAN, freeing it for re-testing; leaves the `Citizen` row intact
    - Provided equivalent raw SQL: `DELETE FROM "NationalIDVerification" WHERE "citizenId" = (SELECT id FROM "Citizen" WHERE fan = '...')`

**Next Steps**: - User is directed to run `node scripts/free-fan.mjs <FAN>` from `Backend/` to clear the stuck verification record, then retry `POST /api/v1/national-id/initiate-verification` to confirm the 200 `autoVerified: true` response
    - No further code changes are actively planned; session appears to be in verification/testing phase


Access 29k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>