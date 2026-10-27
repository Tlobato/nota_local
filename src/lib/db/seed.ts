import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Semeando dados iniciais no Neon PostgreSQL...");

  // Inserir negócio modelo
  const [sorriso] = await db
    .insert(schema.businesses)
    .values({
      name: "Clínica Odontológica Sorriso",
      slug: "clinica-sorriso",
      category: "Odontologia & Estética Dental",
      coverColor: "#0284c7", // Sky 600
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
      notificationPhone: "5515998383997",
      notificationEmail: "contato@clinicasorriso.com.br",
      welcomeMessage: "Sua opinião é fundamental para nossa equipe! Como foi sua consulta hoje?",
    })
    .onConflictDoNothing()
    .returning();

  const businessId = sorriso?.id;

  if (businessId) {
    // Inserir feedbacks de teste para o dashboard já nascer vivo
    await db.insert(schema.feedbacks).values([
      {
        businessId,
        rating: 5,
        customerName: "Mariana Alcantara",
        comment: "Atendimento maravilhoso, a Dra. foi super atenciosa com meu implante!",
        redirectedToGoogle: true,
        status: "resolved",
      },
      {
        businessId,
        rating: 5,
        customerName: "Carlos Eduardo Santos",
        comment: "Excelente estrutura e pontualidade impecável.",
        redirectedToGoogle: true,
        status: "resolved",
      },
      {
        businessId,
        rating: 2,
        customerName: "Renata Vasconcelos",
        customerPhone: "(15) 99123-4455",
        comment: "A consulta atrasou 40 minutos e a recepcionista não me avisou nada. Fiquei chateada pois tinha outro compromisso.",
        redirectedToGoogle: false, // Bloqueado do Google! Retido para o gerente
        status: "pending",
      },
      {
        businessId,
        rating: 3,
        customerName: "Fernando Prado",
        customerPhone: "(15) 99778-9012",
        comment: "O dentista é bom, mas o estacionamento conveniado estava lotado e tive que parar longe na chuva.",
        redirectedToGoogle: false, // Bloqueado do Google! Retido para o gerente
        status: "contacted",
      },
    ]);
  }

  console.log("✅ Seed finalizado com sucesso!");
}

seed().catch((err) => {
  console.error("❌ Erro ao semear:", err);
  process.exit(1);
});
