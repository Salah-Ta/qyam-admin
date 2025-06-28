import { User } from "better-auth";

export type Material = {
  id?: string;
  storageKey: string;
  title: string;
  categoryId: string;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Category = {
  id?: string;
  title: string;
  icon: string;
  Material: Material[];
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
  id?: string;
  email: string;
  name: string;
  password?: string;
  role: string;
  phone?: string;
  regionId?: string;
  userRegion?: Region; // Match the field name from Prisma schema
  eduAdminId?: string;
  userEduAdmin?: EduAdmin; // Match the field name from Prisma schema
  schoolId?: string;
  userSchool?: School; // Match the field name from Prisma schema
  reports?: Report[];
  createdAt?: Date;
  updatedAt?: Date;
  sentMessages?: Message[];
  receivedMessages?: Message[];
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
  users?: QUser[]; // Add users relation
  //eduAdmins?: EduAdmin[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type EduAdmin = {
  id?: string;
  name: string;
  //regionId: string;
  //region?: Region;
  users?: QUser[]; // Add users relation
  //schools?: School[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type School = {
  id?: string;
  name: string;
  address: string;
  //eduAdminId: string;
  //eduAdmin?: EduAdmin;
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
};

export type ReportStatistics = {
  globalTotals: GlobalTotals;
  regionStats: RegionStat[];
  eduAdminStats: EduAdminStat[];
  schoolStats: SchoolStat[];
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
