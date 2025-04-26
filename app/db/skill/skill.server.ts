import { PrismaClient } from '@prisma/client';
import { Skill } from '~/types/types';

// Create a new skill
async function createSkill(data: { name: string }, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const skill = await prisma.skill.create({
      data: {
        name: data.name,
      }
    });
    
    return { success: true, data: skill };
  } catch (error: any) {
    console.error("Error creating skill:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Get all skills
async function getAllSkills(dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return { success: true, data: skills };
  } catch (error: any) {
    console.error("Error fetching skills:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Get a specific skill
async function getSkill(id: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const skill = await prisma.skill.findUnique({
      where: { id }
    });
    
    return { success: true, data: skill };
  } catch (error: any) {
    console.error("Error fetching skill:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Update a skill
async function updateSkill(id: string, data: { name?: string }, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
      }
    });
    
    return { success: true, data: skill };
  } catch (error: any) {
    console.error("Error updating skill:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Delete a skill
async function deleteSkill(id: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    // First check if the skill is used in any reports
    const skillUseCount = await prisma.skillReport.count({
      where: { skillId: id }
    });
    
    if (skillUseCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete: This skill is used in ${skillUseCount} reports.` 
      };
    }
    
    // If not used, delete the skill
    await prisma.skill.delete({
      where: { id }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting skill:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

export default {
  createSkill,
  getAllSkills,
  getSkill,
  updateSkill,
  deleteSkill
};