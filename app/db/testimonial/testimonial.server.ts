import { CreateTestimonialData, Testimonial } from '~/types/types';
import { client } from '../db-client.server';

const initializeDatabase = (dbUrl?: string) => {
    const db = dbUrl ? client(dbUrl) : client();
    if (!db) {
        throw new Error("فشل الاتصال بقاعدة البيانات");
    }
    return db;
};

// Create a new testimonial
async function createTestimonial(data: CreateTestimonialData, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    const testimonial = await db.testimonial.create({
      data: {
        name: data.name,
        comment: data.comment
      }
    });
    
    return { success: true, data: testimonial };
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

// Get testimonial by ID
async function getTestimonial(id: string, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    const testimonial = await db.testimonial.findUnique({
      where: { id }
    });
    
    return { success: true, data: testimonial };
  } catch (error: any) {
    console.error("Error fetching testimonial:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

// Get all testimonials
async function getAllTestimonials(dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { success: true, data: testimonials };
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

export default {
  createTestimonial,
  getTestimonial,
  getAllTestimonials
};