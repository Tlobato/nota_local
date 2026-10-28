import { pgTable, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id"), // Clerk User ID (quando o usuário cria sozinho)
  ownerEmail: text("owner_email"), // E-mail do proprietário (para quando VOCÊ cadastra ele previamente)
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").default("Estabelecimento"),
  logoUrl: text("logo_url"),
  coverColor: text("cover_color").default("#2563eb"), // Cor primária da marca
  googleReviewUrl: text("google_review_url").notNull(),
  notificationPhone: text("notification_phone"), // WhatsApp do gerente para alerta imediato (ex: 5515999999999)
  notificationEmail: text("notification_email"),
  welcomeMessage: text("welcome_message").default("Como foi sua experiência conosco hoje?"),
  paymentStatus: text("payment_status").default("active"), // active, pending, cancelled
  isDemo: boolean("is_demo").default(false), // Flag para a clínica de demonstração comercial
  asaasCustomerId: text("asaas_customer_id"),
  asaasPaymentId: text("asaas_payment_id"),
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
  resolutionNotes: text("resolution_notes"), // Anotações internas de como o caso foi resolvido
  resolvedAt: timestamp("resolved_at"),
  redirectedToGoogle: boolean("redirected_to_google").default(false).notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;
