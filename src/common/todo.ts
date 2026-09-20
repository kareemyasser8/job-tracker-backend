// TODO: [isVerified + scoped visibility]
// 1. createSource (and equivalents in Company/Role/Technology services):
//    - Stop trusting `ownerId` from the DTO. Derive it from the authenticated
//      user (req.user.id) for normal user-created records.
//    - Set `isVerified: !ownerId` at creation time — true only when no owner
//      is present (i.e. seeded/admin-created global records), false otherwise.
//    - Only an admin/seed-only path should be allowed to create a record with
//      no ownerId (and therefore isVerified: true) — never expose this via the
//      public create endpoint.
//
// 2. findAll / getAll in EVERY module that follows this owner pattern
//    (Source, Company, Role, Technology):
//    - Currently returns ALL rows unscoped — this leaks other users'
//      unverified data.
//    - Add `where: { OR: [{ isVerified: true }, { ownerId: currentUserId }] }`
//      so results are limited to: (a) verified/seeded global records, and
//      (b) the requesting user's own records.
//    - Apply the same scoping to findOne so a user can't fetch another
//      user's unverified record directly by id either.
//
// 3. updateOne:
//    - Prevent ownerId reassignment via client input; if ownership can change
//      at all, recompute isVerified accordingly instead of leaving it stale.
//
// Audit all modules with this ownerId pattern (Source, Company, Role,
// Technology) — apply consistently, don't just fix Source.