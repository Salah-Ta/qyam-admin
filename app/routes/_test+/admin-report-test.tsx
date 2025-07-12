import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import reportService from "~/db/report/report.server";
import regionService from "~/db/region/region.server";
import eduAdminService from "~/db/eduAdmin/eduAdmin.server";
import schoolService from "~/db/school/school.server";
import userService from "~/db/user/user.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const user = await getAuthenticated({ request, context });

    if (!user) {
      return json({ status: "error", message: "Authentication required" }, { status: 401 });
    }

    if ((user as any).role !== "admin") {
      return json({ status: "error", message: "Admin access required" }, { status: 403 });
    }
    
    const dbUrl = (context as any).cloudflare.env.DATABASE_URL;
    
    if (!dbUrl) {
      return json({ status: "error", message: "Database URL is not configured" }, { status: 500 });
    }

    // Get URL parameters for filters
    const url = new URL(request.url);
    const regionId = url.searchParams.get("regionId");
    const eduAdminId = url.searchParams.get("eduAdminId");
    const schoolId = url.searchParams.get("schoolId");

    // Fetch all dropdown data
    const regionsResponse = await regionService.getAllRegions(dbUrl);
    const eduAdminsResponse = await eduAdminService.getAllEduAdmins(dbUrl);
    const schoolsResponse = await schoolService.getAllSchools(dbUrl);
    
    // Calculate TOTAL counts (never filtered)
    const totalSchoolsCount = schoolsResponse.status === "success" ? schoolsResponse.data.length : 0;
    const allReportsResponse = await reportService.getAllReports(dbUrl);
    const totalReportsCount = allReportsResponse.success ? allReportsResponse.data.length : 0;
    
    // Get global statistics for baseline comparison
    const globalStats = await reportService.calculateStatistics(dbUrl);
    const totalTrainersCount = globalStats.globalTotals.trainers;
    const totalVolunteersCount = globalStats.globalTotals.volunteerCount;
    
    let reportsResponse;
    let statistics;
    let filteredSchoolsCount = 0;
    let filteredReportsCount = 0;

    // Apply filtering based on selected filters - PRIORITIZE MOST SPECIFIC FILTER
    if (schoolId) {
      // SCHOOL is the most specific - show only reports from this school
      console.log("Filtering by schoolId:", schoolId);
      
      const schoolStatsResponse = await reportService.getSchoolTotalStats(schoolId, dbUrl);
      
      filteredSchoolsCount = 1; // Only one school selected

      // Filter reports by school
      reportsResponse = await reportService.getAllReports(dbUrl);
      if (reportsResponse.success) {
        reportsResponse.data = reportsResponse.data.filter((report: any) => 
          report.user?.schoolId === schoolId
        );
        filteredReportsCount = reportsResponse.data.length;
        console.log(`School filter: ${filteredReportsCount} reports for school ${schoolId}`);
      }

      // Count actual users (trainers) in this school
      const usersResponse = await userService.getAllUsers(dbUrl);
      let trainersCount = 0;
      if (usersResponse.status === "success") {
        trainersCount = usersResponse.data.filter((user: any) => user.schoolId === schoolId).length;
      }

      statistics = {
        trainers: trainersCount, // Count of actual users in this school
        volunteers: schoolStatsResponse.success ? schoolStatsResponse.data.volunteerCount : 0
      };
      
    } else if (eduAdminId) {
      // EDUADMIN is second most specific
      console.log("Filtering by eduAdminId:", eduAdminId);
      
      const eduAdminStatsResponse = await reportService.getEduAdminTotalStats(eduAdminId, dbUrl);
      
      // Filter schools by eduAdmin
      let schoolsInEduAdmin: any[] = [];
      if (schoolsResponse.status === "success") {
        schoolsInEduAdmin = schoolsResponse.data.filter((school: any) => 
          school.eduAdminId === eduAdminId
        );
      }
      filteredSchoolsCount = schoolsInEduAdmin.length;

      // Filter reports by eduAdmin
      reportsResponse = await reportService.getAllReports(dbUrl);
      if (reportsResponse.success) {
        reportsResponse.data = reportsResponse.data.filter((report: any) => 
          schoolsInEduAdmin.map(s => s.id).includes(report.user?.schoolId)
        );
        filteredReportsCount = reportsResponse.data.length;
        console.log(`EduAdmin filter: ${filteredReportsCount} reports for eduAdmin ${eduAdminId}`);
      }

      // Count actual users (trainers) in schools under this eduAdmin
      const usersResponse = await userService.getAllUsers(dbUrl);
      let trainersCount = 0;
      if (usersResponse.status === "success") {
        const schoolIds = schoolsInEduAdmin.map(s => s.id);
        trainersCount = usersResponse.data.filter((user: any) => schoolIds.includes(user.schoolId)).length;
      }

      statistics = {
        trainers: trainersCount, // Count of actual users in schools under this eduAdmin
        volunteers: eduAdminStatsResponse.success ? eduAdminStatsResponse.data.volunteerCount : 0
      };
      
    } else if (regionId) {
      // REGION is third most specific
      console.log("Filtering by regionId:", regionId);
      
      const regionStatsResponse = await reportService.getRegionTotalStats(regionId, dbUrl);
      
      // Filter schools by region
      let schoolsInRegion: any[] = [];
      if (schoolsResponse.status === "success") {
        const eduAdminsInRegion = eduAdminsResponse.status === "success" 
          ? eduAdminsResponse.data.filter((eduAdmin: any) => eduAdmin.regionId === regionId).map((ea: any) => ea.id)
          : [];
        
        schoolsInRegion = schoolsResponse.data.filter((school: any) => 
          eduAdminsInRegion.includes(school.eduAdminId)
        );
      }
      filteredSchoolsCount = schoolsInRegion.length;

      // Filter reports by region
      reportsResponse = await reportService.getAllReports(dbUrl);
      if (reportsResponse.success) {
        reportsResponse.data = reportsResponse.data.filter((report: any) => 
          schoolsInRegion.map(s => s.id).includes(report.user?.schoolId)
        );
        filteredReportsCount = reportsResponse.data.length;
        console.log(`Region filter: ${filteredReportsCount} reports for region ${regionId}`);
      }

      // Count actual users (trainers) in schools in this region
      const usersResponse = await userService.getAllUsers(dbUrl);
      let trainersCount = 0;
      if (usersResponse.status === "success") {
        const schoolIds = schoolsInRegion.map(s => s.id);
        trainersCount = usersResponse.data.filter((user: any) => schoolIds.includes(user.schoolId)).length;
      }

      statistics = {
        trainers: trainersCount, // Count of actual users in schools in this region
        volunteers: regionStatsResponse.success ? regionStatsResponse.data.volunteerCount : 0
      };
      
    } else {
      // No filters applied - use global statistics
      console.log("No filters applied - showing all data");
      filteredSchoolsCount = totalSchoolsCount;
      reportsResponse = allReportsResponse;
      filteredReportsCount = totalReportsCount;
      
      // Count all users as trainers
      const usersResponse = await userService.getAllUsers(dbUrl);
      let totalTrainersFromUsers = 0;
      if (usersResponse.status === "success") {
        totalTrainersFromUsers = usersResponse.data.length;
      }
      
      statistics = {
        trainers: totalTrainersFromUsers, // Count of all users in the system
        volunteers: globalStats.globalTotals.volunteerCount
      };
    }

    // Calculate percentages
    const schoolsPercentage = totalSchoolsCount > 0 ? ((filteredSchoolsCount / totalSchoolsCount) * 100).toFixed(1) : "0";
    const reportsPercentage = totalReportsCount > 0 ? ((filteredReportsCount / totalReportsCount) * 100).toFixed(1) : "0";
    const trainersPercentage = totalTrainersCount > 0 ? ((statistics.trainers / totalTrainersCount) * 100).toFixed(1) : "0";
    const volunteersPercentage = totalVolunteersCount > 0 ? ((statistics.volunteers / totalVolunteersCount) * 100).toFixed(1) : "0";
    
    return json({ 
      user,
      regionsResponse,
      eduAdminsResponse,
      schoolsResponse,
      reportsResponse,
      counts: {
        trainers: statistics.trainers,
        volunteers: statistics.volunteers,
        totalSchools: totalSchoolsCount,
        filteredSchools: filteredSchoolsCount,
        schoolsPercentage: schoolsPercentage,
        totalReports: totalReportsCount,
        filteredReports: filteredReportsCount,
        reportsPercentage: reportsPercentage,
        totalTrainers: totalTrainersCount,        // Add total trainers
        trainersPercentage: trainersPercentage,   // Add trainers percentage
        totalVolunteers: totalVolunteersCount,    // Add total volunteers
        volunteersPercentage: volunteersPercentage // Add volunteers percentage
      },
      filters: {
        regionId,
        eduAdminId,
        schoolId
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return json({ 
      user: null,
      regionsResponse: { status: "error", message: "Failed to fetch regions" },
      eduAdminsResponse: { status: "error", message: "Failed to fetch eduAdmins" },
      schoolsResponse: { status: "error", message: "Failed to fetch schools" },
      reportsResponse: { status: "error", message: "Failed to fetch reports" },
      counts: { 
        trainers: 0, 
        volunteers: 0, 
        totalSchools: 0, 
        filteredSchools: 0, 
        schoolsPercentage: "0",
        totalReports: 0,
        filteredReports: 0,
        reportsPercentage: "0",
        totalTrainers: 0,           // Add
        trainersPercentage: "0",    // Add
        totalVolunteers: 0,         // Add
        volunteersPercentage: "0"   // Add
      },
      filters: { regionId: null, eduAdminId: null, schoolId: null }
    }, { status: 500 });
  }
}

export default function AdminReportTestPage() {
  const data = useLoaderData<typeof loader>();
  const regionsResponse = (data as any)?.regionsResponse || { status: "error", message: "No regions data" };
  const eduAdminsResponse = (data as any)?.eduAdminsResponse || { status: "error", message: "No eduAdmins data" };
  const schoolsResponse = (data as any)?.schoolsResponse || { status: "error", message: "No schools data" };
  const reportsResponse = (data as any)?.reportsResponse || { status: "error", message: "No reports data" };
  const counts = (data as any)?.counts || { 
    trainers: 0, 
    volunteers: 0, 
    totalSchools: 0, 
    filteredSchools: 0, 
    schoolsPercentage: "0",
    totalReports: 0,
    filteredReports: 0,
    reportsPercentage: "0"
  };
  const filters = (data as any)?.filters || { regionId: null, eduAdminId: null, schoolId: null };

  // Filter eduAdmins based on selected region
  const filteredEduAdmins = filters.regionId 
    ? (eduAdminsResponse.status === "success" ? eduAdminsResponse.data?.filter((eduAdmin: any) => eduAdmin.regionId === filters.regionId) : [])
    : (eduAdminsResponse.status === "success" ? eduAdminsResponse.data : []);

  // Filter schools based on selected eduAdmin or region
  const filteredSchools = filters.eduAdminId 
    ? (schoolsResponse.status === "success" ? schoolsResponse.data?.filter((school: any) => school.eduAdminId === filters.eduAdminId) : [])
    : filters.regionId 
      ? (schoolsResponse.status === "success" ? schoolsResponse.data?.filter((school: any) => school.eduAdmin?.regionId === filters.regionId) : [])
      : (schoolsResponse.status === "success" ? schoolsResponse.data : []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Report Testing Panel</h1>
      <p>Admin view for report management with filtering and statistics</p>
      
      {(data as any)?.user?.role !== "admin" && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '20px' }}>
          Access Denied: Admin role required
        </div>
      )}

      {/* System Statistics Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>System Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          
          {/* Total Schools with Percentage */}
          <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
            <h4>Total Schools</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32', margin: '5px 0' }}>
              {counts.totalSchools}
            </p>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Filtered: {counts.filteredSchools} ({counts.schoolsPercentage}%)
            </div>
          </div>

          {/* Total Trainers with Percentage */}
          <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
            <h4>Total Trainers</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2', margin: '5px 0' }}>
              {counts.totalTrainers}
            </p>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Filtered: {counts.trainers} ({counts.trainersPercentage}%)
            </div>
          </div>

          {/* Total Volunteers with Percentage */}
          <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '5px' }}>
            <h4>Total Volunteers</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00', margin: '5px 0' }}>
              {counts.totalVolunteers}
            </p>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Filtered: {counts.volunteers} ({counts.volunteersPercentage}%)
            </div>
          </div>

          {/* Total Reports with Percentage */}
          <div style={{ padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '5px' }}>
            <h4>Total Reports</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2', margin: '5px 0' }}>
              {counts.totalReports}
            </p>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Filtered: {counts.filteredReports} ({counts.reportsPercentage}%)
            </div>
          </div>

        </div>
      </div>

      {/* Filters Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Filters</h2>
        <Form method="get" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
          
          {/* Region Dropdown */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Region</label>
            <select 
              name="regionId" 
              defaultValue={filters.regionId || ""} 
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
              onChange={(e) => {
                const form = e.target.closest('form') as HTMLFormElement;
                if (form) {
                  const eduAdminSelect = form.querySelector('select[name="eduAdminId"]') as HTMLSelectElement;
                  const schoolSelect = form.querySelector('select[name="schoolId"]') as HTMLSelectElement;
                  if (eduAdminSelect) eduAdminSelect.value = "";
                  if (schoolSelect) schoolSelect.value = "";
                }
              }}
            >
              <option value="">All Regions</option>
              {regionsResponse.status === "success" && regionsResponse.data?.map((region: any) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>

          {/* EduAdmin Dropdown */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Educational Administration</label>
            <select 
              name="eduAdminId" 
              defaultValue={filters.eduAdminId || ""} 
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
              onChange={(e) => {
                const form = e.target.closest('form') as HTMLFormElement;
                if (form) {
                  const schoolSelect = form.querySelector('select[name="schoolId"]') as HTMLSelectElement;
                  if (schoolSelect) schoolSelect.value = "";
                }
              }}
            >
              <option value="">All Educational Administrations</option>
              {filteredEduAdmins?.map((eduAdmin: any) => (
                <option key={eduAdmin.id} value={eduAdmin.id}>{eduAdmin.name}</option>
              ))}
            </select>
          </div>

          {/* School Dropdown */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>School</label>
            <select 
              name="schoolId" 
              defaultValue={filters.schoolId || ""} 
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            >
              <option value="">All Schools</option>
              {filteredSchools?.map((school: any) => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Button */}
          <div>
            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: '8px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Apply Filters
            </button>
          </div>
        </Form>
      </div>

      {/* Reports Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Reports ({counts.filteredReports} of {counts.totalReports})</h2>
        
        {reportsResponse.success ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {reportsResponse.data && reportsResponse.data.length > 0 ? (
              reportsResponse.data.map((report: any) => (
                <div key={report.id} style={{ 
                  marginBottom: '15px', 
                  padding: '15px', 
                  border: '1px solid #eee', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <h4>Report by: {report.user?.name || report.user?.email || "Unknown"}</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                    <div><strong>Hours:</strong> {report.volunteerHours}</div>
                    <div><strong>Economic Value:</strong> {report.economicValue?.toLocaleString()} SAR</div>
                    <div><strong>Opportunities:</strong> {report.volunteerOpportunities}</div>
                    <div><strong>Activities:</strong> {report.activitiesCount}</div>
                    <div><strong>Volunteers:</strong> {report.volunteerCount}</div>
                    <div><strong>Skills Value:</strong> {report.skillsEconomicValue?.toLocaleString()} SAR</div>
                  </div>
                  
                  {report.testimonials && report.testimonials.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>Testimonials:</strong>
                      {report.testimonials.map((testimonialReport: any, index: number) => (
                        <div key={index} style={{ 
                          marginLeft: '15px', 
                          padding: '8px', 
                          backgroundColor: '#e9ecef', 
                          borderRadius: '5px',
                          marginTop: '5px'
                        }}>
                          <strong>{testimonialReport.testimonial.name}:</strong> {testimonialReport.testimonial.comment}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Created: {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p>No reports found matching the selected filters.</p>
            )}
          </div>
        ) : (
          <p>Error loading reports: {reportsResponse.error}</p>
        )}
      </div>
    </div>
  );
}
