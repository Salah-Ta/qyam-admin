import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import reportService from "~/db/report/report.server";
import statisticsService from "~/db/statistics/statistics.server";
import userService from "~/db/user/user.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import type { Report, CreateReportData, QUser } from "~/types/types";

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    // Get user from query parameter "userId" if present, otherwise use authenticated user
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("userId");
    let user: QUser | null = null;

    if (userIdParam) {
      // Fetch user by ID from DB (assuming you have a method for this)
      const dbUrl = (context as any).cloudflare.env.DATABASE_URL;
      if (!dbUrl) {
      return json({ status: "error", message: "Database URL is not configured" }, { status: 500 });
      }
      const userResponse = await userService.getUser(userIdParam, dbUrl);
      user = userResponse.status ? userResponse.data as QUser : null ;
    }

    if (!user) {
      return json({ status: "error", message: "Authentication required" }, { status: 401 });
    }
    
    const dbUrl = (context as any).cloudflare.env.DATABASE_URL;
    
    if (!dbUrl) {
      return json({ status: "error", message: "Database URL is not configured" }, { status: 500 });
    }
    
    // Fetch user's own reports only (trainer view)
    const reportsResponse = await reportService.getAllReports(dbUrl);
    const userReports = reportsResponse.success 
      ? { ...reportsResponse, data: reportsResponse.data?.filter((report: any) => report.userId === user.id) }
      : reportsResponse;
    
    // Get user's personal stats
    const userStatsResponse = await statisticsService.getUserStatisticsById(user.id!, dbUrl);
    
    // Fetch available skills
    const skillsResponse = await reportService.getAllSkills(dbUrl);
    
    return json({ 
      user: user as any, 
      reportsResponse: userReports, 
      userStatsResponse,
      skillsResponse 
    });
  } catch (error) {
    console.error("Error:", error);
    return json({ 
      user: null,
      reportsResponse: { status: "error", message: "Failed to fetch reports" },
      userStatsResponse: null,
      skillsResponse: { status: "error", message: "Failed to fetch skills" }
    }, { status: 500 });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const user = await getAuthenticated({ request, context });
    
    if (!user) {
      return json({ status: "error", message: "Authentication required" }, { status: 401 });
    }
    
    const dbUrl = (context as any).cloudflare.env.DATABASE_URL;
    if (!dbUrl) {
      return json({ status: "error", message: "Database URL is not configured" }, { status: 500 });
    }
    
    const formData = await request.formData();
    const action = formData.get("action") as string;
    
    if (action === "create_trainer_report") {
      // Get selected skills
      const selectedSkills = formData.getAll("skills") as string[];
      
      // Create trainer-level test report
      const reportData: CreateReportData = {
        userId: user.id!,
        volunteerHours: Number(formData.get("volunteerHours")) || 25,
        economicValue: Number(formData.get("economicValue")) || 12500,
        volunteerOpportunities: Number(formData.get("volunteerOpportunities")) || 5,
        activitiesCount: Number(formData.get("activitiesCount")) || 3,
        volunteerCount: Number(formData.get("volunteerCount")) || 20,
        skillsEconomicValue: Number(formData.get("skillsEconomicValue")) || 8000,
        skillsTrainedCount: Number(formData.get("skillsTrainedCount")) || 15,
        attachedFiles: [],
        skillIds: selectedSkills,
        testimonials: [
          {
            name: "أحمد محمد",
            comment: "تدريب ممتاز ومفيد جداً"
          }
        ]
      };
      
      const result = await reportService.createReport(reportData, dbUrl);
      return json({ status: "success", message: "Trainer report created successfully", result });
    }
    
    return json({ status: "error", message: "Invalid action" }, { status: 400 });
    
  } catch (error) {
    console.error("Error processing trainer report:", error);
    return json({ status: "error", message: "Failed to process trainer report action" }, { status: 500 });
  }
}

export default function TrainerReportTestPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const reportsResponse = (data as any)?.reportsResponse || { success: false, error: "No data available" };
  const userStatsResponse = (data as any)?.userStatsResponse;
  const skillsResponse = (data as any)?.skillsResponse || { success: false, error: "No skills data" };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎓 Trainer Report Testing Panel</h1>
      <p>Testing trainer-level report creation and personal tracking</p>
      
      <div style={{ padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>👤 Trainer Profile</h3>
        <p><strong>Name:</strong> {(data as any)?.user?.name || (data as any)?.user?.email || "Unknown"}</p>
        <p><strong>Role:</strong> {(data as any)?.user?.role || "trainer"}</p>
        <p><strong>School:</strong> {(data as any)?.user?.schoolName || "Not assigned"}</p>
        <p><strong>Status:</strong> {(data as any)?.user?.acceptenceState || "Unknown"}</p>
        <p><strong>Total Reports:</strong> {reportsResponse.success ? reportsResponse.data?.length || 0 : 0}</p>
      </div>

      {/* Personal Statistics Section */}
      {userStatsResponse && userStatsResponse.success && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>📊 My Personal Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
              <h4>My Reports</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                {userStatsResponse.data?.reportCount || 0}
              </p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
              <h4>Volunteer Hours</h4>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
                {userStatsResponse.data?.volunteerHours || 0}
              </p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '5px' }}>
              <h4>Economic Value</h4>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#f57c00' }}>
                {(userStatsResponse.data?.economicValue || 0).toLocaleString()} SAR
              </p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fce4ec', borderRadius: '5px' }}>
              <h4>People Trained</h4>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#c2185b' }}>
                {userStatsResponse.data?.skillsTrainedCount || 0}
              </p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '5px' }}>
              <h4>Activities</h4>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#7b1fa2' }}>
                {userStatsResponse.data?.activitiesCount || 0}
              </p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#e0f2f1', borderRadius: '5px' }}>
              <h4>Volunteers Managed</h4>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#00695c' }}>
                {userStatsResponse.data?.volunteerCount || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Trainer Report Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>📝 Create New Training Report</h2>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Report your training activities, volunteer coordination, and skills development work
        </p>
        
        <Form method="post" style={{ display: 'grid', gap: '15px', maxWidth: '500px' }}>
          <input type="hidden" name="action" value="create_trainer_report" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <label>
              Volunteer Hours: 
              <input type="number" name="volunteerHours" defaultValue="25" min="0" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
            
            <label>
              Economic Value (SAR): 
              <input type="number" name="economicValue" defaultValue="12500" min="0" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <label>
              Volunteer Opportunities: 
              <input type="number" name="volunteerOpportunities" defaultValue="5" min="0" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
            
            <label>
              Activities Count: 
              <input type="number" name="activitiesCount" defaultValue="3" min="0" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <label>
              Volunteer Count: 
              <input type="number" name="volunteerCount" defaultValue="20" min="0" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
            
            <label>
              Skills Economic Value: 
              <input type="number" name="skillsEconomicValue" defaultValue="8000" min="0" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
          </div>
          
          <label>
            People Trained in Skills: 
            <input type="number" name="skillsTrainedCount" defaultValue="15" min="0" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </label>
          
          {/* Skills Selection */}
          {skillsResponse.success && skillsResponse.data && skillsResponse.data.length > 0 && (
            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
                Skills Trained (Select relevant skills):
              </label>
              <div style={{ 
                maxHeight: '120px', 
                overflowY: 'auto', 
                border: '1px solid #ddd', 
                padding: '10px', 
                borderRadius: '5px',
                backgroundColor: '#f9f9f9'
              }}>
                {skillsResponse.data.map((skill: any) => (
                  <label key={skill.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    <input 
                      type="checkbox" 
                      name="skills" 
                      value={skill.id} 
                      style={{ marginRight: '8px' }} 
                    />
                    {skill.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <button type="submit" style={{ 
            padding: '12px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Submit Training Report
          </button>
        </Form>
        
        {actionData && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px',
            backgroundColor: actionData.status === 'success' ? '#d4edda' : '#f8d7da',
            borderRadius: '5px',
            border: `1px solid ${actionData.status === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <strong>{actionData.status.toUpperCase()}:</strong> {actionData.message}
          </div>
        )}
      </div>

      {/* My Reports Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>📋 My Training Reports ({reportsResponse.success ? reportsResponse.data?.length || 0 : 0})</h2>
        
        {reportsResponse.success ? (
          <div>
            {reportsResponse.data && reportsResponse.data.length > 0 ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {reportsResponse.data.map((report: any) => (
                  <div key={report.id} style={{ 
                    marginBottom: '15px', 
                    padding: '15px', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: '#333' }}>
                        Report from {new Date(report.createdAt).toLocaleDateString()}
                      </h4>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                      gap: '10px', 
                      marginBottom: '10px' 
                    }}>
                      <div style={{ fontSize: '14px' }}>
                        <strong>Hours:</strong> {report.volunteerHours}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <strong>Value:</strong> {report.economicValue?.toLocaleString()} SAR
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <strong>Opportunities:</strong> {report.volunteerOpportunities}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <strong>Activities:</strong> {report.activitiesCount}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <strong>Volunteers:</strong> {report.volunteerCount}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <strong>Trained:</strong> {report.skillsTrainedCount}
                      </div>
                    </div>
                    
                    {report.skills && report.skills.length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ fontSize: '14px' }}>Skills:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                          {report.skills.map((skillReport: any, index: number) => (
                            <span key={index} style={{ 
                              padding: '3px 8px', 
                              backgroundColor: '#007bff', 
                              color: 'white', 
                              borderRadius: '10px',
                              fontSize: '12px'
                            }}>
                              {skillReport.skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {report.testimonials && report.testimonials.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '14px' }}>Testimonials:</strong>
                        {report.testimonials.map((testimonialReport: any, index: number) => (
                          <div key={index} style={{ 
                            marginLeft: '15px', 
                            padding: '8px', 
                            backgroundColor: '#e9ecef', 
                            borderRadius: '5px',
                            marginTop: '5px',
                            fontSize: '13px'
                          }}>
                            <strong>{testimonialReport.testimonial.name}:</strong> {testimonialReport.testimonial.comment}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <h3>No reports yet</h3>
                <p>Create your first training report above to get started!</p>
              </div>
            )}
          </div>
        ) : (
          <p>Error loading your reports: {reportsResponse.error}</p>
        )}
      </div>

      {/* Tips Section */}
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <h3>💡 Tips for Trainers</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Report your training activities regularly to track your impact</li>
          <li>Include testimonials from participants to showcase effectiveness</li>
          <li>Select specific skills you've trained to help with categorization</li>
          <li>Track economic value to demonstrate the financial impact of your training</li>
          <li>Monitor volunteer hours to show time investment in community development</li>
        </ul>
      </div>
    </div>
  );
}
