import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Seeding demo data into Neon PostgreSQL...");

  // Insert demo business
  const [demoBusiness] = await db
    .insert(schema.businesses)
    .values({
      name: "Smile Dental Care Clinic",
      slug: "smile-dental-care",
      category: "Dentistry & Oral Care",
      coverColor: "#0284c7", // Sky 600
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
      notificationPhone: "+15551234567",
      notificationEmail: "contact@smiledentalcare.com",
      welcomeMessage: "Your opinion matters to us! How was your appointment today?",
    })
    .onConflictDoNothing()
    .returning();

  const businessId = demoBusiness?.id;

  if (businessId) {
    // Insert initial feedbacks to populate admin dashboard
    await db.insert(schema.feedbacks).values([
      {
        businessId,
        rating: 5,
        customerName: "Sarah Jenkins",
        comment: "Outstanding service! The doctor was very gentle during my implant consultation.",
        redirectedToGoogle: true,
        status: "resolved",
      },
      {
        businessId,
        rating: 5,
        customerName: "Michael Chang",
        comment: "Spotless facilities, friendly reception, and zero wait time.",
        redirectedToGoogle: true,
        status: "resolved",
      },
      {
        businessId,
        rating: 2,
        customerName: "Emily Watson",
        customerPhone: "+15559876543",
        comment: "Appointment was delayed by 40 minutes with no prior notice at the reception desk.",
        redirectedToGoogle: false, // Held internally for manager resolution!
        status: "pending",
      },
      {
        businessId,
        rating: 3,
        customerName: "David Miller",
        customerPhone: "+15553456789",
        comment: "Treatment was good, but the validated parking lot was full and had to park blocks away in the rain.",
        redirectedToGoogle: false, // Held internally for manager resolution!
        status: "contacted",
      },
    ]);
  }

  console.log("✅ Seed completed successfully!");
}

seed().catch((err) => {
  console.error("❌ Error while seeding:", err);
  process.exit(1);
});
