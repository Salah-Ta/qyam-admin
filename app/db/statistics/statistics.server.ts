import {
    DashStatistics
} from "~/types/types";
import { client } from "../db-client.server";

const initializeDatabase = (dbUrl?: string) => {
    const db = dbUrl ? client(dbUrl) : client();
    if (!db) {
        throw new Error("فشل الاتصال بقاعدة البيانات");
    }
    return db;
};
async function getAdminDashboardDataStatistics(dbUrl?: string, filters?: {
    regionId?: string;
    eduAdminId?: string;
    schoolId?: string;
}): Promise<DashStatistics> {

    const db = initializeDatabase(dbUrl);

    // Get all data to calculate totals first
    const [regions, eduAdmins, schools, reports, users] = await Promise.all([
        db.region.findMany(),
        db.eduAdmin.findMany(), 
        db.school.findMany(),
        db.report.findMany({ include: { user: true } }),
        db.user.findMany()
    ]);

    // Calculate totals from all reports
    const totalStats = reports.reduce((acc, report) => ({
        volunteerHours: acc.volunteerHours + (report.volunteerHours || 0),
        economicValue: acc.economicValue + (report.economicValue || 0),
        volunteerOpportunities: acc.volunteerOpportunities + (report.volunteerOpportunities || 0),
        activitiesCount: acc.activitiesCount + (report.activitiesCount || 0),
        volunteerCount: acc.volunteerCount + (report.volunteerCount || 0),
        skillsEconomicValue: acc.skillsEconomicValue + (report.skillsEconomicValue || 0),
        skillsTrainedCount: acc.skillsTrainedCount + (report.skillsTrainedCount || 0)
    }), {
        volunteerHours: 0,
        economicValue: 0, 
        volunteerOpportunities: 0,
        activitiesCount: 0,
        volunteerCount: 0,
        skillsEconomicValue: 0,
        skillsTrainedCount: 0
    });

    // Calculate total trainers: users with schoolId and not admin/supervisor
    const totalTrainers = users.filter(user => 
        user.schoolId && 
        user.role !== 'admin' && 
        user.role !== 'supervisor'
    ).length;

    // School filter has highest priority
    if (filters?.schoolId) {
        // Filter data by school
        const filteredReports = reports.filter(report => report.user?.schoolId === filters.schoolId);
        
        const filteredStats = filteredReports.reduce((acc, report) => ({
            volunteerHours: acc.volunteerHours + (report.volunteerHours || 0),
            economicValue: acc.economicValue + (report.economicValue || 0),
            volunteerOpportunities: acc.volunteerOpportunities + (report.volunteerOpportunities || 0),
            activitiesCount: acc.activitiesCount + (report.activitiesCount || 0),
            volunteerCount: acc.volunteerCount + (report.volunteerCount || 0),
            skillsEconomicValue: acc.skillsEconomicValue + (report.skillsEconomicValue || 0),
            skillsTrainedCount: acc.skillsTrainedCount + (report.skillsTrainedCount || 0)
        }), {
            volunteerHours: 0,
            economicValue: 0, 
            volunteerOpportunities: 0,
            activitiesCount: 0,
            volunteerCount: 0,
            skillsEconomicValue: 0,
            skillsTrainedCount: 0
        });

        // Calculate filtered trainers: trainers who belong to this specific school
        const filteredTrainers = users.filter(user => 
            user.schoolId === filters.schoolId && 
            user.role !== 'admin' && 
            user.role !== 'supervisor'
        ).length;

        return {
            regionsTotal: regions.length,
            regionsFiltered: 1,
            eduAdminsTotal: eduAdmins.length,
            eduAdminsFiltered: 1,
            schoolsTotal: schools.length,
            schoolsFiltered: 1,
            reportsTotal: reports.length,
            reportsFiltered: filteredReports.length,
            trainersTotal: totalTrainers,
            trainersFiltered: filteredTrainers,
            volunteerHoursTotal: totalStats.volunteerHours,
            volunteerHoursFiltered: filteredStats.volunteerHours,
            economicValueTotal: totalStats.economicValue,
            economicValueFiltered: filteredStats.economicValue,
            volunteerOpportunitiesTotal: totalStats.volunteerOpportunities,
            volunteerOpportunitiesFiltered: filteredStats.volunteerOpportunities,
            activitiesCountTotal: totalStats.activitiesCount,
            activitiesCountFiltered: filteredStats.activitiesCount,
            volunteerCountTotal: totalStats.volunteerCount,
            volunteerCountFiltered: filteredStats.volunteerCount,
            skillsEconomicValueTotal: totalStats.skillsEconomicValue,
            skillsEconomicValueFiltered: filteredStats.skillsEconomicValue,
            skillsTrainedCountTotal: totalStats.skillsTrainedCount,
            skillsTrainedCountFiltered: filteredStats.skillsTrainedCount
        };
    }

    // EduAdmin filter has second priority
    if (filters?.eduAdminId) {
        const filteredReports = reports.filter(report => report.user?.eduAdminId === filters.eduAdminId);
        const filteredSchools = schools.filter(school => school.eduAdminId === filters.eduAdminId);
        
        const filteredStats = filteredReports.reduce((acc, report) => ({
            volunteerHours: acc.volunteerHours + (report.volunteerHours || 0),
            economicValue: acc.economicValue + (report.economicValue || 0),
            volunteerOpportunities: acc.volunteerOpportunities + (report.volunteerOpportunities || 0),
            activitiesCount: acc.activitiesCount + (report.activitiesCount || 0),
            volunteerCount: acc.volunteerCount + (report.volunteerCount || 0),
            skillsEconomicValue: acc.skillsEconomicValue + (report.skillsEconomicValue || 0),
            skillsTrainedCount: acc.skillsTrainedCount + (report.skillsTrainedCount || 0)
        }), {
            volunteerHours: 0,
            economicValue: 0, 
            volunteerOpportunities: 0,
            activitiesCount: 0,
            volunteerCount: 0,
            skillsEconomicValue: 0,
            skillsTrainedCount: 0
        });

        // Calculate filtered trainers: trainers who belong to schools under this eduAdmin
        const schoolIds = filteredSchools.map(school => school.id);
        const filteredTrainers = users.filter(user => 
            schoolIds.includes(user.schoolId) && 
            user.role !== 'admin' && 
            user.role !== 'supervisor'
        ).length;

        return {
            regionsTotal: regions.length,
            regionsFiltered: 1,
            eduAdminsTotal: eduAdmins.length,
            eduAdminsFiltered: 1,
            schoolsTotal: schools.length,
            schoolsFiltered: filteredSchools.length,
            reportsTotal: reports.length,
            reportsFiltered: filteredReports.length,
            trainersTotal: totalTrainers,
            trainersFiltered: filteredTrainers,
            volunteerHoursTotal: totalStats.volunteerHours,
            volunteerHoursFiltered: filteredStats.volunteerHours,
            economicValueTotal: totalStats.economicValue,
            economicValueFiltered: filteredStats.economicValue,
            volunteerOpportunitiesTotal: totalStats.volunteerOpportunities,
            volunteerOpportunitiesFiltered: filteredStats.volunteerOpportunities,
            activitiesCountTotal: totalStats.activitiesCount,
            activitiesCountFiltered: filteredStats.activitiesCount,
            volunteerCountTotal: totalStats.volunteerCount,
            volunteerCountFiltered: filteredStats.volunteerCount,
            skillsEconomicValueTotal: totalStats.skillsEconomicValue,
            skillsEconomicValueFiltered: filteredStats.skillsEconomicValue,
            skillsTrainedCountTotal: totalStats.skillsTrainedCount,
            skillsTrainedCountFiltered: filteredStats.skillsTrainedCount
        };
    }

    // Region filter has third priority
    if (filters?.regionId) {
        const filteredReports = reports.filter(report => report.user?.regionId === filters.regionId);
        const filteredEduAdmins = eduAdmins.filter(eduAdmin => eduAdmin.regionId === filters.regionId);
        const filteredSchools = schools.filter(school => 
            filteredEduAdmins.some(ea => ea.id === school.eduAdminId)
        );
        
        const filteredStats = filteredReports.reduce((acc, report) => ({
            volunteerHours: acc.volunteerHours + (report.volunteerHours || 0),
            economicValue: acc.economicValue + (report.economicValue || 0),
            volunteerOpportunities: acc.volunteerOpportunities + (report.volunteerOpportunities || 0),
            activitiesCount: acc.activitiesCount + (report.activitiesCount || 0),
            volunteerCount: acc.volunteerCount + (report.volunteerCount || 0),
            skillsEconomicValue: acc.skillsEconomicValue + (report.skillsEconomicValue || 0),
            skillsTrainedCount: acc.skillsTrainedCount + (report.skillsTrainedCount || 0)
        }), {
            volunteerHours: 0,
            economicValue: 0, 
            volunteerOpportunities: 0,
            activitiesCount: 0,
            volunteerCount: 0,
            skillsEconomicValue: 0,
            skillsTrainedCount: 0
        });

        // Calculate filtered trainers: trainers who belong to schools under this region
        const schoolIds = filteredSchools.map(school => school.id);
        const filteredTrainers = users.filter(user => 
            schoolIds.includes(user.schoolId) && 
            user.role !== 'admin' && 
            user.role !== 'supervisor'
        ).length;

        return {
            regionsTotal: regions.length,
            regionsFiltered: 1,
            eduAdminsTotal: eduAdmins.length,
            eduAdminsFiltered: filteredEduAdmins.length,
            schoolsTotal: schools.length,
            schoolsFiltered: filteredSchools.length,
            reportsTotal: reports.length,
            reportsFiltered: filteredReports.length,
            trainersTotal: totalTrainers,
            trainersFiltered: filteredTrainers,
            volunteerHoursTotal: totalStats.volunteerHours,
            volunteerHoursFiltered: filteredStats.volunteerHours,
            economicValueTotal: totalStats.economicValue,
            economicValueFiltered: filteredStats.economicValue,
            volunteerOpportunitiesTotal: totalStats.volunteerOpportunities,
            volunteerOpportunitiesFiltered: filteredStats.volunteerOpportunities,
            activitiesCountTotal: totalStats.activitiesCount,
            activitiesCountFiltered: filteredStats.activitiesCount,
            volunteerCountTotal: totalStats.volunteerCount,
            volunteerCountFiltered: filteredStats.volunteerCount,
            skillsEconomicValueTotal: totalStats.skillsEconomicValue,
            skillsEconomicValueFiltered: filteredStats.skillsEconomicValue,
            skillsTrainedCountTotal: totalStats.skillsTrainedCount,
            skillsTrainedCountFiltered: filteredStats.skillsTrainedCount
        };
    }

    // If no filters provided, return totals with filtered values equal to totals
    return {
        regionsTotal: regions.length,
        regionsFiltered: regions.length,
        eduAdminsTotal: eduAdmins.length,
        eduAdminsFiltered: eduAdmins.length,
        schoolsTotal: schools.length,
        schoolsFiltered: schools.length,
        reportsTotal: reports.length,
        reportsFiltered: reports.length,
        trainersTotal: totalTrainers,
        trainersFiltered: totalTrainers,
        volunteerHoursTotal: totalStats.volunteerHours,
        volunteerHoursFiltered: totalStats.volunteerHours,
        economicValueTotal: totalStats.economicValue,
        economicValueFiltered: totalStats.economicValue,
        volunteerOpportunitiesTotal: totalStats.volunteerOpportunities,
        volunteerOpportunitiesFiltered: totalStats.volunteerOpportunities,
        activitiesCountTotal: totalStats.activitiesCount,
        activitiesCountFiltered: totalStats.activitiesCount,
        volunteerCountTotal: totalStats.volunteerCount,
        volunteerCountFiltered: totalStats.volunteerCount,
        skillsEconomicValueTotal: totalStats.skillsEconomicValue,
        skillsEconomicValueFiltered: totalStats.skillsEconomicValue,
        skillsTrainedCountTotal: totalStats.skillsTrainedCount,
        skillsTrainedCountFiltered: totalStats.skillsTrainedCount
    };
}

async function getRegionalBreakdown(dbUrl?: string) {
    const db = initializeDatabase(dbUrl);

    // Get all data
    const [regions, eduAdmins, schools, reports, users] = await Promise.all([
        db.region.findMany(),
        db.eduAdmin.findMany(),
        db.school.findMany(),
        db.report.findMany({ include: { user: true } }),
        db.user.findMany()
    ]);

    // Calculate statistics for each region
    const regionalStats = regions.map(region => {
        // Get eduAdmins for this region
        const regionEduAdmins = eduAdmins.filter(ea => ea.regionId === region.id);
        const eduAdminIds = regionEduAdmins.map(ea => ea.id);
        
        // Get schools for this region
        const regionSchools = schools.filter(school => 
            eduAdminIds.includes(school.eduAdminId)
        );
        const schoolIds = regionSchools.map(school => school.id);
        
        // Get users for this region
        const regionUsers = users.filter(user => schoolIds.includes(user.schoolId));
        const regionTrainers = regionUsers.filter(user => 
            user.role !== 'admin' && user.role !== 'supervisor'
        );
        
        // Get reports for this region
        const regionReports = reports.filter(report => 
            regionUsers.some(user => user.id === report.userId)
        );
        
        // Calculate totals
        const stats = regionReports.reduce((acc, report) => ({
            volunteerHours: acc.volunteerHours + (report.volunteerHours || 0),
            economicValue: acc.economicValue + (report.economicValue || 0),
            volunteerOpportunities: acc.volunteerOpportunities + (report.volunteerOpportunities || 0),
            activitiesCount: acc.activitiesCount + (report.activitiesCount || 0),
            volunteerCount: acc.volunteerCount + (report.volunteerCount || 0),
            skillsEconomicValue: acc.skillsEconomicValue + (report.skillsEconomicValue || 0),
            skillsTrainedCount: acc.skillsTrainedCount + (report.skillsTrainedCount || 0)
        }), {
            volunteerHours: 0,
            economicValue: 0,
            volunteerOpportunities: 0,
            activitiesCount: 0,
            volunteerCount: 0,
            skillsEconomicValue: 0,
            skillsTrainedCount: 0
        });

        return {
            id: region.id,
            name: region.name,
            schoolsCount: regionSchools.length,
            trainersCount: regionTrainers.length,
            reportsCount: regionReports.length,
            ...stats
        };
    });

    return regionalStats;
}

async function getEduAdminBreakdown(dbUrl?: string) {
    const db = initializeDatabase(dbUrl);

    // Get all data
    const [eduAdmins, schools, reports, users] = await Promise.all([
        db.eduAdmin.findMany(),
        db.school.findMany(),
        db.report.findMany({ include: { user: true } }),
        db.user.findMany()
    ]);

    // Calculate statistics for each eduAdmin
    const eduAdminStats = eduAdmins.map(eduAdmin => {
        // Get schools for this eduAdmin
        const eduAdminSchools = schools.filter(school => school.eduAdminId === eduAdmin.id);
        const schoolIds = eduAdminSchools.map(school => school.id);
        
        // Get users for this eduAdmin
        const eduAdminUsers = users.filter(user => schoolIds.includes(user.schoolId));
        const eduAdminTrainers = eduAdminUsers.filter(user => 
            user.role !== 'admin' && user.role !== 'supervisor'
        );
        
        // Get reports for this eduAdmin
        const eduAdminReports = reports.filter(report => 
            eduAdminUsers.some(user => user.id === report.userId)
        );
        
        // Calculate totals
        const stats = eduAdminReports.reduce((acc, report) => ({
            volunteerHours: acc.volunteerHours + (report.volunteerHours || 0),
            economicValue: acc.economicValue + (report.economicValue || 0),
            volunteerOpportunities: acc.volunteerOpportunities + (report.volunteerOpportunities || 0),
            activitiesCount: acc.activitiesCount + (report.activitiesCount || 0),
            volunteerCount: acc.volunteerCount + (report.volunteerCount || 0),
            skillsEconomicValue: acc.skillsEconomicValue + (report.skillsEconomicValue || 0),
            skillsTrainedCount: acc.skillsTrainedCount + (report.skillsTrainedCount || 0)
        }), {
            volunteerHours: 0,
            economicValue: 0,
            volunteerOpportunities: 0,
            activitiesCount: 0,
            volunteerCount: 0,
            skillsEconomicValue: 0,
            skillsTrainedCount: 0
        });

        return {
            id: eduAdmin.id,
            name: eduAdmin.name,
            schoolsCount: eduAdminSchools.length,
            trainersCount: eduAdminTrainers.length,
            reportsCount: eduAdminReports.length,
            ...stats
        };
    });

    return eduAdminStats;
}

// Export the function
const statisticsService = {
    getAdminDashboardDataStatistics,
    getRegionalBreakdown,
    getEduAdminBreakdown
};

export default statisticsService;