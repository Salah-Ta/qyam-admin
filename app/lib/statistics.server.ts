import { client } from "~/db/db-client.server";

const statisticsDB = {
  async getStatistics(databaseUrl: string) {
    const prisma = client(databaseUrl)

    try {
      // Get or create the single statistics entry
      const stats = await prisma.statistics.upsert({
        where: {
          id: "stats",
        },
        update: {},
        create: {
          id: "stats",
          registeredUsers: 0,
          curriculums: 0,
          trainingHours: 0,
        },
      });

      return stats;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    } finally {
      // await prisma.$disconnect();
    }
  },

  async updateStatistics(
    data: {
      registeredUsers: number;
      curriculums: number;
      trainingHours: number;
    },
    databaseUrl: string
  ) {
    const prisma = client(databaseUrl)


    try {
      const stats = await prisma.statistics.upsert({
        where: {
          id: "stats",
        },
        update: {
          registeredUsers: data.registeredUsers,
          curriculums: data.curriculums,
          trainingHours: data.trainingHours,
        },
        create: {
          id: "stats",
          ...data,
        },
      });

      return stats;
    } catch (error) {
      console.error("Error updating statistics:", error);
      throw error;
    } finally {
      // await prisma.$disconnect();
    }
  },
};

export default statisticsDB;