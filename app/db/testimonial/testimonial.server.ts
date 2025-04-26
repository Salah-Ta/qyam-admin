import { PrismaClient } from '@prisma/client';
import { CreateTestimonialData, Testimonial } from '~/types/types';

// Create a new testimonial
async function createTestimonial(data: CreateTestimonialData, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const testimonial = await prisma.testimonial.create({
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
    await prisma.$disconnect();
  }
}

// Get testimonial by ID
async function getTestimonial(id: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    });
    
    return { success: true, data: testimonial };
  } catch (error: any) {
    console.error("Error fetching testimonial:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Get all testimonials
async function getAllTestimonials(dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { success: true, data: testimonials };
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

export default {
  createTestimonial,
  getTestimonial,
  getAllTestimonials
};