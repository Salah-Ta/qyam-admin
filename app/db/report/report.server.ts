import {
  StatusResponse,
  CreateReportData,
  Report
} from "~/types/types";
import { client } from "../db-client.server";

const initializeDatabase = (dbUrl?: string) => {
  const db = dbUrl ? client(dbUrl) : client();
  if (!db) {
    throw new Error("فشل الاتصال بقاعدة البيانات");
  }
  return db;
};

// Get all reports with testimonials included
async function getAllReports(dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    const reports = await db.report.findMany({
       include: {
         user: true,
         skills: {
           include: {
             skill: true
           }
         },
         testimonials: {
           include: {
             testimonial: true
           }
         }
       },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, data: reports };
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return { success: false, error: error.message };
  }
}

// Get a report with testimonials included
async function getReport(id: string, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    const report = await db.report.findUnique({
      where: { id },
      include: {
        user: true,
        skills: {
          include: {
            skill: true
          }
        },
        testimonials: {
          include: {
            testimonial: true
          }
        }
      }
    });

    return { success: true, data: report };
  } catch (error: any) {
    console.error("Error fetching report:", error);
    return { success: false, error: error.message };
  }
}

// Create a new report with testimonials and skills
async function createReport(data: CreateReportData, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    // Create the report
    const report = await db.report.create({
      data: {
        userId: data.userId,
        volunteerHours: data.volunteerHours,
        economicValue: data.economicValue,
        volunteerOpportunities: data.volunteerOpportunities,
        activitiesCount: data.activitiesCount,
        volunteerCount: data.volunteerCount,
        skillsEconomicValue: data.skillsEconomicValue,
        skillsTrainedCount: data.skillsTrainedCount,
        attachedFiles: data.attachedFiles,
      },
    });

    // Process skills connections if provided
    if (data.skillIds && data.skillIds.length > 0) {
      await Promise.all(data.skillIds.map(skillId =>
        db.skillReport.create({
          data: {
            reportId: report.id,
            skillId: skillId
          }
        })
      ));
    }

    // Process testimonials if provided
    if (data.testimonials && data.testimonials.length > 0) {
      for (const testimonialData of data.testimonials) {
        // Create new testimonial
        const testimonial = await db.testimonial.create({
          data: {
            name: testimonialData.name,
            comment: testimonialData.comment
          }
        });

        // Connect testimonial to report
        await db.testimonialReport.create({
          data: {
            reportId: report.id,
            testimonialId: testimonial.id
          }
        });
      }
    }

    // Return the created report with related data
    const reportWithRelations = await db.report.findUnique({
      where: { id: report.id },
      include: {
        user: true,
        skills: {
          include: {
            skill: true
          }
        },
        testimonials: {
          include: {
            testimonial: true
          }
        }
      }
    });

    return { success: true, data: reportWithRelations };
  } catch (error: any) {
    console.error("Error creating report:", error);
    return { success: false, error: error.message };
  }
}

// Get all skills (to show in the skill selection UI)
async function getAllSkills(dbUrl?: string) {
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
  }
}

const deleteReport = async (id: string, dbUrl?: string): Promise<StatusResponse<null>> => {
  const db = initializeDatabase(dbUrl);
  
  try {
    await db.report.delete({
      where: { id }
    });
    
    return {
      status: "success",
      message: "تم حذف التقرير بنجاح",
    };
  } catch (error: any) {
    console.error("Error deleting report:", error);
    return {
      status: "error",
      message: "فشل حذف التقرير",
    };
  }
};

/**
 * Delete reports where volunteerCount is greater than 200
 */
async function deleteReportsWithHighVolunteerCount(dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    // First, find all reports with volunteerCount > 200
    const reportsToDelete = await db.report.findMany({
      where: {
        volunteerCount: {
          gt: 200
        }
      },
      select: {
        id: true,
        volunteerCount: true,
        userId: true,
        createdAt: true
      }
    });

    console.log(`Found ${reportsToDelete.length} reports with volunteerCount > 200:`);
    reportsToDelete.forEach(report => {
      console.log(`- Report ID: ${report.id}, Volunteer Count: ${report.volunteerCount}, User ID: ${report.userId}, Created: ${report.createdAt}`);
    });

    if (reportsToDelete.length === 0) {
      return {
        success: true,
        message: "No reports found with volunteerCount > 200",
        deletedCount: 0,
        deletedReports: []
      };
    }

    // Delete the reports using deleteMany for efficiency
    const deleteResult = await db.report.deleteMany({
      where: {
        volunteerCount: {
          gt: 200
        }
      }
    });

    console.log(`Successfully deleted ${deleteResult.count} reports with volunteerCount > 200`);

    return {
      success: true,
      message: `Successfully deleted ${deleteResult.count} reports with volunteerCount > 200`,
      deletedCount: deleteResult.count,
      deletedReports: reportsToDelete
    };
  } catch (error: any) {
    console.error("Error deleting reports with high volunteer count:", error);
    return {
      success: false,
      error: error.message,
      deletedCount: 0,
      deletedReports: []
    };
  }
}

/**
 * Get all reports for a specific region
 */
async function getRegionReports(regionId: string, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    const regionReports = await db.report.findMany({
      where: { user: { regionId } },
      include: {
        user: true,
        skills: { include: { skill: true } },
        testimonials: { include: { testimonial: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: regionReports };
  } catch (error: any) {
    console.error("Error fetching region reports:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all reports for a specific eduAdmin
 */
async function getEduAdminReports(eduAdminId: string, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    const eduAdminReports = await db.report.findMany({
      where: { user: { eduAdminId } },
      include: {
        user: true,
        skills: { include: { skill: true } },
        testimonials: { include: { testimonial: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: eduAdminReports };
  } catch (error: any) {
    console.error("Error fetching eduAdmin reports:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all reports for a specific school
 */
async function getSchoolReports(schoolId: string, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    const schoolReports = await db.report.findMany({
      where: { user: { schoolId } },
      include: {
        user: true,
        skills: { include: { skill: true } },
        testimonials: { include: { testimonial: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: schoolReports };
  } catch (error: any) {
    console.error("Error fetching school reports:", error);
    return { success: false, error: error.message };
  }

  /**
 * Get total statistics for a specific user from their reports
 */
async function getUserTotalStats(userId: string, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    // Fetch all reports for this specific user
    const userReports = await db.report.findMany({
      where: {
        userId: userId
      }
    });

    return { success: true, data: getTotalStatsFromReports(userReports) };
  } catch (error: any) {
    console.error("Error fetching user statistics:", error);
    return { success: false, error: error.message };
  }
}

function getTotalStatsFromReports(reports: Report[]): {
  reportCount: number;
  volunteerHours: number;
  economicValue: number;
  volunteerOpportunities: number;
  activitiesCount: number;
  volunteerCount: number;
  skillsEconomicValue: number;
  skillsTrainedCount: number;
} {
  const totals = sumReportFields(reports);
  return {
    reportCount: reports.length,
    ...totals
  };
}

/**
 * Helper function to sum report fields
 */
function sumReportFields(reports: Report[]): {
  volunteerHours: number;
  economicValue: number;
  volunteerOpportunities: number;
  activitiesCount: number;
  volunteerCount: number;
  skillsEconomicValue: number;
  skillsTrainedCount: number;
} {
  let volunteerHours = 0;
  let economicValue = 0;
  let volunteerOpportunities = 0;
  let activitiesCount = 0;
  let volunteerCount = 0;
  let skillsEconomicValue = 0;
  let skillsTrainedCount = 0;

  reports.forEach(report => {
    volunteerHours += report.volunteerHours || 0;
    economicValue += report.economicValue || 0;
    volunteerOpportunities += report.volunteerOpportunities || 0;
    activitiesCount += report.activitiesCount || 0;
    volunteerCount += report.volunteerCount || 0;
    skillsEconomicValue += report.skillsEconomicValue || 0;
    skillsTrainedCount += report.skillsTrainedCount || 0;
  });

  return {
    volunteerHours,
    economicValue,
    volunteerOpportunities,
    activitiesCount,
    volunteerCount,
    skillsEconomicValue,
    skillsTrainedCount
  };
}
}

export default {
  getAllReports,
  getReport,
  createReport,
  getAllSkills,
  deleteReport,
  deleteReportsWithHighVolunteerCount,
  getEduAdminReports,
  getSchoolReports,
  getRegionReports
};