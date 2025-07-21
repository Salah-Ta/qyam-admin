import { Skill, SkillWithCount } from '~/types/types';
import { client } from '../db-client.server';

const initializeDatabase = (dbUrl?: string) => {
    const db = dbUrl ? client(dbUrl) : client();
    if (!db) {
        throw new Error("فشل الاتصال بقاعدة البيانات");
    }
    return db;
};

// Create a new skill
async function createSkill(data: Skill, dbUrl?: string): Promise<{ success: boolean; data?: Skill; error?: string }> {
  const db = initializeDatabase(dbUrl);
  
  try {
    const skill = await db.skill.create({
      data: {
        name: data.name,
        description: data.description || '', // Ensure description is not undefined
      }
    });
    
    return { success: true, data: skill };
  } catch (error: any) {
    console.error("Error creating skill:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

// Get all skills
async function getAllSkills(dbUrl?: string): Promise<{ success: boolean; data?: Skill[]; error?: string }> {
  const db = initializeDatabase(dbUrl);

  try {
    const skills = await db.skill.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return { success: true, data: skills };
  } catch (error: any) {
    console.error("Error fetching skills:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

// Get a specific skill
async function getSkill(id: string, dbUrl?: string): Promise<{ success: boolean; data?: Skill; error?: string }> {
  const db = initializeDatabase(dbUrl);

  try {
    const skill = await db.skill.findUnique({
      where: { id }
    });
    
    return { success: true, data: skill };
  } catch (error: any) {
    console.error("Error fetching skill:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

// Update a skill
async function updateSkill(id: string, data: Skill, dbUrl?: string): Promise<{ success: boolean; data?: Skill; error?: string }> {
  const db = initializeDatabase(dbUrl);

  try {
    const skill = await db.skill.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
      }
    });
    
    return { success: true, data: skill };
  } catch (error: any) {
    console.error("Error updating skill:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

// Delete a skill
async function deleteSkill(id: string, dbUrl?: string): Promise<{ success: boolean; error?: string }> {
  const db = initializeDatabase(dbUrl);

  try {
    // First check if the skill is used in any reports
    const skillUseCount = await db.skillReport.count({
      where: { skillId: id }
    });
    
    if (skillUseCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete: This skill is used in ${skillUseCount} reports.` 
      };
    }
    
    // If not used, delete the skill
    await db.skill.delete({
      where: { id }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting skill:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

// Get skills with usage counts for word cloud
async function getSkillsWithUsageCount(dbUrl?: string): Promise<{ success: boolean; data?: SkillWithCount[]; error?: string }> {
  const db = initializeDatabase(dbUrl);

  try {
    const skills = await db.skill.findMany({
      include: {
        reports: {
          select: {
            skillId: true
          }
        }
      }
    });
    
    // Transform to include usage count
    const skillsWithCount = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      usageCount: skill.reports.length,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt
    }));
    
    // Sort by usage count (descending)
    skillsWithCount.sort((a, b) => b.usageCount - a.usageCount);
    
    return { success: true, data: skillsWithCount };
  } catch (error: any) {
    console.error("Error fetching skills with usage count:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

// Get skills with usage counts for word cloud
async function getSkillsWithUsageCount(dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const skills = await prisma.skill.findMany({
      include: {
        reports: {
          select: {
            skillId: true
          }
        }
      }
    });
    
    // Transform to include usage count
    const skillsWithCount = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      usageCount: skill.reports.length,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt
    }));
    
    // Sort by usage count (descending)
    skillsWithCount.sort((a, b) => b.usageCount - a.usageCount);
    
    return { success: true, data: skillsWithCount };
  } catch (error: any) {
    console.error("Error fetching skills with usage count:", error);
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
  deleteSkill,
  getSkillsWithUsageCount
};