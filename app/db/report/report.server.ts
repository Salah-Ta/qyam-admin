import glossary from "~/lib/glossary";
import { PrismaClient } from '@prisma/client';
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

// Get all reports with testimonials included
async function getAllReports(dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const reports = await prisma.report.findMany({
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
  } finally {
    await prisma.$disconnect();
  }
}

// Get a report with testimonials included
async function getReport(id: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const report = await prisma.report.findUnique({
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
  } finally {
    await prisma.$disconnect();
  }
}

// Create a new report with testimonials and skills
async function createReport(data: CreateReportData, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    // Create the report
    const report = await prisma.report.create({
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
        prisma.skillReport.create({
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
        const testimonial = await prisma.testimonial.create({
          data: {
            name: testimonialData.name,
            comment: testimonialData.comment
          }
        });

        // Connect testimonial to report
        await prisma.testimonialReport.create({
          data: {
            reportId: report.id,
            testimonialId: testimonial.id
          }
        });
      }
    }

    // Return the created report with related data
    const reportWithRelations = await prisma.report.findUnique({
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
  } finally {
    await prisma.$disconnect();
  }
}

// Get all skills (to show in the skill selection UI)
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

const deleteReport = (id: string, dbUrl: string): Promise<StatusResponse<null>> => {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  return new Promise((resolve, reject) => {
    prisma.report
      .delete({
        where: { id }
      })
      .then(() => {
        resolve({
          status: "success",
          message: "تم حذف التقرير بنجاح",
        });
      })
      .catch((error: any) => {
        console.log("ERROR [deleteReport]: ", error);
        reject({
          status: "error",
          message: "فشل حذف التقرير",
        });
      });
  });
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
async function calculateStatistics(dbUrl: string): Promise<ReportStatistics> {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    // Fetch all the necessary data
    const reports = await prisma.report.findMany({
      include: {
        user: {
          include: {
            userSchool: {
              include: {
                eduAdmin: true
              }
            }
          }
        }
      }
    });

    const regions = await prisma.region.findMany();
    const eduAdmins = await prisma.eduAdmin.findMany();
    const schools = await prisma.school.findMany();

    // Create maps for quick lookups
    const regionMap = new Map(regions.map(r => [r.id, r.name]));
    const eduAdminMap = new Map(eduAdmins.map(ea => [ea.id, { name: ea.name, regionId: ea.regionId }]));

    // Calculate Global Totals
    const globalTotalsData = sumReportFields(reports as unknown as Report[]);

    const globalTotals: GlobalTotals = {
      ...globalTotalsData,
      schoolsCount: schools.length,
      trainers: new Set(reports.filter(r => r.user?.schoolId).map(r => r.user?.id)).size
    };

    // Calculate Region Stats
    const regionStats: RegionStat[] = regions.map(region => {
      const regionReports = reports.filter(report => report.user?.userSchool?.eduAdmin?.regionId === region.id);
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

    // Calculate EduAdmin Stats
    const eduAdminStats: EduAdminStat[] = eduAdmins.map(eduAdmin => {
      const eduAdminReports = reports.filter(report => report.user?.userSchool?.eduAdminId === eduAdmin.id);
      const eduAdminTotals = sumReportFields(eduAdminReports as unknown as Report[]);

      return {
        eduAdminId: eduAdmin.id,
        eduAdminName: eduAdmin.name,
        regionName: regionMap.get(eduAdmin.regionId) || "غير محدد",
        volunteerHoursPercentage: globalTotals.volunteerHours > 0 ? (eduAdminTotals.volunteerHours / globalTotals.volunteerHours) * 100 : 0,
        economicValuePercentage: globalTotals.economicValue > 0 ? (eduAdminTotals.economicValue / globalTotals.economicValue) * 100 : 0,
        volunteerOpportunitiesPercentage: globalTotals.volunteerOpportunities > 0 ? (eduAdminTotals.volunteerOpportunities / globalTotals.volunteerOpportunities) * 100 : 0,
        activitiesCountPercentage: globalTotals.activitiesCount > 0 ? (eduAdminTotals.activitiesCount / globalTotals.activitiesCount) * 100 : 0,
        volunteerCountPercentage: globalTotals.volunteerCount > 0 ? (eduAdminTotals.volunteerCount / globalTotals.volunteerCount) * 100 : 0,
      };
    });

    // Calculate School Stats
    const schoolStats: SchoolStat[] = schools.map(school => {
      const schoolReports = reports.filter(report => report.user?.schoolId === school.id);
      const schoolTotals = sumReportFields(schoolReports as unknown as Report[]);

      const eduAdminInfo = eduAdminMap.get(school.eduAdminId);
      const regionName = eduAdminInfo ? regionMap.get(eduAdminInfo.regionId) : "غير محدد";

      return {
        schoolId: school.id,
        schoolName: school.name,
        eduAdminName: eduAdminInfo?.name || "غير محدد",
        regionName: regionName || "غير محدد",
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
  } finally {
    await prisma.$disconnect();
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
async function getUserTotalStats(userId: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    // Fetch all reports for this specific user
    const userReports = await prisma.report.findMany({
      where: {
        userId: userId
      }
    });

    return { success: true, data: getTotalStatsFromReports(userReports) };
  } catch (error: any) {
    console.error("Error fetching user statistics:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get total statistics for a specific school from all its users' reports
 */
async function getSchoolTotalStats(schoolId: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    // Fetch all reports for users in this school
    const schoolReports = await prisma.report.findMany({
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
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get total statistics for a specific eduAdmin from all its users' reports
 */
async function getEduAdminTotalStats(eduAdminId: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    // Fetch all reports for users in this eduAdmin (either directly or through schools)
    const eduAdminReports = await prisma.report.findMany({
      where: {
       user: { userSchool: { eduAdminId } } 
      }
    });

    return { success: true, data: getTotalStatsFromReports(eduAdminReports) };
  } catch (error: any) {
    console.error("Error fetching eduAdmin statistics:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get total statistics for a specific region from all its users' reports
 */
async function getRegionTotalStats(regionId: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    // Fetch all reports for users in this region (directly or through eduAdmins/schools)
    const regionReports = await prisma.report.findMany({
      where: {
         user: { userSchool: { eduAdmin: { regionId } } } 
      }
    });

    return { success: true, data: getTotalStatsFromReports(regionReports) };
  } catch (error: any) {
    console.error("Error fetching region statistics:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
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
  getRegionTotalStats
};