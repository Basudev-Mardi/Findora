const crypto = require("crypto");
const { isDemoMode, query } = require("../config/db");
const { demoStore } = require("./demoStore");
const { AppError } = require("../utils/AppError");
const {
  computeSubmissionHash,
  getDefaultCategoryImage,
} = require("../utils/validators");

function toPublicLostItem(row) {
  return {
    id: row.id,
    itemType: "lost",
    userId: row.user_id ?? row.userId ?? null,
    title: row.title,
    category: row.category,
    campusZone: row.campus_zone ?? row.campusZone,
    location: row.location,
    dateLost:
      row.date_lost instanceof Date
        ? row.date_lost.toISOString().slice(0, 10)
        : row.date_lost ?? row.dateLost,
    publicDescription: row.public_description ?? row.publicDescription,
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
      if (filters.dateFrom && item.dateLost < filters.dateFrom) return false;
      if (filters.dateTo && item.dateLost > filters.dateTo) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "oldest") {
        return a.dateLost.localeCompare(b.dateLost) || a.createdAt.localeCompare(b.createdAt);
      }
      return b.dateLost.localeCompare(a.dateLost) || b.createdAt.localeCompare(a.createdAt);
    });
}

const lostItemsModel = {
  async findAll(filters) {
    if (isDemoMode()) {
      return applyDemoFilters(demoStore.lostItems, filters).map(toPublicLostItem);
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
      conditions.push(`date_lost >= $${params.length}`);
    }
    if (filters.dateTo) {
      params.push(filters.dateTo);
      conditions.push(`date_lost <= $${params.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderDirection = filters.sort === "oldest" ? "ASC" : "DESC";

    const sql = `
      SELECT id, user_id, title, category, campus_zone, location, date_lost,
             public_description, image_url, status, created_at, updated_at
      FROM lost_items
      ${whereClause}
      ORDER BY date_lost ${orderDirection}, created_at ${orderDirection}
    `;

    const result = await query(sql, params);
    return result.rows.map(toPublicLostItem);
  },

  async findById(id) {
    if (isDemoMode()) {
      const found = demoStore.lostItems.find((item) => item.id === id);
      return found ? toPublicLostItem(found) : null;
    }

    const result = await query(
      `SELECT id, user_id, title, category, campus_zone, location, date_lost,
              public_description, image_url, status, created_at, updated_at
       FROM lost_items
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? toPublicLostItem(result.rows[0]) : null;
  },

  async findPrivateById(id) {
    if (isDemoMode()) {
      const found = demoStore.lostItems.find((item) => item.id === id);
      if (!found) return null;
      return {
        ...toPublicLostItem(found),
        privateIdentifyingDetails: found.privateIdentifyingDetails ?? null,
      };
    }

    const result = await query(
      `SELECT id, user_id, title, category, campus_zone, location, date_lost,
              public_description, private_identifying_details, image_url, status,
              created_at, updated_at
       FROM lost_items
       WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;
    return {
      ...toPublicLostItem(result.rows[0]),
      privateIdentifyingDetails:
        result.rows[0].private_identifying_details ?? null,
    };
  },

  async create(data) {
    const id = `lost-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const submissionHash = computeSubmissionHash([
      "lost",
      data.title,
      data.category,
      data.campusZone,
      data.dateLost,
    ]);

    if (isDemoMode()) {
      const duplicate = demoStore.lostItems.find(
        (item) => item.submissionHash === submissionHash
      );
      if (duplicate) {
        throw new AppError(
          "A duplicate lost item report with the same title, category, zone, and date already exists.",
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
        dateLost: data.dateLost,
        publicDescription: data.publicDescription,
        privateIdentifyingDetails: data.privateIdentifyingDetails ?? null,
        imageUrl: data.imageUrl || getDefaultCategoryImage(data.category),
        status: data.status || "available",
        submissionHash,
        createdAt: now,
        updatedAt: now,
      };
      demoStore.lostItems.unshift(record);
      return toPublicLostItem(record);
    }

    const result = await query(
      `INSERT INTO lost_items (
         id, user_id, title, category, campus_zone, location, date_lost,
         public_description, private_identifying_details, image_url, status,
         submission_hash, created_at, updated_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id, user_id, title, category, campus_zone, location, date_lost,
                 public_description, image_url, status, created_at, updated_at`,
      [
        id,
        data.userId ?? null,
        data.title,
        data.category,
        data.campusZone,
        data.location,
        data.dateLost,
        data.publicDescription,
        data.privateIdentifyingDetails ?? null,
        data.imageUrl || getDefaultCategoryImage(data.category),
        data.status || "available",
        submissionHash,
        now,
        now,
      ]
    );
    return toPublicLostItem(result.rows[0]);
  },

  async update(id, updates) {
    const now = new Date().toISOString();

    if (isDemoMode()) {
      const index = demoStore.lostItems.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const existing = demoStore.lostItems[index];
      const merged = {
        ...existing,
        ...updates,
        updatedAt: now,
      };
      merged.submissionHash = computeSubmissionHash([
        "lost",
        merged.title,
        merged.category,
        merged.campusZone,
        merged.dateLost,
      ]);

      const duplicate = demoStore.lostItems.find(
        (item) => item.id !== id && item.submissionHash === merged.submissionHash
      );
      if (duplicate) {
        throw new AppError(
          "Another lost item report with these exact details already exists.",
          409
        );
      }

      demoStore.lostItems[index] = merged;
      return toPublicLostItem(merged);
    }

    const existing = await this.findById(id);
    if (!existing) return null;

    const merged = {
      title: updates.title ?? existing.title,
      category: updates.category ?? existing.category,
      campusZone: updates.campusZone ?? existing.campusZone,
      location: updates.location ?? existing.location,
      dateLost: updates.dateLost ?? existing.dateLost,
      publicDescription: updates.publicDescription ?? existing.publicDescription,
      imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : existing.imageUrl,
      status: updates.status ?? existing.status,
    };

    const submissionHash = computeSubmissionHash([
      "lost",
      merged.title,
      merged.category,
      merged.campusZone,
      merged.dateLost,
    ]);

    const params = [
      merged.title,
      merged.category,
      merged.campusZone,
      merged.location,
      merged.dateLost,
      merged.publicDescription,
      merged.imageUrl,
      merged.status,
      submissionHash,
      now,
      id,
    ];

    let privateClause = "";
    if (updates.privateIdentifyingDetails !== undefined) {
      params.push(updates.privateIdentifyingDetails);
      privateClause = `, private_identifying_details = $${params.length}`;
    }

    const result = await query(
      `UPDATE lost_items
       SET title = $1, category = $2, campus_zone = $3, location = $4,
           date_lost = $5, public_description = $6, image_url = $7,
           status = $8, submission_hash = $9, updated_at = $10${privateClause}
       WHERE id = $11
       RETURNING id, user_id, title, category, campus_zone, location, date_lost,
                 public_description, image_url, status, created_at, updated_at`,
      params
    );
    return result.rows[0] ? toPublicLostItem(result.rows[0]) : null;
  },

  async remove(id) {
    if (isDemoMode()) {
      const index = demoStore.lostItems.findIndex((item) => item.id === id);
      if (index === -1) return false;
      demoStore.lostItems.splice(index, 1);
      demoStore.claims = demoStore.claims.filter((c) => c.lostItemId !== id);
      return true;
    }

    const result = await query(
      "DELETE FROM lost_items WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rowCount > 0;
  },

  async updateStatus(id, status) {
    if (isDemoMode()) {
      const item = demoStore.lostItems.find((entry) => entry.id === id);
      if (!item) return null;
      item.status = status;
      item.updatedAt = new Date().toISOString();
      return toPublicLostItem(item);
    }

    const result = await query(
      `UPDATE lost_items SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, user_id, title, category, campus_zone, location, date_lost,
                 public_description, image_url, status, created_at, updated_at`,
      [status, id]
    );
    return result.rows[0] ? toPublicLostItem(result.rows[0]) : null;
  },
};

module.exports = { lostItemsModel };
