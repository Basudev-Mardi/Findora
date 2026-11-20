const fs = require("fs");
const path = require("path");
const { pool, isDemoMode } = require("../config/db");
const {
  createSeedUsers,
  createSeedLostItems,
  createSeedFoundItems,
  createSeedClaims,
} = require("./seedData");

async function seedPostgres() {
  if (isDemoMode()) {
    console.log(
      "[findora-backend] Running in demo mode (no DATABASE_URL configured). Demo data is seeded automatically in memory."
    );
    return;
  }

  const schemaSql = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf8"
  );
  await pool.query(schemaSql);

  for (const user of createSeedUsers()) {
    await pool.query(
      `INSERT INTO users (id, full_name, campus_email, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        user.id,
        user.fullName,
        user.campusEmail,
        user.role,
        user.createdAt,
        user.updatedAt,
      ]
    );
  }

  for (const item of createSeedLostItems()) {
    await pool.query(
      `INSERT INTO lost_items (
         id, user_id, title, category, campus_zone, location, date_lost,
         public_description, private_identifying_details, image_url, status,
         submission_hash, created_at, updated_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO NOTHING`,
      [
        item.id,
        item.userId,
        item.title,
        item.category,
        item.campusZone,
        item.location,
        item.dateLost,
        item.publicDescription,
        item.privateIdentifyingDetails,
        item.imageUrl,
        item.status,
        item.submissionHash,
        item.createdAt,
        item.updatedAt,
      ]
    );
  }

  for (const item of createSeedFoundItems()) {
    await pool.query(
      `INSERT INTO found_items (
         id, user_id, title, category, campus_zone, location, date_found,
         public_description, private_verification_details, additional_notes,
         image_url, status, submission_hash, created_at, updated_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO NOTHING`,
      [
        item.id,
        item.userId,
        item.title,
        item.category,
        item.campusZone,
        item.location,
        item.dateFound,
        item.publicDescription,
        item.privateVerificationDetails,
        item.additionalNotes,
        item.imageUrl,
        item.status,
        item.submissionHash,
        item.createdAt,
        item.updatedAt,
      ]
    );
  }

  for (const claim of createSeedClaims()) {
    await pool.query(
      `INSERT INTO claims (
         id, item_type, lost_item_id, found_item_id, claimant_user_id,
         claimant_name, claimant_email, approximate_date_lost, location_lost,
         verification_details, additional_explanation, status, reviewer_notes,
         handover_confirmed_at, submission_hash, created_at, updated_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (id) DO NOTHING`,
      [
        claim.id,
        claim.itemType,
        claim.lostItemId,
        claim.foundItemId,
        claim.claimantUserId,
        claim.claimantName,
        claim.claimantEmail,
        claim.approximateDateLost,
        claim.locationLost,
        claim.verificationDetails,
        claim.additionalExplanation,
        claim.status,
        claim.reviewerNotes,
        claim.handoverConfirmedAt,
        claim.submissionHash,
        claim.createdAt,
        claim.updatedAt,
      ]
    );
  }

  console.log("[findora-backend] Neon PostgreSQL schema & seed data applied.");
}

if (require.main === module) {
  seedPostgres()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[findora-backend] Seed failed:", err.message);
      process.exit(1);
    });
}

module.exports = { seedPostgres };
