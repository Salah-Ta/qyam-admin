import { User } from "better-auth";

export type Material = {
  id?: string;
  storageKey: string;
  title: string;
  categoryId?: string;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Category = {
  id?: string;
  title: string;
  icon: string;
  //Material: Material[];
};

export type Program = {
  id?: string;
  link: string;
  title: string;
  description: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export type Statistics = {
  registeredUsers: number;
  curriculums: number;
  trainingHours: number;
};

export type Article = {
  id?: string;
  image: string | null;
  content: string;
  title: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export type AcceptenceState = "accepted" | "denied" | "pending" | "idle";
export type UserRole = "ADMIN" | "SUPERVISOR" | "USER";

export type QUser = {
  acceptenceState: string;
  id?: string;
  email: string;
  name: string;
  password?: string;
  role: string;
  phone?: string;
  regionId?: string;
  region?: string; // Match the field name from Prisma schema
  // userRegion?: Region; // Match the field name from Prisma schema
  //userRegion?: Region; // Match the field name from Prisma schema
  eduAdminId?: string;
  //userEduAdmin?: EduAdmin; // Match the field name from Prisma schema
  schoolId?: string;
  //userSchool?: School; // Match the field name from Prisma schema
  reports?: Report[];
  createdAt?: Date;
  updatedAt?: Date;
  sentMessages?: Message[];
  receivedMessages?: Message[];
  noStudents?: number; // Indicates if the user has no students
  isChecked?: boolean; // Indicates if the user has been checked
  
};

export type StatusResponse<T> = {
  status: "success" | "error" | "warning";
  message?: string;
  data?: T | T[];
};

type UserCertificate = {
  userId: string;
  certificateKey: string;
  size: number;
  contentType: string;
  name: DialogTitleProps;
  id?: string;
};

export type Region = {
  id?: string;
  name: string;
  //users?: QUser[]; // Add users relation
  createdAt?: Date;
  updatedAt?: Date;
};

export type EduAdmin = {
  id?: string;
  name: string;
  regionId?: string;
  region?: Region;
  users?: QUser[]; // Add users relation
  schools?: School[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type School = {
  id?: string;
  name: string;
  address: string;
  eduAdminId?: string;
  eduAdmin?: EduAdmin;
  users?: QUser[]; // Add users relation
  createdAt?: Date;
  updatedAt?: Date;
};

export type Report = {
  id?: string;
  userId: string;
  user?: QUser;
  volunteerHours: number;
  economicValue: number;
  volunteerOpportunities: number;
  activitiesCount: number;
  volunteerCount: number;
  skillsEconomicValue: number;
  skillsTrainedCount: number;
  attachedFiles: string[];
  createdAt?: Date;
  updatedAt?: Date;
  testimonials?: TestimonialReport[];
};

export type SkillReport = {
  skillId: string;
  reportId: string;
  skill?: Skill;
  report?: Report;
  createdAt?: Date;
};

export type Skill = {
  id: string;
  name: string;
  //description?: string; // Optional if not needed
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateReportData = {
  userId: string;
  volunteerHours: number;
  economicValue: number;
  volunteerOpportunities: number;
  activitiesCount: number;
  volunteerCount: number;
  skillsEconomicValue: number;
  skillsTrainedCount: number;
  attachedFiles: string[];

  // Just the skill IDs to connect to the report
  skillIds: string[];
  testimonials?: CreateTestimonialData[];
};

// Type for Testimonial
export type Testimonial = {
  id?: string;
  name: string;
  comment: string;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
  reports?: TestimonialReport[];
};

// Type for TestimonialReport junction
export type TestimonialReport = {
  testimonialId: string;
  reportId: string;
  testimonial?: Testimonial;
  report?: Report;
  createdAt?: Date;
};

// Type for creating a testimonial when creating a report
export type CreateTestimonialData = {
  name: string;
  comment: string;
  //rating: number; // Optional if you want to set a default rating in the backend
};

// Report statistics types
export type RegionStat = {
  regionId: string;
  regionName: string;
  volunteerHoursPercentage: number;
  economicValuePercentage: number;
  volunteerOpportunitiesPercentage: number;
  activitiesCountPercentage: number;
  volunteerCountPercentage: number;
};

export type EduAdminStat = {
  eduAdminId: string;
  eduAdminName: string;
  regionName: string; // Include region name for context
  volunteerHoursPercentage: number;
  economicValuePercentage: number;
  volunteerOpportunitiesPercentage: number;
  activitiesCountPercentage: number;
  volunteerCountPercentage: number;
};

export type SchoolStat = {
  schoolId: string;
  schoolName: string;
  eduAdminName: string; // Include eduAdmin name for context
  regionName: string; // Include region name for context
  volunteerHoursPercentage: number;
  economicValuePercentage: number;
  volunteerOpportunitiesPercentage: number;
  activitiesCountPercentage: number;
  volunteerCountPercentage: number;
};

export type GlobalTotals = {
  volunteerHours: number;
  economicValue: number;
  volunteerOpportunities: number;
  activitiesCount: number;
  volunteerCount: number;
  skillsEconomicValue: number;
  skillsTrainedCount: number;
  schoolsCount: number;
  trainers: number; // Users who have schools
  reportCount: number; // Add this
};

export type RegionTotals = {
  volunteerHours: number;
  economicValue: number;
  volunteerOpportunities: number;
  activitiesCount: number;
  volunteerCount: number;
  skillsEconomicValue: number;
  skillsTrainedCount: number;
  schoolsCount: number;     // Schools in this region
  eduAdminsCount: number;   // EduAdmins in this region
  trainers: number;         // Users in schools in this region
  reportCount: number;      // Reports from this region
};

export type EduAdminTotals = {
  volunteerHours: number;
  economicValue: number;
  volunteerOpportunities: number;
  activitiesCount: number;
  volunteerCount: number;
  skillsEconomicValue: number;
  skillsTrainedCount: number;
  schoolsCount: number;     // Schools under this eduAdmin
  trainers: number;         // Users in schools under this eduAdmin
  reportCount: number;      // Reports from this eduAdmin
};

export type SchoolTotals = {
  volunteerHours: number;
  economicValue: number;
  volunteerOpportunities: number;
  activitiesCount: number;
  volunteerCount: number;
  skillsEconomicValue: number;
  skillsTrainedCount: number;
  schoolsCount: number;     // Always 1 for single school
  trainers: number;         // Users in this school
  reportCount: number;      // Reports from this school
};

export type ReportStatistics = {
  globalTotals: GlobalTotals;
  regionStats: RegionStat[];
  eduAdminStats: EduAdminStat[];
  schoolStats: SchoolStat[];
};

export type DashStatistics = {
  regionsTotal: number = 0;
  regionsFiltered: number = 0;
  eduAdminsTotal: number = 0;
  eduAdminsFiltered: number = 0;
  schoolsTotal: number = 0;
  schoolsFiltered: number = 0;
  reportsTotal: number = 0;
  reportsFiltered: number = 0;
  trainersTotal: number = 0; // Users who have schools
  trainersFiltered: number = 0; // Users who have schools in the filtered region
  volunteerHoursTotal: number = 0;
  volunteerHoursFiltered: number = 0;
  economicValueTotal: number = 0;
  economicValueFiltered: number = 0;
  volunteerOpportunitiesTotal: number = 0;
  volunteerOpportunitiesFiltered: number = 0;
  activitiesCountTotal: number = 0;
  activitiesCountFiltered: number = 0;
  volunteerCountTotal: number = 0;
  volunteerCountFiltered: number = 0;
  skillsEconomicValueTotal: number = 0;
  skillsEconomicValueFiltered: number = 0;
  skillsTrainedCountTotal: number = 0;
  skillsTrainedCountFiltered: number = 0;
};

export type Message = {
  id?: string;
  content: string;
  sentAt?: Date;
  isRead: boolean;
  readAt?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  fromUserId: string;
  toUserId: string;
  fromUser?: QUser;
  toUser?: QUser;
};

// For creating a new message
export type CreateMessageData = {
  content: string;
  toUserId: string;
};

// Response type consistent with your other response types
export type MessageResponse = StatusResponse<Message>;
