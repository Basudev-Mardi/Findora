const crypto = require("crypto");
const { isDemoMode, query } = require("../config/db");
const { demoStore } = require("./demoStore");
const { AppError } = require("../utils/AppError");
const { computeSubmissionHash } = require("../utils/validators");

function toPublicFoundItem(row) {
  return {
    id: row.id,
    itemType: "found",
    userId: row.user_id ?? row.userId ?? null,
    title: row.title,
    category: row.category,
    campusZone: row.campus_zone ?? row.campusZone,
    location: row.location,
    dateFound:
      row.date_found instanceof Date
        ? row.date_found.toISOString().slice(0, 10)
        : row.date_found ?? row.dateFound,
    publicDescription: row.public_description ?? row.publicDescription,
    additionalNotes: row.additional_notes ?? row.additionalNotes ?? null,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    status: row.status,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at ?? row.createdAt,
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : row.updated_at ?? row.updatedAt,
  };
}

function applyDemoFilters(items, filters) {
  const search = filters.search.toLowerCase();

  return items
    .filter((item) => {
      if (search) {
        const haystack =
          `${item.title} ${item.publicDescription} ${item.category} ${item.campusZone} ${item.location}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (
        filters.category &&
        item.category.toLowerCase() !== filters.category.toLowerCase()
      ) {
        return false;
      }
      if (
        filters.location &&
        !`${item.campusZone} ${item.location}`
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      if (filters.status && item.status !== filters.status) return false;
      if (filters.dateFrom && item.dateFound < filters.dateFrom) return false;
      if (filters.dateTo && item.dateFound > filters.dateTo) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "oldest") {
        return a.dateFound.localeCompare(b.dateFound) || a.createdAt.localeCompare(b.createdAt);
      }
      return b.dateFound.localeCompare(a.dateFound) || b.createdAt.localeCompare(a.createdAt);
    });
}

const foundItemsModel = {
  async findAll(filters) {
    if (isDemoMode()) {
      return applyDemoFilters(demoStore.foundItems, filters).map(toPublicFoundItem);
    }

    const conditions = [];
    const params = [];

    if (filters.search) {
      params.push(`%${filters.search}%`);
      const idx = params.length;
      conditions.push(
        `(title ILIKE $${idx} OR public_description ILIKE $${idx} OR location ILIKE $${idx} OR campus_zone ILIKE $${idx})`
      );
    }
    if (filters.category) {
      params.push(filters.category);
      conditions.push(`LOWER(category) = LOWER($${params.length})`);
    }
    if (filters.location) {
      params.push(`%${filters.location}%`);
      const idx = params.length;
      conditions.push(`(campus_zone ILIKE $${idx} OR location ILIKE $${idx})`);
    }
    if (filters.status) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filters.dateFrom) {
      params.push(filters.dateFrom);
      conditions.push(`date_found >= $${params.length}`);
    }
    if (filters.dateTo) {
      params.push(filters.dateTo);
      conditions.push(`date_found <= $${params.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderDirection = filters.sort === "oldest" ? "ASC" : "DESC";

    const sql = `
      SELECT id, user_id, title, category, campus_zone, location, date_found,
             public_description, additional_notes, image_url, status,
             created_at, updated_at
      FROM found_items
      ${whereClause}
      ORDER BY date_found ${orderDirection}, created_at ${orderDirection}
    `;

    const result = await query(sql, params);
    return result.rows.map(toPublicFoundItem);
  },

  async findById(id) {
    if (isDemoMode()) {
      const found = demoStore.foundItems.find((item) => item.id === id);
      return found ? toPublicFoundItem(found) : null;
    }

    const result = await query(
      `SELECT id, user_id, title, category, campus_zone, location, date_found,
              public_description, additional_notes, image_url, status,
              created_at, updated_at
       FROM found_items
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? toPublicFoundItem(result.rows[0]) : null;
  },

  async findPrivateById(id) {
    if (isDemoMode()) {
      const found = demoStore.foundItems.find((item) => item.id === id);
      if (!found) return null;
      return {
        ...toPublicFoundItem(found),
        privateVerificationDetails: found.privateVerificationDetails ?? null,
      };
    }

    const result = await query(
      `SELECT id, user_id, title, category, campus_zone, location, date_found,
              public_description, private_verification_details, additional_notes,
              image_url, status, created_at, updated_at
       FROM found_items
       WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;
    return {
      ...toPublicFoundItem(result.rows[0]),
      privateVerificationDetails:
        result.rows[0].private_verification_details ?? null,
    };
  },

  async create(data) {
    const id = `found-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const submissionHash = computeSubmissionHash([
      "found",
      data.title,
      data.category,
      data.campusZone,
      data.dateFound,
    ]);

    if (isDemoMode()) {
      const duplicate = demoStore.foundItems.find(
        (item) => item.submissionHash === submissionHash
      );
      if (duplicate) {
        throw new AppError(
          "A duplicate found item report with the same title, category, zone, and date already exists.",
          409
        );
      }

      const record = {
        id,
        userId: data.userId ?? null,
        title: data.title,
        category: data.category,
        campusZone: data.campusZone,
        location: data.location,
        dateFound: data.dateFound,
        publicDescription: data.publicDescription,
        privateVerificationDetails: data.privateVerificationDetails ?? null,
        additionalNotes: data.additionalNotes ?? null,
        imageUrl: data.imageUrl ?? null,
        status: data.status || "available",
        submissionHash,
        createdAt: now,
        updatedAt: now,
      };
      demoStore.foundItems.unshift(record);
      return toPublicFoundItem(record);
    }

    const result = await query(
      `INSERT INTO found_items (
         id, user_id, title, category, campus_zone, location, date_found,
         public_description, private_verification_details, additional_notes,
         image_url, status, submission_hash, created_at, updated_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id, user_id, title, category, campus_zone, location, date_found,
                 public_description, additional_notes, image_url, status,
                 created_at, updated_at`,
      [
        id,
        data.userId ?? null,
        data.title,
        data.category,
        data.campusZone,
        data.location,
        data.dateFound,
        data.publicDescription,
        data.privateVerificationDetails ?? null,
        data.additionalNotes ?? null,
        data.imageUrl ?? null,
        data.status || "available",
        submissionHash,
        now,
        now,
      ]
    );
    return toPublicFoundItem(result.rows[0]);
  },

  async update(id, updates) {
    const now = new Date().toISOString();

    if (isDemoMode()) {
      const index = demoStore.foundItems.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const existing = demoStore.foundItems[index];
      const merged = {
        ...existing,
        ...updates,
        updatedAt: now,
      };
      merged.submissionHash = computeSubmissionHash([
        "found",
        merged.title,
        merged.category,
        merged.campusZone,
        merged.dateFound,
      ]);

      const duplicate = demoStore.foundItems.find(
        (item) => item.id !== id && item.submissionHash === merged.submissionHash
      );
      if (duplicate) {
        throw new AppError(
          "Another found item report with these exact details already exists.",
          409
        );
      }

      demoStore.foundItems[index] = merged;
      return toPublicFoundItem(merged);
    }

    const existing = await this.findById(id);
    if (!existing) return null;

    const merged = {
      title: updates.title ?? existing.title,
      category: updates.category ?? existing.category,
      campusZone: updates.campusZone ?? existing.campusZone,
      location: updates.location ?? existing.location,
      dateFound: updates.dateFound ?? existing.dateFound,
      publicDescription: updates.publicDescription ?? existing.publicDescription,
      additionalNotes:
        updates.additionalNotes !== undefined
          ? updates.additionalNotes
          : existing.additionalNotes,
      imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : existing.imageUrl,
      status: updates.status ?? existing.status,
    };

    const submissionHash = computeSubmissionHash([
      "found",
      merged.title,
      merged.category,
      merged.campusZone,
      merged.dateFound,
    ]);

    const params = [
      merged.title,
      merged.category,
      merged.campusZone,
      merged.location,
      merged.dateFound,
      merged.publicDescription,
      merged.additionalNotes,
      merged.imageUrl,
      merged.status,
      submissionHash,
      now,
      id,
    ];

    let privateClause = "";
    if (updates.privateVerificationDetails !== undefined) {
      params.push(updates.privateVerificationDetails);
      privateClause = `, private_verification_details = $${params.length}`;
    }

    const result = await query(
      `UPDATE found_items
       SET title = $1, category = $2, campus_zone = $3, location = $4,
           date_found = $5, public_description = $6, additional_notes = $7,
           image_url = $8, status = $9, submission_hash = $10, updated_at = $11${privateClause}
       WHERE id = $12
       RETURNING id, user_id, title, category, campus_zone, location, date_found,
                 public_description, additional_notes, image_url, status,
                 created_at, updated_at`,
      params
    );
    return result.rows[0] ? toPublicFoundItem(result.rows[0]) : null;
  },

  async remove(id) {
    if (isDemoMode()) {
      const index = demoStore.foundItems.findIndex((item) => item.id === id);
      if (index === -1) return false;
      demoStore.foundItems.splice(index, 1);
      demoStore.claims = demoStore.claims.filter((c) => c.foundItemId !== id);
      return true;
    }

    const result = await query(
      "DELETE FROM found_items WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rowCount > 0;
  },

  async updateStatus(id, status) {
    if (isDemoMode()) {
      const item = demoStore.foundItems.find((entry) => entry.id === id);
      if (!item) return null;
      item.status = status;
      item.updatedAt = new Date().toISOString();
      return toPublicFoundItem(item);
    }

    const result = await query(
      `UPDATE found_items SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, user_id, title, category, campus_zone, location, date_found,
                 public_description, additional_notes, image_url, status,
                 created_at, updated_at`,
      [status, id]
    );
    return result.rows[0] ? toPublicFoundItem(result.rows[0]) : null;
  },
};

module.exports = { foundItemsModel };
