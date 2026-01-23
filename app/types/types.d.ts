import { User } from "better-auth";

export type Material = {
  id?: string;
  storageKey: string;
  title: string;
  categoryId?: string | null;
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
  image?: string | null;
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
  id?: string;
  email: string;
  name: string;
  image?: string | null;
  password?: string;
  role: string | null;
  phone?: number | null;
  acceptenceState?: string | null;
  noStudents?: number;
  trainingHours?: number;
  cvKey?: string | null;
  level?: string;
  region?: string;
  regionId?: string | null;
  regionName?: string | null;
  eduAdminId?: string | null;
  eduAdminName?: string | null;
  schoolId?: string | null;
  schoolName?: string | null;
  reports?: Report[] | null;
  createdAt?: Date;
  updatedAt?: Date;
  sentMessages?: Message[];
  receivedMessages?: Message[];
  emailVerified?: boolean;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  isChecked?: boolean;
};

export type StatusResponse<T> = {
  status: "success" | "error" | "warning";
  message?: string;
  data?: T | T[];
};

export type UserCertificate = {
  userId: string;
  certificateKey: string;
  size: number;
  contentType: string;
  name: string;
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
  regionId?: string | null; // Nullable if not required
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
  eduAdminId?: string | null; // Nullable if not required
  eduAdmin?: EduAdmin | null; // Nullable if not required
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
  id?: string;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface SkillWithCount extends Skill {
  usageCount: number;
}

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
  rating?: number;
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
  rating?: number; // Optional if you want to set a default rating in the backend
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
  regionsTotal: number;
  regionsFiltered: number;
  eduAdminsTotal: number;
  eduAdminsFiltered: number;
  schoolsTotal: number;
  schoolsFiltered: number;
  reportsTotal: number;
  reportsFiltered: number;
  trainersTotal: number;
  trainersFiltered: number;
  volunteerHoursTotal: number;
  volunteerHoursFiltered: number;
  economicValueTotal: number;
  economicValueFiltered: number;
  volunteerOpportunitiesTotal: number;
  volunteerOpportunitiesFiltered: number;
  activitiesCountTotal: number;
  activitiesCountFiltered: number;
  volunteerCountTotal: number;
  volunteerCountFiltered: number;
  skillsEconomicValueTotal: number;
  skillsEconomicValueFiltered: number;
  skillsTrainedCountTotal: number;
  skillsTrainedCountFiltered: number;
};

export type Message = {
  id?: string;
  content: string;
  sentAt?: Date;
  isRead: boolean;
  readAt?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  fromUserId: string ;
  toUserId: string;
  fromUser?: QUser | null;
  toUser?: QUser | null;
};

// For creating a new message
export type CreateMessageData = {
  content: string;
  toUserId: string;
};

// Response type consistent with your other response types
export type MessageResponse = StatusResponse<Message>;

export type UserStatistics = {
  reportsCount: number;
  volunteerHours: number;
  economicValue: number;
  volunteerOpportunities: number;
  activitiesCount: number;
  volunteerCount: number;
  skillsEconomicValue: number;
  skillsTrainedCount: number;
};

// Module declaration for tailwind-clip-path
declare module 'tailwind-clip-path' {
  const clipPath: { handler: () => void };
  export default clipPath;
}
