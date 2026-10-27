import { pgTable, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").default("Estabelecimento"),
  logoUrl: text("logo_url"),
  coverColor: text("cover_color").default("#2563eb"), // Cor primária da marca
  googleReviewUrl: text("google_review_url").notNull(),
  notificationPhone: text("notification_phone"), // WhatsApp do gerente para alerta imediato (ex: 5515999999999)
  notificationEmail: text("notification_email"),
  welcomeMessage: text("welcome_message").default("Como foi sua experiência conosco hoje?"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbacks = pgTable("feedbacks", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(), // 1 a 5
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  comment: text("comment"),
  status: text("status").default("pending"), // pending, contacted, resolved
  redirectedToGoogle: boolean("redirected_to_google").default(false).notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;
