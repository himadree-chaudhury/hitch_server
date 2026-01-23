import { ParticipantStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../../db/prisma";

const getMonthName = (date: Date) => {
  return date.toLocaleString("default", { month: "short" });
};

/**
 * ------------------------------------------------------------------
 * 1. USER STATISTICS (For the Participant Dashboard)
 * Focus: Personal engagement, spending habits, and upcoming schedule.
 * ------------------------------------------------------------------
 */
const userStatistics = async (userId: string) => {
  // 1. Headline Numbers
  const totalEventsJoined = await prisma.eventParticipant.count({
    where: { userId },
  });

  const totalReviewsGiven = await prisma.eventReview.count({
    where: { reviewerId: userId },
  });

  // Calculate Total Spent (Only successful payments)
  const spendingAggregate = await prisma.payment.aggregate({
    where: { userId, status: PaymentStatus.SUCCEEDED },
    _sum: { amount: true },
  });
  const totalSpent = spendingAggregate._sum.amount || 0;

  // 2. Interaction: "Spending Over Time" (Bar Chart)
  // Group payments by month to show spending trends
  const payments = await prisma.payment.findMany({
    where: { userId, status: PaymentStatus.SUCCEEDED },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const monthlySpendingMap = new Map<string, number>();
  payments.forEach((p) => {
    const month = getMonthName(p.createdAt);
    monthlySpendingMap.set(
      month,
      (monthlySpendingMap.get(month) || 0) + p.amount,
    );
  });

  const spendingChartData = Array.from(monthlySpendingMap, ([name, value]) => ({
    name,
    value,
  }));

  // 3. Interaction: "Favorite Categories" (Radar or Pie Chart)
  // Analyze which categories the user joins most often
  const joinedEvents = await prisma.eventParticipant.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          eventCategories: {
            include: { eventCategory: true },
          },
        },
      },
    },
  });

  const categoryCount: Record<string, number> = {};
  joinedEvents.forEach((p) => {
    p.event.eventCategories.forEach((ec) => {
      const catName = ec.eventCategory.name;
      categoryCount[catName] = (categoryCount[catName] || 0) + 1;
    });
  });

  const categoryChartData = Object.entries(categoryCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 categories

  // 4. Insight: "Upcoming Schedule" (Timeline/List)
  const upcomingEvents = await prisma.eventParticipant.findMany({
    where: {
      userId,
      event: { startTime: { gte: new Date() } }, // Future events
      status: ParticipantStatus.PAID,
    },
    take: 5,
    orderBy: { event: { startTime: "asc" } },
    select: {
      event: {
        select: {
          title: true,
          startTime: true,
          city: true,
          imageUrl: true,
        },
      },
    },
  });

  return {
    headlines: {
      totalSpent,
      totalEventsJoined,
      totalReviewsGiven,
    },
    charts: {
      spendingOverTime: spendingChartData,
      favoriteCategories: categoryChartData,
    },
    insights: {
      upcomingEvents,
    },
  };
};

/**
 * ------------------------------------------------------------------
 * 2. HOST STATISTICS (For the Organizer Dashboard)
 * Focus: Revenue, audience growth, event performance, and reputation.
 * ------------------------------------------------------------------
 */
const hostStatistics = async (hostId: string) => {
  // 1. Headline Numbers
  const totalEventsHosted = await prisma.event.count({
    where: { hostId },
  });

  // Total Revenue (Aggregated from payments directed to this host)
  const revenueAggregate = await prisma.payment.aggregate({
    where: { hostId, status: PaymentStatus.SUCCEEDED },
    _sum: { amount: true },
  });
  const totalRevenue = revenueAggregate._sum.amount || 0;

  // Total Unique Participants (Audience Size)
  const participants = await prisma.eventParticipant.findMany({
    where: { event: { hostId } },
    distinct: ["userId"],
  });
  const totalUniqueAudience = participants.length;

  // Average Rating
  const hostProfile = await prisma.hostProfile.findUnique({
    where: { userId: hostId },
    select: { rating: true, ratingCount: true },
  });

  // 2. Interaction: "Revenue Growth" (Line/Area Chart)
  const successfulPayments = await prisma.payment.findMany({
    where: { hostId, status: PaymentStatus.SUCCEEDED },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const revenueMap = new Map<string, number>();
  successfulPayments.forEach((p) => {
    const month = getMonthName(p.createdAt);
    revenueMap.set(month, (revenueMap.get(month) || 0) + p.amount);
  });

  const revenueChartData = Array.from(revenueMap, ([name, value]) => ({
    name,
    value,
  }));

  // 3. Interaction: "Event Status Breakdown" (Donut Chart)
  const eventsByStatus = await prisma.event.groupBy({
    by: ["status"],
    where: { hostId },
    _count: { id: true },
  });

  const eventStatusChartData = eventsByStatus.map((item) => ({
    name: item.status,
    value: item._count.id,
  }));

  // 4. Insight: "Top Performing Events" (Table/List)
  // Events with the highest participant count and revenue
  const topEvents = await prisma.event.findMany({
    where: { hostId },
    orderBy: { currentParticipants: "desc" },
    take: 5,
    select: {
      title: true,
      currentParticipants: true,
      maxParticipants: true,
      status: true,
      rating: true,
      // Calculate revenue roughly for this specific event view
      joiningFee: true,
    },
  });

  const topEventsWithRevenue = topEvents.map((event) => ({
    ...event,
    estimatedRevenue: event.currentParticipants * event.joiningFee,
  }));

  // 5. Interaction: "Recent Activity" (Feed)
  // Recent payments or signups
  const recentSignups = await prisma.eventParticipant.findMany({
    where: { event: { hostId } },
    take: 10,
    orderBy: { joinedAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, imageUrl: true } },
      event: { select: { title: true } },
    },
  });

  return {
    headlines: {
      totalRevenue,
      totalEventsHosted,
      totalUniqueAudience,
      averageRating: hostProfile?.rating || 0,
      totalReviews: hostProfile?.ratingCount || 0,
    },
    charts: {
      revenueGrowth: revenueChartData,
      eventStatusDistribution: eventStatusChartData,
    },
    insights: {
      topPerformingEvents: topEventsWithRevenue,
      recentSignups,
    },
  };
};

/**
 * ------------------------------------------------------------------
 * 3. ADMIN STATISTICS (For the Super Admin Dashboard)
 * Focus: Platform health, user acquisition, financial throughput, and verification.
 * ------------------------------------------------------------------
 */
const adminStatistics = async () => {
  // 1. Headline Numbers (Platform Health)
  const totalUsers = await prisma.user.count({ where: { role: "USER" } });
  const totalHosts = await prisma.user.count({ where: { role: "HOST" } });
  const totalEvents = await prisma.event.count();

  // Platform Total Volume (Total money processed)
  const volumeAggregate = await prisma.payment.aggregate({
    where: { status: PaymentStatus.SUCCEEDED },
    _sum: { amount: true },
  });
  const totalPlatformVolume = volumeAggregate._sum.amount || 0;

  // 2. Interaction: "User Acquisition Trend" (Double Line Chart: Users vs Hosts)
  // Fetch users created in the last 6-12 months
  const users = await prisma.user.findMany({
    select: { role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const acquisitionMap = new Map<string, { user: number; host: number }>();

  users.forEach((u) => {
    const month = getMonthName(u.createdAt);
    const current = acquisitionMap.get(month) || { user: 0, host: 0 };
    if (u.role === "HOST") current.host++;
    else if (u.role === "USER") current.user++;
    acquisitionMap.set(month, current);
  });

  const acquisitionChartData = Array.from(acquisitionMap, ([name, counts]) => ({
    name,
    Users: counts.user,
    Hosts: counts.host,
  }));

  // 3. Interaction: "Host Verification Funnel" (Bar Chart/Pie)
  // See bottlenecks in host approval
  const hostStatusCounts = await prisma.hostProfile.groupBy({
    by: ["hostStatus"],
    _count: { id: true },
  });

  const verificationChartData = hostStatusCounts.map((item) => ({
    name: item.hostStatus,
    value: item._count.id,
  }));

  // 4. Insight: "Pending Approvals" (Actionable List)
  const pendingHosts = await prisma.hostProfile.count({
    where: { hostStatus: "PENDING" },
  });

  // 5. Insight: "Payment Success Rate" (Progress Bar data)
  const paymentStats = await prisma.payment.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const totalTransactions = paymentStats.reduce(
    (acc, curr) => acc + curr._count.id,
    0,
  );
  const failedTransactions =
    paymentStats.find((p) => p.status === "FAILED")?._count.id || 0;
  const failureRate =
    totalTransactions > 0 ? (failedTransactions / totalTransactions) * 100 : 0;

  return {
    headlines: {
      totalUsers,
      totalHosts,
      totalEvents,
      totalPlatformVolume,
    },
    charts: {
      userAcquisition: acquisitionChartData,
      hostVerificationStatus: verificationChartData,
    },
    insights: {
      pendingHostApprovals: pendingHosts,
      transactionFailureRate: failureRate.toFixed(2), // Percentage
    },
  };
};

export const statisticsService = {
  userStatistics,
  hostStatistics,
  adminStatistics,
};
