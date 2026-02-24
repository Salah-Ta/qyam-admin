import {
    DashStatistics,
    UserStatistics
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

    // Consolidated query: single scan of report table + count subqueries for other tables
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
            (SELECT COUNT(*)::BIGINT FROM "region") as regions_total,
            (SELECT COUNT(*)::BIGINT FROM "eduAdministration" WHERE "regionId" IS NOT NULL) as eduadmins_total,
            (SELECT COUNT(*)::BIGINT FROM "school" s WHERE EXISTS (SELECT 1 FROM "eduAdministration" ea WHERE ea.id = s."eduAdminId" AND ea."regionId" IS NOT NULL)) as schools_total,
            (SELECT COUNT(*)::BIGINT FROM public."user" WHERE "schoolId" IS NOT NULL AND role = 'user') as trainers_total,
            (SELECT COUNT(*)::BIGINT FROM "report" r WHERE EXISTS (SELECT 1 FROM public."user" u WHERE u.id = r."userId")) as reports_total,
            (SELECT COALESCE(SUM(r."volunteerHours"), 0)::BIGINT FROM "report" r WHERE EXISTS (SELECT 1 FROM public."user" u WHERE u.id = r."userId")) as volunteer_hours_total,
            (SELECT COALESCE(SUM(r."economicValue"), 0)::BIGINT FROM "report" r WHERE EXISTS (SELECT 1 FROM public."user" u WHERE u.id = r."userId")) as economic_value_total,
            (SELECT COALESCE(SUM(r."volunteerOpportunities"), 0)::BIGINT FROM "report" r WHERE EXISTS (SELECT 1 FROM public."user" u WHERE u.id = r."userId")) as volunteer_opportunities_total,
            (SELECT COALESCE(SUM(r."activitiesCount"), 0)::BIGINT FROM "report" r WHERE EXISTS (SELECT 1 FROM public."user" u WHERE u.id = r."userId")) as activities_count_total,
            (SELECT COALESCE(SUM(r."volunteerCount"), 0)::BIGINT FROM "report" r WHERE EXISTS (SELECT 1 FROM public."user" u WHERE u.id = r."userId")) as volunteer_count_total,
            (SELECT COALESCE(SUM(r."skillsEconomicValue"), 0)::BIGINT FROM "report" r WHERE EXISTS (SELECT 1 FROM public."user" u WHERE u.id = r."userId")) as skills_economic_value_total,
            (SELECT COALESCE(SUM(r."skillsTrainedCount"), 0)::BIGINT FROM "report" r WHERE EXISTS (SELECT 1 FROM public."user" u WHERE u.id = r."userId")) as skills_trained_count_total
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
                COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::BIGINT as trainers_count,
                COUNT(DISTINCT rep.id)::BIGINT as reports_count,
                COALESCE(SUM(rep."volunteerHours"), 0)::BIGINT as volunteer_hours,
                COALESCE(SUM(rep."economicValue"), 0)::BIGINT as economic_value,
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::BIGINT as volunteer_opportunities,
                COALESCE(SUM(rep."activitiesCount"), 0)::BIGINT as activities_count,
                COALESCE(SUM(rep."volunteerCount"), 0)::BIGINT as volunteer_count,
                COALESCE(SUM(rep."skillsEconomicValue"), 0)::BIGINT as skills_economic_value,
                COALESCE(SUM(rep."skillsTrainedCount"), 0)::BIGINT as skills_trained_count
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
                COUNT(DISTINCT s.id)::BIGINT as schools_count,
                COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::BIGINT as trainers_count,
                COUNT(DISTINCT rep.id)::BIGINT as reports_count,
                COALESCE(SUM(rep."volunteerHours"), 0)::BIGINT as volunteer_hours,
                COALESCE(SUM(rep."economicValue"), 0)::BIGINT as economic_value,
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::BIGINT as volunteer_opportunities,
                COALESCE(SUM(rep."activitiesCount"), 0)::BIGINT as activities_count,
                COALESCE(SUM(rep."volunteerCount"), 0)::BIGINT as volunteer_count,
                COALESCE(SUM(rep."skillsEconomicValue"), 0)::BIGINT as skills_economic_value,
                COALESCE(SUM(rep."skillsTrainedCount"), 0)::BIGINT as skills_trained_count
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
                COUNT(DISTINCT ea.id)::BIGINT as eduadmins_count,
                COUNT(DISTINCT s.id)::BIGINT as schools_count,
                COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::BIGINT as trainers_count,
                COUNT(DISTINCT rep.id)::BIGINT as reports_count,
                COALESCE(SUM(rep."volunteerHours"), 0)::BIGINT as volunteer_hours,
                COALESCE(SUM(rep."economicValue"), 0)::BIGINT as economic_value,
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::BIGINT as volunteer_opportunities,
                COALESCE(SUM(rep."activitiesCount"), 0)::BIGINT as activities_count,
                COALESCE(SUM(rep."volunteerCount"), 0)::BIGINT as volunteer_count,
                COALESCE(SUM(rep."skillsEconomicValue"), 0)::BIGINT as skills_economic_value,
                COALESCE(SUM(rep."skillsTrainedCount"), 0)::BIGINT as skills_trained_count
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

    // Single query using CTE to combine students count and report stats
    const regionalStats = await db.$queryRaw`
        WITH user_students AS (
            SELECT
                u."regionId",
                COALESCE(SUM(u."noStudents"), 0)::BIGINT as "studentsCount"
            FROM public."user" u
            WHERE u.role = 'user' AND u."regionId" IS NOT NULL
            GROUP BY u."regionId"
        )
        SELECT
            r.id,
            r.name,
            COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::BIGINT as "trainersCount",
            COUNT(DISTINCT rep.id)::BIGINT as "reportsCount",
            COALESCE(SUM(rep."volunteerHours"), 0)::BIGINT as "volunteerHours",
            COALESCE(SUM(rep."economicValue"), 0)::BIGINT as "economicValue",
            COALESCE(SUM(rep."volunteerOpportunities"), 0)::BIGINT as "volunteerOpportunities",
            COALESCE(SUM(rep."activitiesCount"), 0)::BIGINT as "activitiesCount",
            COALESCE(SUM(rep."volunteerCount"), 0)::BIGINT as "volunteerCount",
            COALESCE(SUM(rep."skillsEconomicValue"), 0)::BIGINT as "skillsEconomicValue",
            COALESCE(SUM(rep."skillsTrainedCount"), 0)::BIGINT as "skillsTrainedCount",
            COALESCE(us."studentsCount", 0)::BIGINT as "studentsCount"
        FROM "region" r
        LEFT JOIN public."user" u ON u."regionId" = r.id
        LEFT JOIN "report" rep ON rep."userId" = u.id
        LEFT JOIN user_students us ON us."regionId" = r.id
        GROUP BY r.id, r.name, us."studentsCount"
        ORDER BY r.name
    `;

    return (regionalStats as any[]).map((stat: any) => ({
        id: stat.id,
        name: stat.name,
        trainersCount: Number(stat.trainersCount),
        reportsCount: Number(stat.reportsCount),
        volunteerHours: Number(stat.volunteerHours),
        economicValue: Number(stat.economicValue),
        volunteerOpportunities: Number(stat.volunteerOpportunities),
        activitiesCount: Number(stat.activitiesCount),
        volunteerCount: Number(stat.volunteerCount),
        skillsEconomicValue: Number(stat.skillsEconomicValue),
        skillsTrainedCount: Number(stat.skillsTrainedCount),
        studentsCount: Number(stat.studentsCount),
    }));
}

// UPDATED: EduAdmin breakdown with correct trainer definition
async function getEduAdminBreakdown(dbUrl?: string) {
    const db = initializeDatabase(dbUrl);

    const eduAdminStats = await db.$queryRaw`
        SELECT
            ea.id,
            ea.name,
            ea."regionId",
            COUNT(DISTINCT s.id)::BIGINT as "schoolsCount",
            COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::BIGINT as "trainersCount",
            COUNT(DISTINCT rep.id)::BIGINT as "reportsCount",
            COALESCE(SUM(rep."volunteerHours"), 0)::BIGINT as "volunteerHours",
            COALESCE(SUM(rep."economicValue"), 0)::BIGINT as "economicValue",
            COALESCE(SUM(rep."volunteerOpportunities"), 0)::BIGINT as "volunteerOpportunities",
            COALESCE(SUM(rep."activitiesCount"), 0)::BIGINT as "activitiesCount",
            COALESCE(SUM(rep."volunteerCount"), 0)::BIGINT as "volunteerCount",
            COALESCE(SUM(rep."skillsEconomicValue"), 0)::BIGINT as "skillsEconomicValue",
            COALESCE(SUM(rep."skillsTrainedCount"), 0)::BIGINT as "skillsTrainedCount"
        FROM "eduAdministration" ea
        LEFT JOIN "school" s ON s."eduAdminId" = ea.id
        LEFT JOIN public."user" u ON u."schoolId" = s.id
        LEFT JOIN "report" rep ON rep."userId" = u.id
        WHERE ea."regionId" IS NOT NULL
        GROUP BY ea.id, ea.name, ea."regionId"
        ORDER BY ea.name
    `;

    return (eduAdminStats as any[]).map((stat: any) => ({
        id: stat.id,
        name: stat.name,
        regionId: stat.regionId,
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

async function getUserStatisticsById(userId: string, dbUrl?: string): 
Promise<UserStatistics> {
    const db = initializeDatabase(dbUrl);

    const [userStatsResult] = await db.$queryRaw<Array<{
        reports_count: bigint;
        volunteer_hours: bigint;
        economic_value: bigint;
        volunteer_opportunities: bigint;
        activities_count: bigint;
        volunteer_count: bigint;
        skills_economic_value: bigint;
        skills_trained_count: bigint;
    }>>`
        SELECT 
            COUNT(id)::BIGINT AS reports_count,
            COALESCE(SUM("volunteerHours"), 0)::BIGINT AS volunteer_hours,
            COALESCE(SUM("economicValue"), 0)::BIGINT AS economic_value,
            COALESCE(SUM("volunteerOpportunities"), 0)::BIGINT AS volunteer_opportunities,
            COALESCE(SUM("activitiesCount"), 0)::BIGINT AS activities_count,
            COALESCE(SUM("volunteerCount"), 0)::BIGINT AS volunteer_count,
            COALESCE(SUM("skillsEconomicValue"), 0)::BIGINT AS skills_economic_value,
            COALESCE(SUM("skillsTrainedCount"), 0)::BIGINT AS skills_trained_count
        FROM "report"
        WHERE "userId" = ${userId}
    `;

    // If the user has no reports, return a zeroed object
    if (!userStatsResult) {
        return {
            reportsCount: 0,
            volunteerHours: 0,
            economicValue: 0,
            volunteerOpportunities: 0,
            activitiesCount: 0,
            volunteerCount: 0,
            skillsEconomicValue: 0,
            skillsTrainedCount: 0,
        };
    }

    // Convert BigInt results to Number before returning
    return {
        reportsCount: Number(userStatsResult.reports_count),
        volunteerHours: Number(userStatsResult.volunteer_hours),
        economicValue: Number(userStatsResult.economic_value),
        volunteerOpportunities: Number(userStatsResult.volunteer_opportunities),
        activitiesCount: Number(userStatsResult.activities_count),
        volunteerCount: Number(userStatsResult.volunteer_count),
        skillsEconomicValue: Number(userStatsResult.skills_economic_value),
        skillsTrainedCount: Number(userStatsResult.skills_trained_count),
    };
}

/**
 * Get region rankings with optional date range filter.
 * Returns regions sorted by the specified metric.
 */
async function getRegionRankings(dbUrl?: string, options?: {
    startDate?: string;
    endDate?: string;
    sortBy?: 'volunteerHours' | 'trainersCount' | 'volunteerOpportunities';
    limit?: number;
}) {
    const db = initializeDatabase(dbUrl);
    const sortBy = options?.sortBy || 'volunteerHours';
    const limit = options?.limit || 20;

    let dateFilter = '';
    const params: any[] = [];
    if (options?.startDate && options?.endDate) {
        dateFilter = `AND rep."createdAt" >= $1 AND rep."createdAt" <= $2`;
        params.push(new Date(options.startDate), new Date(options.endDate));
    }

    // Use parameterized query with date filter
    const results = options?.startDate && options?.endDate
        ? await db.$queryRaw`
            SELECT
                r.id,
                r.name,
                COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::INTEGER as "trainersCount",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COALESCE(SUM(rep."economicValue"), 0)::INTEGER as "economicValue",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as "activitiesCount",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount"
            FROM "region" r
            LEFT JOIN public."user" u ON u."regionId" = r.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
                AND rep."createdAt" >= ${new Date(options.startDate)}
                AND rep."createdAt" <= ${new Date(options.endDate)}
            GROUP BY r.id, r.name
            ORDER BY
                CASE WHEN ${sortBy} = 'volunteerHours' THEN COALESCE(SUM(rep."volunteerHours"), 0) END DESC,
                CASE WHEN ${sortBy} = 'trainersCount' THEN COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END) END DESC,
                CASE WHEN ${sortBy} = 'volunteerOpportunities' THEN COALESCE(SUM(rep."volunteerOpportunities"), 0) END DESC
            LIMIT ${limit}
        `
        : await db.$queryRaw`
            SELECT
                r.id,
                r.name,
                COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END)::INTEGER as "trainersCount",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COALESCE(SUM(rep."economicValue"), 0)::INTEGER as "economicValue",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as "activitiesCount",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount"
            FROM "region" r
            LEFT JOIN public."user" u ON u."regionId" = r.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
            GROUP BY r.id, r.name
            ORDER BY COALESCE(SUM(rep."volunteerHours"), 0) DESC
            LIMIT ${limit}
        `;

    // Sort in JS since dynamic ORDER BY with CASE doesn't work well with Prisma tagged templates
    const mapped = (results as any[]).map((stat: any, index: number) => ({
        rank: index + 1,
        id: stat.id,
        name: stat.name,
        trainersCount: Number(stat.trainersCount),
        reportsCount: Number(stat.reportsCount),
        volunteerHours: Number(stat.volunteerHours),
        economicValue: Number(stat.economicValue),
        volunteerOpportunities: Number(stat.volunteerOpportunities),
        activitiesCount: Number(stat.activitiesCount),
        volunteerCount: Number(stat.volunteerCount),
    }));

    // Sort in JS for reliability
    mapped.sort((a: any, b: any) => {
        if (sortBy === 'trainersCount') return b.trainersCount - a.trainersCount;
        if (sortBy === 'volunteerOpportunities') return b.volunteerOpportunities - a.volunteerOpportunities;
        return b.volunteerHours - a.volunteerHours;
    });

    // Re-assign rank after sort
    return mapped.map((item: any, index: number) => ({ ...item, rank: index + 1 }));
}

/**
 * Get teacher rankings with optional region and date range filters.
 */
async function getTeacherRankings(dbUrl?: string, options?: {
    regionId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'volunteerHours' | 'volunteerOpportunities' | 'reportsCount';
    limit?: number;
}) {
    const db = initializeDatabase(dbUrl);
    const limit = options?.limit || 20;
    const sortBy = options?.sortBy || 'volunteerHours';

    const hasDateFilter = options?.startDate && options?.endDate;
    const hasRegionFilter = !!options?.regionId;

    let results: any[];

    if (hasDateFilter && hasRegionFilter) {
        results = await db.$queryRaw`
            SELECT
                u.id,
                u.name,
                r.name as "regionName",
                s.name as "schoolName",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as "activitiesCount",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount"
            FROM public."user" u
            LEFT JOIN "region" r ON u."regionId" = r.id
            LEFT JOIN "school" s ON u."schoolId" = s.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
                AND rep."createdAt" >= ${new Date(options.startDate!)}
                AND rep."createdAt" <= ${new Date(options.endDate!)}
            WHERE u.role = 'user' AND u."regionId" = ${options.regionId}
            GROUP BY u.id, u.name, r.name, s.name
            HAVING COUNT(rep.id) > 0
            ORDER BY COALESCE(SUM(rep."volunteerHours"), 0) DESC
            LIMIT ${limit}
        `;
    } else if (hasDateFilter) {
        results = await db.$queryRaw`
            SELECT
                u.id,
                u.name,
                r.name as "regionName",
                s.name as "schoolName",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as "activitiesCount",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount"
            FROM public."user" u
            LEFT JOIN "region" r ON u."regionId" = r.id
            LEFT JOIN "school" s ON u."schoolId" = s.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
                AND rep."createdAt" >= ${new Date(options.startDate!)}
                AND rep."createdAt" <= ${new Date(options.endDate!)}
            WHERE u.role = 'user'
            GROUP BY u.id, u.name, r.name, s.name
            HAVING COUNT(rep.id) > 0
            ORDER BY COALESCE(SUM(rep."volunteerHours"), 0) DESC
            LIMIT ${limit}
        `;
    } else if (hasRegionFilter) {
        results = await db.$queryRaw`
            SELECT
                u.id,
                u.name,
                r.name as "regionName",
                s.name as "schoolName",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as "activitiesCount",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount"
            FROM public."user" u
            LEFT JOIN "region" r ON u."regionId" = r.id
            LEFT JOIN "school" s ON u."schoolId" = s.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
            WHERE u.role = 'user' AND u."regionId" = ${options.regionId}
            GROUP BY u.id, u.name, r.name, s.name
            HAVING COUNT(rep.id) > 0
            ORDER BY COALESCE(SUM(rep."volunteerHours"), 0) DESC
            LIMIT ${limit}
        `;
    } else {
        results = await db.$queryRaw`
            SELECT
                u.id,
                u.name,
                r.name as "regionName",
                s.name as "schoolName",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."activitiesCount"), 0)::INTEGER as "activitiesCount",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount"
            FROM public."user" u
            LEFT JOIN "region" r ON u."regionId" = r.id
            LEFT JOIN "school" s ON u."schoolId" = s.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
            WHERE u.role = 'user'
            GROUP BY u.id, u.name, r.name, s.name
            HAVING COUNT(rep.id) > 0
            ORDER BY COALESCE(SUM(rep."volunteerHours"), 0) DESC
            LIMIT ${limit}
        `;
    }

    const mapped = (results as any[]).map((stat: any) => ({
        id: stat.id,
        name: stat.name,
        regionName: stat.regionName || 'غير محددة',
        schoolName: stat.schoolName || 'غير محددة',
        reportsCount: Number(stat.reportsCount),
        volunteerHours: Number(stat.volunteerHours),
        volunteerOpportunities: Number(stat.volunteerOpportunities),
        activitiesCount: Number(stat.activitiesCount),
        volunteerCount: Number(stat.volunteerCount),
    }));

    // Sort in JS for reliability
    mapped.sort((a: any, b: any) => {
        if (sortBy === 'reportsCount') return b.reportsCount - a.reportsCount;
        if (sortBy === 'volunteerOpportunities') return b.volunteerOpportunities - a.volunteerOpportunities;
        return b.volunteerHours - a.volunteerHours;
    });

    return mapped.map((item: any, index: number) => ({ ...item, rank: index + 1 }));
}

/**
 * Get leaderboard data with points-based scoring.
 * Points formula: (4 × volunteerCount) + (2 × volunteerOpportunities) + (1 × volunteerHours)
 */
async function getLeaderboardData(dbUrl?: string, options?: {
    regionId?: string;
    startDate?: string;
    endDate?: string;
}) {
    const db = initializeDatabase(dbUrl);

    const hasDateFilter = options?.startDate && options?.endDate;
    const hasRegionFilter = !!options?.regionId;

    let results: any[];

    if (hasDateFilter && hasRegionFilter) {
        results = await db.$queryRaw`
            SELECT
                u.id, u.name,
                r.name as "regionName", r.id as "regionId",
                s.name as "schoolName", s.id as "schoolId",
                ea.name as "eduAdminName", ea.id as "eduAdminId",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount"
            FROM public."user" u
            LEFT JOIN "region" r ON u."regionId" = r.id
            LEFT JOIN "school" s ON u."schoolId" = s.id
            LEFT JOIN "eduAdministration" ea ON u."eduAdminId" = ea.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
                AND rep."createdAt" >= ${new Date(options.startDate!)}
                AND rep."createdAt" <= ${new Date(options.endDate!)}
            WHERE u.role = 'user' AND u."regionId" = ${options.regionId}
            GROUP BY u.id, u.name, r.name, r.id, s.name, s.id, ea.name, ea.id
            HAVING COUNT(rep.id) > 0
        `;
    } else if (hasDateFilter) {
        results = await db.$queryRaw`
            SELECT
                u.id, u.name,
                r.name as "regionName", r.id as "regionId",
                s.name as "schoolName", s.id as "schoolId",
                ea.name as "eduAdminName", ea.id as "eduAdminId",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount"
            FROM public."user" u
            LEFT JOIN "region" r ON u."regionId" = r.id
            LEFT JOIN "school" s ON u."schoolId" = s.id
            LEFT JOIN "eduAdministration" ea ON u."eduAdminId" = ea.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
                AND rep."createdAt" >= ${new Date(options.startDate!)}
                AND rep."createdAt" <= ${new Date(options.endDate!)}
            WHERE u.role = 'user'
            GROUP BY u.id, u.name, r.name, r.id, s.name, s.id, ea.name, ea.id
            HAVING COUNT(rep.id) > 0
        `;
    } else if (hasRegionFilter) {
        results = await db.$queryRaw`
            SELECT
                u.id, u.name,
                r.name as "regionName", r.id as "regionId",
                s.name as "schoolName", s.id as "schoolId",
                ea.name as "eduAdminName", ea.id as "eduAdminId",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount"
            FROM public."user" u
            LEFT JOIN "region" r ON u."regionId" = r.id
            LEFT JOIN "school" s ON u."schoolId" = s.id
            LEFT JOIN "eduAdministration" ea ON u."eduAdminId" = ea.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
            WHERE u.role = 'user' AND u."regionId" = ${options.regionId}
            GROUP BY u.id, u.name, r.name, r.id, s.name, s.id, ea.name, ea.id
            HAVING COUNT(rep.id) > 0
        `;
    } else {
        results = await db.$queryRaw`
            SELECT
                u.id, u.name,
                r.name as "regionName", r.id as "regionId",
                s.name as "schoolName", s.id as "schoolId",
                ea.name as "eduAdminName", ea.id as "eduAdminId",
                COALESCE(SUM(rep."volunteerCount"), 0)::INTEGER as "volunteerCount",
                COALESCE(SUM(rep."volunteerOpportunities"), 0)::INTEGER as "volunteerOpportunities",
                COALESCE(SUM(rep."volunteerHours"), 0)::INTEGER as "volunteerHours",
                COUNT(DISTINCT rep.id)::INTEGER as "reportsCount"
            FROM public."user" u
            LEFT JOIN "region" r ON u."regionId" = r.id
            LEFT JOIN "school" s ON u."schoolId" = s.id
            LEFT JOIN "eduAdministration" ea ON u."eduAdminId" = ea.id
            LEFT JOIN "report" rep ON rep."userId" = u.id
            WHERE u.role = 'user'
            GROUP BY u.id, u.name, r.name, r.id, s.name, s.id, ea.name, ea.id
            HAVING COUNT(rep.id) > 0
        `;
    }

    // Calculate points for each teacher
    const teachers = (results as any[]).map((t: any) => {
        const vc = Number(t.volunteerCount);
        const vo = Number(t.volunteerOpportunities);
        const vh = Number(t.volunteerHours);
        return {
            id: t.id,
            name: t.name,
            regionName: t.regionName || 'غير محددة',
            regionId: t.regionId,
            schoolName: t.schoolName || 'غير محددة',
            schoolId: t.schoolId,
            eduAdminName: t.eduAdminName || 'غير محددة',
            eduAdminId: t.eduAdminId,
            volunteerCount: vc,
            volunteerOpportunities: vo,
            volunteerHours: vh,
            reportsCount: Number(t.reportsCount),
            points: (4 * vc) + (2 * vo) + (1 * vh),
        };
    }).sort((a: any, b: any) => b.points - a.points)
      .map((item: any, index: number) => ({ ...item, rank: index + 1 }));

    // Aggregate school rankings
    const schoolMap = new Map<string, { id: string; name: string; regionName: string; eduAdminName: string; teacherCount: number; totalPoints: number }>();
    for (const t of teachers) {
        if (!t.schoolId) continue;
        const existing = schoolMap.get(t.schoolId);
        if (existing) {
            existing.teacherCount++;
            existing.totalPoints += t.points;
        } else {
            schoolMap.set(t.schoolId, {
                id: t.schoolId,
                name: t.schoolName,
                regionName: t.regionName,
                eduAdminName: t.eduAdminName,
                teacherCount: 1,
                totalPoints: t.points,
            });
        }
    }
    const schools = Array.from(schoolMap.values())
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((item, index) => ({ ...item, rank: index + 1 }));

    // Aggregate region rankings
    const regionMap = new Map<string, { id: string; name: string; schoolIds: Set<string>; teacherCount: number; totalPoints: number }>();
    for (const t of teachers) {
        if (!t.regionId) continue;
        const existing = regionMap.get(t.regionId);
        if (existing) {
            existing.teacherCount++;
            existing.totalPoints += t.points;
            if (t.schoolId) existing.schoolIds.add(t.schoolId);
        } else {
            const schoolIds = new Set<string>();
            if (t.schoolId) schoolIds.add(t.schoolId);
            regionMap.set(t.regionId, {
                id: t.regionId,
                name: t.regionName,
                schoolIds,
                teacherCount: 1,
                totalPoints: t.points,
            });
        }
    }
    const regions = Array.from(regionMap.values())
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((item, index) => ({
            rank: index + 1,
            id: item.id,
            name: item.name,
            schoolCount: item.schoolIds.size,
            teacherCount: item.teacherCount,
            totalPoints: item.totalPoints,
        }));

    return { teachers, schools, regions };
}

// Export the function
const statisticsService = {
    getAdminDashboardDataStatistics,
    getRegionalBreakdown,
    getEduAdminBreakdown,
    getUserStatisticsById,
    getRegionRankings,
    getTeacherRankings,
    getLeaderboardData
};

export default statisticsService;