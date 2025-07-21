import {
    DashStatistics
} from "~/types/types";
import { client } from "../db-client.server";
import { PrismaClient } from "@prisma/client";

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

    // Update totals calculation with correct trainer definition
    const [totalStatsResult] = await db.$queryRaw<Array<{
        regions_total: number;
        eduadmins_total: number;
        schools_total: number;
        trainers_total: number;
        reports_total: number;
        volunteer_hours_total: number;
        economic_value_total: number;
        volunteer_opportunities_total: number;
        activities_count_total: number;
        volunteer_count_total: number;
        skills_economic_value_total: number;
        skills_trained_count_total: number;
    }>>`
        SELECT 
            (SELECT COUNT(*)::INTEGER FROM "region") as regions_total,
            (SELECT COUNT(*)::INTEGER FROM "eduAdministration") as eduadmins_total,
            (SELECT COUNT(*)::INTEGER FROM "school") as schools_total,
            (SELECT COUNT(*)::INTEGER FROM public."user" WHERE "schoolId" IS NOT NULL AND role = 'user') as trainers_total,
            (SELECT COUNT(*)::INTEGER FROM "report") as reports_total,
            (SELECT COALESCE(SUM("volunteerHours"), 0)::INTEGER FROM "report") as volunteer_hours_total,
            (SELECT COALESCE(SUM("economicValue"), 0)::INTEGER FROM "report") as economic_value_total,
            (SELECT COALESCE(SUM("volunteerOpportunities"), 0)::INTEGER FROM "report") as volunteer_opportunities_total,
            (SELECT COALESCE(SUM("activitiesCount"), 0)::INTEGER FROM "report") as activities_count_total,
            (SELECT COALESCE(SUM("volunteerCount"), 0)::INTEGER FROM "report") as volunteer_count_total,
            (SELECT COALESCE(SUM("skillsEconomicValue"), 0)::INTEGER FROM "report") as skills_economic_value_total,
            (SELECT COALESCE(SUM("skillsTrainedCount"), 0)::INTEGER FROM "report") as skills_trained_count_total
    `;

    // Convert BigInt to Number
    const totals = {
        regions_total: Number(totalStatsResult.regions_total),
        eduadmins_total: Number(totalStatsResult.eduadmins_total),
        schools_total: Number(totalStatsResult.schools_total),
        trainers_total: Number(totalStatsResult.trainers_total),
        reports_total: Number(totalStatsResult.reports_total),
        volunteer_hours_total: Number(totalStatsResult.volunteer_hours_total),
        economic_value_total: Number(totalStatsResult.economic_value_total),
        volunteer_opportunities_total: Number(totalStatsResult.volunteer_opportunities_total),
        activities_count_total: Number(totalStatsResult.activities_count_total),
        volunteer_count_total: Number(totalStatsResult.volunteer_count_total),
        skills_economic_value_total: Number(totalStatsResult.skills_economic_value_total),
        skills_trained_count_total: Number(totalStatsResult.skills_trained_count_total)
    };

    // If no filters, return totals immediately
    if (!filters?.schoolId && !filters?.eduAdminId && !filters?.regionId) {
        return {
            regionsTotal: totals.regions_total,
            regionsFiltered: totals.regions_total,
            eduAdminsTotal: totals.eduadmins_total,
            eduAdminsFiltered: totals.eduadmins_total,
            schoolsTotal: totals.schools_total,
            schoolsFiltered: totals.schools_total,
            reportsTotal: totals.reports_total,
            reportsFiltered: totals.reports_total,
            trainersTotal: totals.trainers_total,
            trainersFiltered: totals.trainers_total,
            volunteerHoursTotal: totals.volunteer_hours_total,
            volunteerHoursFiltered: totals.volunteer_hours_total,
            economicValueTotal: totals.economic_value_total,
            economicValueFiltered: totals.economic_value_total,
            volunteerOpportunitiesTotal: totals.volunteer_opportunities_total,
            volunteerOpportunitiesFiltered: totals.volunteer_opportunities_total,
            activitiesCountTotal: totals.activities_count_total,
            activitiesCountFiltered: totals.activities_count_total,
            volunteerCountTotal: totals.volunteer_count_total,
            volunteerCountFiltered: totals.volunteer_count_total,
            skillsEconomicValueTotal: totals.skills_economic_value_total,
            skillsEconomicValueFiltered: totals.skills_economic_value_total,
            skillsTrainedCountTotal: totals.skills_trained_count_total,
            skillsTrainedCountFiltered: totals.skills_trained_count_total
        };
    }

    // UPDATED: School filter with correct trainer definition
    if (filters?.schoolId) {
        const [filteredResult] = await db.$queryRaw<Array<{
            trainers_count: number;
            reports_count: number;
            volunteer_hours: number;
            economic_value: number;
            volunteer_opportunities: number;
            activities_count: number;
            volunteer_count: number;
            skills_economic_value: number;
            skills_trained_count: number;
        }>>`
            SELECT 
                COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::INTEGER as trainers_count,
                COUNT(DISTINCT rep.id)::INTEGER as reports_count,
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as volunteer_hours,
                COALESCE(SUM(rep."economicValue"), 0)::INTEGER as economic_value,
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as volunteer_opportunities,
                COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as activities_count,
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as volunteer_count,
                COALESCE(SUM(rep."skillsEconomicValue"), 0)::INTEGER as skills_economic_value,
                COALESCE(SUM(rep."skillsTrainedCount"), 0)::INTEGER as skills_trained_count
            FROM public."user" u
            LEFT JOIN "report" rep ON rep."userId" = u.id
            WHERE u."schoolId" = ${filters.schoolId}
        `;

        const filtered = {
            trainers_count: Number(filteredResult.trainers_count),
            reports_count: Number(filteredResult.reports_count),
            volunteer_hours: Number(filteredResult.volunteer_hours),
            economic_value: Number(filteredResult.economic_value),
            volunteer_opportunities: Number(filteredResult.volunteer_opportunities),
            activities_count: Number(filteredResult.activities_count),
            volunteer_count: Number(filteredResult.volunteer_count),
            skills_economic_value: Number(filteredResult.skills_economic_value),
            skills_trained_count: Number(filteredResult.skills_trained_count)
        };

        return {
            regionsTotal: totals.regions_total,
            regionsFiltered: 1,
            eduAdminsTotal: totals.eduadmins_total,
            eduAdminsFiltered: 1,
            schoolsTotal: totals.schools_total,
            schoolsFiltered: 1,
            reportsTotal: totals.reports_total,
            reportsFiltered: filtered.reports_count,
            trainersTotal: totals.trainers_total,
            trainersFiltered: filtered.trainers_count,
            volunteerHoursTotal: totals.volunteer_hours_total,
            volunteerHoursFiltered: filtered.volunteer_hours,
            economicValueTotal: totals.economic_value_total,
            economicValueFiltered: filtered.economic_value,
            volunteerOpportunitiesTotal: totals.volunteer_opportunities_total,
            volunteerOpportunitiesFiltered: filtered.volunteer_opportunities,
            activitiesCountTotal: totals.activities_count_total,
            activitiesCountFiltered: filtered.activities_count,
            volunteerCountTotal: totals.volunteer_count_total,
            volunteerCountFiltered: filtered.volunteer_count,
            skillsEconomicValueTotal: totals.skills_economic_value_total,
            skillsEconomicValueFiltered: filtered.skills_economic_value,
            skillsTrainedCountTotal: totals.skills_trained_count_total,
            skillsTrainedCountFiltered: filtered.skills_trained_count
        };
    }

    // UPDATED: EduAdmin filter with correct trainer definition
    if (filters?.eduAdminId) {
        const [filteredResult] = await db.$queryRaw<Array<{
            schools_count: number;
            trainers_count: number;
            reports_count: number;
            volunteer_hours: number;
            economic_value: number;
            volunteer_opportunities: number;
            activities_count: number;
            volunteer_count: number;
            skills_economic_value: number;
            skills_trained_count: number;
        }>>`
            SELECT 
                COUNT(DISTINCT s.id)::INTEGER as schools_count,
                COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::INTEGER as trainers_count,
                COUNT(DISTINCT rep.id)::INTEGER as reports_count,
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as volunteer_hours,
                COALESCE(SUM(rep."economicValue"), 0)::INTEGER as economic_value,
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as volunteer_opportunities,
                COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as activities_count,
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as volunteer_count,
                COALESCE(SUM(rep."skillsEconomicValue"), 0)::INTEGER as skills_economic_value,
                COALESCE(SUM(rep."skillsTrainedCount"), 0)::INTEGER as skills_trained_count
            FROM "school" s
            LEFT JOIN public."user" u ON u."schoolId" = s.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
            WHERE s."eduAdminId" = ${filters.eduAdminId}
        `;

        const filtered = {
            schools_count: Number(filteredResult.schools_count),
            trainers_count: Number(filteredResult.trainers_count),
            reports_count: Number(filteredResult.reports_count),
            volunteer_hours: Number(filteredResult.volunteer_hours),
            economic_value: Number(filteredResult.economic_value),
            volunteer_opportunities: Number(filteredResult.volunteer_opportunities),
            activities_count: Number(filteredResult.activities_count),
            volunteer_count: Number(filteredResult.volunteer_count),
            skills_economic_value: Number(filteredResult.skills_economic_value),
            skills_trained_count: Number(filteredResult.skills_trained_count)
        };

        return {
            regionsTotal: totals.regions_total,
            regionsFiltered: 1,
            eduAdminsTotal: totals.eduadmins_total,
            eduAdminsFiltered: 1,
            schoolsTotal: totals.schools_total,
            schoolsFiltered: filtered.schools_count,
            reportsTotal: totals.reports_total,
            reportsFiltered: filtered.reports_count,
            trainersTotal: totals.trainers_total,
            trainersFiltered: filtered.trainers_count,
            volunteerHoursTotal: totals.volunteer_hours_total,
            volunteerHoursFiltered: filtered.volunteer_hours,
            economicValueTotal: totals.economic_value_total,
            economicValueFiltered: filtered.economic_value,
            volunteerOpportunitiesTotal: totals.volunteer_opportunities_total,
            volunteerOpportunitiesFiltered: filtered.volunteer_opportunities,
            activitiesCountTotal: totals.activities_count_total,
            activitiesCountFiltered: filtered.activities_count,
            volunteerCountTotal: totals.volunteer_count_total,
            volunteerCountFiltered: filtered.volunteer_count,
            skillsEconomicValueTotal: totals.skills_economic_value_total,
            skillsEconomicValueFiltered: filtered.skills_economic_value,
            skillsTrainedCountTotal: totals.skills_trained_count_total,
            skillsTrainedCountFiltered: filtered.skills_trained_count
        };
    }

    // UPDATED: Region filter with correct trainer definition
    if (filters?.regionId) {
        const [filteredResult] = await db.$queryRaw<Array<{
            eduadmins_count: number;
            schools_count: number;
            trainers_count: number;
            reports_count: number;
            volunteer_hours: number;
            economic_value: number;
            volunteer_opportunities: number;
            activities_count: number;
            volunteer_count: number;
            skills_economic_value: number;
            skills_trained_count: number;
        }>>`
            SELECT 
                COUNT(DISTINCT ea.id)::INTEGER as eduadmins_count,
                COUNT(DISTINCT s.id)::INTEGER as schools_count,
                COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::INTEGER as trainers_count,
                COUNT(DISTINCT rep.id)::INTEGER as reports_count,
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as volunteer_hours,
                COALESCE(SUM(rep."economicValue"), 0)::INTEGER as economic_value,
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as volunteer_opportunities,
                COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as activities_count,
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as volunteer_count,
                COALESCE(SUM(rep."skillsEconomicValue"), 0)::INTEGER as skills_economic_value,
                COALESCE(SUM(rep."skillsTrainedCount"), 0)::INTEGER as skills_trained_count
            FROM "eduAdministration" ea
            LEFT JOIN "school" s ON s."eduAdminId" = ea.id
            LEFT JOIN public."user" u ON u."schoolId" = s.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
            WHERE ea."regionId" = ${filters.regionId}
        `;

        const filtered = {
            eduadmins_count: Number(filteredResult.eduadmins_count),
            schools_count: Number(filteredResult.schools_count),
            trainers_count: Number(filteredResult.trainers_count),
            reports_count: Number(filteredResult.reports_count),
            volunteer_hours: Number(filteredResult.volunteer_hours),
            economic_value: Number(filteredResult.economic_value),
            volunteer_opportunities: Number(filteredResult.volunteer_opportunities),
            activities_count: Number(filteredResult.activities_count),
            volunteer_count: Number(filteredResult.volunteer_count),
            skills_economic_value: Number(filteredResult.skills_economic_value),
            skills_trained_count: Number(filteredResult.skills_trained_count)
        };

        return {
            regionsTotal: totals.regions_total,
            regionsFiltered: 1,
            eduAdminsTotal: totals.eduadmins_total,
            eduAdminsFiltered: filtered.eduadmins_count,
            schoolsTotal: totals.schools_total,
            schoolsFiltered: filtered.schools_count,
            reportsTotal: totals.reports_total,
            reportsFiltered: filtered.reports_count,
            trainersTotal: totals.trainers_total,
            trainersFiltered: filtered.trainers_count,
            volunteerHoursTotal: totals.volunteer_hours_total,
            volunteerHoursFiltered: filtered.volunteer_hours,
            economicValueTotal: totals.economic_value_total,
            economicValueFiltered: filtered.economic_value,
            volunteerOpportunitiesTotal: totals.volunteer_opportunities_total,
            volunteerOpportunitiesFiltered: filtered.volunteer_opportunities,
            activitiesCountTotal: totals.activities_count_total,
            activitiesCountFiltered: filtered.activities_count,
            volunteerCountTotal: totals.volunteer_count_total,
            volunteerCountFiltered: filtered.volunteer_count,
            skillsEconomicValueTotal: totals.skills_economic_value_total,
            skillsEconomicValueFiltered: filtered.skills_economic_value,
            skillsTrainedCountTotal: totals.skills_trained_count_total,
            skillsTrainedCountFiltered: filtered.skills_trained_count
        };
    }

    // Fallback return
    return {
        regionsTotal: totals.regions_total,
        regionsFiltered: totals.regions_total,
        eduAdminsTotal: totals.eduadmins_total,
        eduAdminsFiltered: totals.eduadmins_total,
        schoolsTotal: totals.schools_total,
        schoolsFiltered: totals.schools_total,
        reportsTotal: totals.reports_total,
        reportsFiltered: totals.reports_total,
        trainersTotal: totals.trainers_total,
        trainersFiltered: totals.trainers_total,
        volunteerHoursTotal: totals.volunteer_hours_total,
        volunteerHoursFiltered: totals.volunteer_hours_total,
        economicValueTotal: totals.economic_value_total,
        economicValueFiltered: totals.economic_value_total,
        volunteerOpportunitiesTotal: totals.volunteer_opportunities_total,
        volunteerOpportunitiesFiltered: totals.volunteer_opportunities_total,
        activitiesCountTotal: totals.activities_count_total,
        activitiesCountFiltered: totals.activities_count_total,
        volunteerCountTotal: totals.volunteer_count_total,
        volunteerCountFiltered: totals.volunteer_count_total,
        skillsEconomicValueTotal: totals.skills_economic_value_total,
        skillsEconomicValueFiltered: totals.skills_economic_value_total,
        skillsTrainedCountTotal: totals.skills_trained_count_total,
        skillsTrainedCountFiltered: totals.skills_trained_count_total
    };
}

// UPDATED: Regional breakdown with correct trainer definition
async function getRegionalBreakdown(dbUrl?: string) {
    const db = initializeDatabase(dbUrl);

    const regionalStats = await db.$queryRaw`
        SELECT 
            r.id,
            r.name,
            COUNT(DISTINCT s.id)::INTEGER as "schoolsCount",
            COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::INTEGER as "trainersCount",
            COUNT(DISTINCT rep.id)::INTEGER as "reportsCount",
            COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
            COALESCE(SUM(rep."economicValue"), 0)::INTEGER as "economicValue",
            COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
            COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as "activitiesCount",
            COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount",
            COALESCE(SUM(rep."skillsEconomicValue"), 0)::INTEGER as "skillsEconomicValue",
            COALESCE(SUM(rep."skillsTrainedCount"), 0)::INTEGER as "skillsTrainedCount"
        FROM "region" r
        LEFT JOIN "eduAdministration" ea ON ea."regionId" = r.id
        LEFT JOIN "school" s ON s."eduAdminId" = ea.id
        LEFT JOIN public."user" u ON u."schoolId" = s.id
        LEFT JOIN "report" rep ON rep."userId" = u.id
        GROUP BY r.id, r.name
        ORDER BY r.name
    `;

    return regionalStats.map((stat: any) => ({
        id: stat.id,
        name: stat.name,
        schoolsCount: Number(stat.schoolsCount),
        trainersCount: Number(stat.trainersCount),
        reportsCount: Number(stat.reportsCount),
        volunteerHours: Number(stat.volunteerHours),
        economicValue: Number(stat.economicValue),
        volunteerOpportunities: Number(stat.volunteerOpportunities),
        activitiesCount: Number(stat.activitiesCount),
        volunteerCount: Number(stat.volunteerCount),
        skillsEconomicValue: Number(stat.skillsEconomicValue),
        skillsTrainedCount: Number(stat.skillsTrainedCount)
    }));
}

// UPDATED: EduAdmin breakdown with correct trainer definition
async function getEduAdminBreakdown(dbUrl?: string) {
    const db = initializeDatabase(dbUrl);

    const eduAdminStats = await db.$queryRaw`
        SELECT 
            ea.id,
            ea.name,
            COUNT(DISTINCT s.id)::INTEGER as "schoolsCount",
            COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::INTEGER as "trainersCount",
            COUNT(DISTINCT rep.id)::INTEGER as "reportsCount",
            COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
            COALESCE(SUM(rep."economicValue"), 0)::INTEGER as "economicValue",
            COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
            COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as "activitiesCount",
            COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount",
            COALESCE(SUM(rep."skillsEconomicValue"), 0)::INTEGER as "skillsEconomicValue",
            COALESCE(SUM(rep."skillsTrainedCount"), 0)::INTEGER as "skillsTrainedCount"
        FROM "eduAdministration" ea
        LEFT JOIN "school" s ON s."eduAdminId" = ea.id
        LEFT JOIN public."user" u ON u."schoolId" = s.id
        LEFT JOIN "report" rep ON rep."userId" = u.id
        GROUP BY ea.id, ea.name
        ORDER BY ea.name
    `;

    return eduAdminStats.map((stat: any) => ({
        id: stat.id,
        name: stat.name,
        schoolsCount: Number(stat.schoolsCount),
        trainersCount: Number(stat.trainersCount),
        reportsCount: Number(stat.reportsCount),
        volunteerHours: Number(stat.volunteerHours),
        economicValue: Number(stat.economicValue),
        volunteerOpportunities: Number(stat.volunteerOpportunities),
        activitiesCount: Number(stat.activitiesCount),
        volunteerCount: Number(stat.volunteerCount),
        skillsEconomicValue: Number(stat.skillsEconomicValue),
        skillsTrainedCount: Number(stat.skillsTrainedCount)
    }));
}

// Export the function
const statisticsService = {
    getAdminDashboardDataStatistics,
    getRegionalBreakdown,  // This one is now optimized
    getEduAdminBreakdown   // This one is now optimized too
};

export default statisticsService;