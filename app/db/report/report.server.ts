import glossary from "~/lib/glossary";
import {
  StatusResponse,
  Report,
  CreateReportData,
  Region,
  EduAdmin,
  School,
  GlobalTotals,
  RegionStat,
  EduAdminStat,
  SchoolStat,
  ReportStatistics
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
      // include: {
      //   user: true,
      //   skills: {
      //     include: {
      //       skill: true
      //     }
      //   },
      //   testimonials: {
      //     include: {
      //       testimonial: true
      //     }
      //   }
      // },
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

/**
 * Calculate statistics based on reports, regions, eduAdmins, and schools
 */
async function calculateStatistics(dbUrl?: string): Promise<ReportStatistics> {

  const db = initializeDatabase(dbUrl);

  try {
    // Fetch all the necessary data
    const reports = await db.report.findMany({
      include: {
        user: true
      }
    });

    const regions = await db.region.findMany();
    const eduAdmins = await db.eduAdmin.findMany();
    const schools = await db.school.findMany();
    const users = await db.user.findMany();

    // Create maps for quick lookups
    const regionMap = new Map(regions.map(r => [r.id, r.name]));
    const eduAdminMap = new Map(eduAdmins.map(ea => [ea.id, ea.name]));
    const schoolMap = new Map(schools.map(s => [s.id, s.name]));

    // Calculate Global Totals
    const globalTotalsData = sumReportFields(reports as unknown as Report[]);

    const globalTotals: GlobalTotals = {
      ...globalTotalsData,
      schoolsCount: schools.length,
      trainers: new Set(reports.map(r => r.userId)).size
    };

    // Calculate Region Stats - using regionId directly from users
    const regionStats: RegionStat[] = regions.map(region => {
      const regionUsers = users.filter(user => user.regionId === region.id);
      const regionReports = reports.filter(report => 
        regionUsers.some(user => user.id === report.userId)
      );
      const regionTotals = sumReportFields(regionReports as unknown as Report[]);

      return {
        regionId: region.id,
        regionName: region.name,
        volunteerHoursPercentage: globalTotals.volunteerHours > 0 ? (regionTotals.volunteerHours / globalTotals.volunteerHours) * 100 : 0,
        economicValuePercentage: globalTotals.economicValue > 0 ? (regionTotals.economicValue / globalTotals.economicValue) * 100 : 0,
        volunteerOpportunitiesPercentage: globalTotals.volunteerOpportunities > 0 ? (regionTotals.volunteerOpportunities / globalTotals.volunteerOpportunities) * 100 : 0,
        activitiesCountPercentage: globalTotals.activitiesCount > 0 ? (regionTotals.activitiesCount / globalTotals.activitiesCount) * 100 : 0,
        volunteerCountPercentage: globalTotals.volunteerCount > 0 ? (regionTotals.volunteerCount / globalTotals.volunteerCount) * 100 : 0,
      };
    });

    // Calculate EduAdmin Stats - using eduAdminId directly from users
    const eduAdminStats: EduAdminStat[] = eduAdmins.map(eduAdmin => {
      const eduAdminUsers = users.filter(user => user.eduAdminId === eduAdmin.id);
      const eduAdminReports = reports.filter(report => 
        eduAdminUsers.some(user => user.id === report.userId)
      );
      const eduAdminTotals = sumReportFields(eduAdminReports as unknown as Report[]);

      // Find the region for this eduAdmin (if any user belongs to this eduAdmin, use their regionId)
      const firstUser = eduAdminUsers[0];
      const regionName = firstUser && firstUser.regionId ? regionMap.get(firstUser.regionId) || "غير محدد" : "غير محدد";

      return {
        eduAdminId: eduAdmin.id,
        eduAdminName: eduAdmin.name,
        regionName,
        volunteerHoursPercentage: globalTotals.volunteerHours > 0 ? (eduAdminTotals.volunteerHours / globalTotals.volunteerHours) * 100 : 0,
        economicValuePercentage: globalTotals.economicValue > 0 ? (eduAdminTotals.economicValue / globalTotals.economicValue) * 100 : 0,
        volunteerOpportunitiesPercentage: globalTotals.volunteerOpportunities > 0 ? (eduAdminTotals.volunteerOpportunities / globalTotals.volunteerOpportunities) * 100 : 0,
        activitiesCountPercentage: globalTotals.activitiesCount > 0 ? (eduAdminTotals.activitiesCount / globalTotals.activitiesCount) * 100 : 0,
        volunteerCountPercentage: globalTotals.volunteerCount > 0 ? (eduAdminTotals.volunteerCount / globalTotals.volunteerCount) * 100 : 0,
      };
    });

    // Calculate School Stats - using schoolId directly from users
    const schoolStats: SchoolStat[] = schools.map(school => {
      const schoolUsers = users.filter(user => user.schoolId === school.id);
      const schoolReports = reports.filter(report => 
        schoolUsers.some(user => user.id === report.userId)
      );
      const schoolTotals = sumReportFields(schoolReports as unknown as Report[]);

      // Find eduAdmin and region for this school
      const firstUser = schoolUsers[0];
      const eduAdminName = firstUser && firstUser.eduAdminId ? eduAdminMap.get(firstUser.eduAdminId) || "غير محدد" : "غير محدد";
      const regionName = firstUser && firstUser.regionId ? regionMap.get(firstUser.regionId) || "غير محدد" : "غير محدد";

      return {
        schoolId: school.id,
        schoolName: school.name,
        eduAdminName,
        regionName,
        volunteerHoursPercentage: globalTotals.volunteerHours > 0 ? (schoolTotals.volunteerHours / globalTotals.volunteerHours) * 100 : 0,
        economicValuePercentage: globalTotals.economicValue > 0 ? (schoolTotals.economicValue / globalTotals.economicValue) * 100 : 0,
        volunteerOpportunitiesPercentage: globalTotals.volunteerOpportunities > 0 ? (schoolTotals.volunteerOpportunities / globalTotals.volunteerOpportunities) * 100 : 0,
        activitiesCountPercentage: globalTotals.activitiesCount > 0 ? (schoolTotals.activitiesCount / globalTotals.activitiesCount) * 100 : 0,
        volunteerCountPercentage: globalTotals.volunteerCount > 0 ? (schoolTotals.volunteerCount / globalTotals.volunteerCount) * 100 : 0,
      };
    });

    return {
      globalTotals,
      regionStats,
      eduAdminStats,
      schoolStats
    };
  } catch (error) {
    console.error("Error calculating statistics:", error);
    return {
      globalTotals: {
        volunteerHours: 0,
        economicValue: 0,
        volunteerOpportunities: 0,
        activitiesCount: 0,
        volunteerCount: 0,
        skillsEconomicValue: 0,
        skillsTrainedCount: 0,
        schoolsCount: 0,
        trainers: 0
      },
      regionStats: [],
      eduAdminStats: [],
      schoolStats: []
    };
  }
}

/**
 * Calculate filtered statistics based on region, eduAdmin, or school
 */
async function calculateFilteredStatistics(
  regionId?: string, 
  eduAdminId?: string, 
  schoolId?: string, 
  dbUrl?: string
): Promise<ReportStatistics> {
  const db = initializeDatabase(dbUrl);

  try {
    // Build where clause based on provided filters
    let userWhereClause: any = {};
    if (schoolId) {
      userWhereClause.schoolId = schoolId;
    } else if (eduAdminId) {
      userWhereClause.eduAdminId = eduAdminId;
    } else if (regionId) {
      userWhereClause.regionId = regionId;
    }

    // Fetch filtered data
    const reports = await db.report.findMany({
      where: Object.keys(userWhereClause).length > 0 ? {
        user: userWhereClause
      } : {},
      include: {
        user: true
      }
    });

    // Fetch entities based on filters
    let regions: any[] = [];
    let eduAdmins: any[] = [];
    let schools: any[] = [];
    let users: any[] = [];
    
    if (schoolId) {
      // If school is selected, get only that school and its related entities
      const school = await db.school.findUnique({
        where: { id: schoolId }
      });
      
      schools = school ? [school] : [];
      
      // Get eduAdmin and region separately
      if (school && school.eduAdminId) {
        const eduAdmin = await db.eduAdmin.findUnique({
          where: { id: school.eduAdminId }
        });
        eduAdmins = eduAdmin ? [eduAdmin] : [];
        
        if (eduAdmin && eduAdmin.regionId) {
          const region = await db.region.findUnique({
            where: { id: eduAdmin.regionId }
          });
          regions = region ? [region] : [];
        }
      }
      
      users = await db.user.findMany({
        where: { schoolId }
      });
    } else if (eduAdminId) {
      // If eduAdmin is selected, get schools in that eduAdmin
      const eduAdmin = await db.eduAdmin.findUnique({
        where: { id: eduAdminId }
      });
      
      eduAdmins = eduAdmin ? [eduAdmin] : [];
      
      if (eduAdmin && eduAdmin.regionId) {
        const region = await db.region.findUnique({
          where: { id: eduAdmin.regionId }
        });
        regions = region ? [region] : [];
        
        schools = await db.school.findMany({
          where: { eduAdminId }
        });
      }
      
      users = await db.user.findMany({
        where: { eduAdminId }
      });
    } else if (regionId) {
      // If region is selected, get eduAdmins and schools in that region
      const region = await db.region.findUnique({
        where: { id: regionId }
      });
      
      regions = region ? [region] : [];
      
      eduAdmins = await db.eduAdmin.findMany({
        where: { regionId }
      });
      
      schools = await db.school.findMany({
        where: { eduAdminId: { in: eduAdmins.map(ea => ea.id) } }
      });
      
      users = await db.user.findMany({
        where: { regionId }
      });
    } else {
      // No filters - get all data
      regions = await db.region.findMany();
      eduAdmins = await db.eduAdmin.findMany();
      schools = await db.school.findMany();
      users = await db.user.findMany();
    }

    // Create maps for quick lookups
    const regionMap = new Map(regions.map(r => [r.id, r.name]));
    const eduAdminMap = new Map(eduAdmins.map(ea => [ea.id, ea.name]));
    const schoolMap = new Map(schools.map(s => [s.id, s.name]));

    // Calculate Global Totals from filtered reports
    const globalTotalsData = sumReportFields(reports as unknown as Report[]);

    const globalTotals: GlobalTotals = {
      ...globalTotalsData,
      schoolsCount: schools.length,
      trainers: new Set(reports.map(r => r.userId)).size
    };

    // Calculate Region Stats - only for regions that have data
    const regionStats: RegionStat[] = regions.map(region => {
      const regionUsers = users.filter(user => user.regionId === region.id);
      const regionReports = reports.filter(report => 
        regionUsers.some(user => user.id === report.userId)
      );
      const regionTotals = sumReportFields(regionReports as unknown as Report[]);

      return {
        regionId: region.id,
        regionName: region.name,
        volunteerHoursPercentage: globalTotals.volunteerHours > 0 ? (regionTotals.volunteerHours / globalTotals.volunteerHours) * 100 : 0,
        economicValuePercentage: globalTotals.economicValue > 0 ? (regionTotals.economicValue / globalTotals.economicValue) * 100 : 0,
        volunteerOpportunitiesPercentage: globalTotals.volunteerOpportunities > 0 ? (regionTotals.volunteerOpportunities / globalTotals.volunteerOpportunities) * 100 : 0,
        activitiesCountPercentage: globalTotals.activitiesCount > 0 ? (regionTotals.activitiesCount / globalTotals.activitiesCount) * 100 : 0,
        volunteerCountPercentage: globalTotals.volunteerCount > 0 ? (regionTotals.volunteerCount / globalTotals.volunteerCount) * 100 : 0,
      };
    });

    // Calculate EduAdmin Stats - only for eduAdmins that have data
    const eduAdminStats: EduAdminStat[] = eduAdmins.map(eduAdmin => {
      const eduAdminUsers = users.filter(user => user.eduAdminId === eduAdmin.id);
      const eduAdminReports = reports.filter(report => 
        eduAdminUsers.some(user => user.id === report.userId)
      );
      const eduAdminTotals = sumReportFields(eduAdminReports as unknown as Report[]);

      // Find the region for this eduAdmin
      const firstUser = eduAdminUsers[0];
      const regionName = firstUser && firstUser.regionId ? regionMap.get(firstUser.regionId) || "غير محدد" : "غير محدد";

      return {
        eduAdminId: eduAdmin.id,
        eduAdminName: eduAdmin.name,
        regionName,
        volunteerHoursPercentage: globalTotals.volunteerHours > 0 ? (eduAdminTotals.volunteerHours / globalTotals.volunteerHours) * 100 : 0,
        economicValuePercentage: globalTotals.economicValue > 0 ? (eduAdminTotals.economicValue / globalTotals.economicValue) * 100 : 0,
        volunteerOpportunitiesPercentage: globalTotals.volunteerOpportunities > 0 ? (eduAdminTotals.volunteerOpportunities / globalTotals.volunteerOpportunities) * 100 : 0,
        activitiesCountPercentage: globalTotals.activitiesCount > 0 ? (eduAdminTotals.activitiesCount / globalTotals.activitiesCount) * 100 : 0,
        volunteerCountPercentage: globalTotals.volunteerCount > 0 ? (eduAdminTotals.volunteerCount / globalTotals.volunteerCount) * 100 : 0,
      };
    });

    // Calculate School Stats - only for schools that have data
    const schoolStats: SchoolStat[] = schools.map(school => {
      const schoolUsers = users.filter(user => user.schoolId === school.id);
      const schoolReports = reports.filter(report => 
        schoolUsers.some(user => user.id === report.userId)
      );
      const schoolTotals = sumReportFields(schoolReports as unknown as Report[]);

      // Find eduAdmin and region for this school
      const firstUser = schoolUsers[0];
      const eduAdminName = firstUser && firstUser.eduAdminId ? eduAdminMap.get(firstUser.eduAdminId) || "غير محدد" : "غير محدد";
      const regionName = firstUser && firstUser.regionId ? regionMap.get(firstUser.regionId) || "غير محدد" : "غير محدد";

      return {
        schoolId: school.id,
        schoolName: school.name,
        eduAdminName,
        regionName,
        volunteerHoursPercentage: globalTotals.volunteerHours > 0 ? (schoolTotals.volunteerHours / globalTotals.volunteerHours) * 100 : 0,
        economicValuePercentage: globalTotals.economicValue > 0 ? (schoolTotals.economicValue / globalTotals.economicValue) * 100 : 0,
        volunteerOpportunitiesPercentage: globalTotals.volunteerOpportunities > 0 ? (schoolTotals.volunteerOpportunities / globalTotals.volunteerOpportunities) * 100 : 0,
        activitiesCountPercentage: globalTotals.activitiesCount > 0 ? (schoolTotals.activitiesCount / globalTotals.activitiesCount) * 100 : 0,
        volunteerCountPercentage: globalTotals.volunteerCount > 0 ? (schoolTotals.volunteerCount / globalTotals.volunteerCount) * 100 : 0,
      };
    });

    return {
      globalTotals,
      regionStats,
      eduAdminStats,
      schoolStats
    };
  } catch (error) {
    console.error("Error calculating filtered statistics:", error);
    return {
      globalTotals: {
        volunteerHours: 0,
        economicValue: 0,
        volunteerOpportunities: 0,
        activitiesCount: 0,
        volunteerCount: 0,
        skillsEconomicValue: 0,
        skillsTrainedCount: 0,
        schoolsCount: 0,
        trainers: 0
      },
      regionStats: [],
      eduAdminStats: [],
      schoolStats: []
    };
  }
}

/**
 *  Helper function to get total statistics from reports
 */
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

/**
 * Get total statistics for a specific school from all its users' reports
 */
async function getSchoolTotalStats(schoolId: string, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    // Fetch all reports for users in this school
    const schoolReports = await db.report.findMany({
      where: {
        user: {
          schoolId: schoolId
        }
      }
    });

    return { success: true, data: getTotalStatsFromReports(schoolReports) };
  } catch (error: any) {
    console.error("Error fetching school statistics:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get total statistics for a specific eduAdmin from all its users' reports
 */
async function getEduAdminTotalStats(eduAdminId: string, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    // Fetch all reports for users in this eduAdmin
    const eduAdminReports = await db.report.findMany({
      where: {
        user: { eduAdminId }
      }
    });

    return { success: true, data: getTotalStatsFromReports(eduAdminReports) };
  } catch (error: any) {
    console.error("Error fetching eduAdmin statistics:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get total statistics for a specific region from all its users' reports
 */
async function getRegionTotalStats(regionId: string, dbUrl?: string) {
  const db = initializeDatabase(dbUrl);

  try {
    // Fetch all reports for users in this region
    const regionReports = await db.report.findMany({
      where: {
        user: { regionId }
      }
    });

    return { success: true, data: getTotalStatsFromReports(regionReports) };
  } catch (error: any) {
    console.error("Error fetching region statistics:", error);
    return { success: false, error: error.message };
  }
}

export default {
  getAllReports,
  getReport,
  createReport,
  getAllSkills,
  deleteReport,
  calculateStatistics,
  getUserTotalStats,
  getSchoolTotalStats,
  getEduAdminTotalStats,
  getRegionTotalStats,
  calculateFilteredStatistics
};