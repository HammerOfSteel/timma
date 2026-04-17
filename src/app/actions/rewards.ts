'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

// ─── Queries ──────────────────────────────────────────────────────────

export async function getRewardData(profileId: string) {
  const [
    profile,
    rewards,
    earnedPoints,
    redemptions,
    badges,
    earnedBadges,
  ] = await Promise.all([
    prisma.profile.findUnique({ where: { id: profileId }, select: { rewardType: true } }),
    prisma.reward.findMany({ where: { profileId }, orderBy: { createdAt: 'asc' } }),
    prisma.earnedPoint.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { activity: { select: { title: true } } },
    }),
    prisma.redemption.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { reward: { select: { name: true, iconUrl: true } } },
    }),
    prisma.badge.findMany({ where: { profileId }, orderBy: { createdAt: 'asc' } }),
    prisma.earnedBadge.findMany({
      where: { profileId },
      include: { badge: true },
    }),
  ]);

  const totalEarned = earnedPoints.reduce((sum, ep) => sum + ep.amount, 0);
  const totalSpent = redemptions.reduce((sum, r) => sum + r.cost, 0);
  const balance = totalEarned - totalSpent;

  // Streak calculation: consecutive days with at least one completed activity
  const streak = await calculateStreak(profileId);

  // Today's completed count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayCompleted = await prisma.activity.count({
    where: { profileId, status: 'DONE', startTime: { gte: todayStart }, endTime: { lte: todayEnd } },
  });

  // This week completed
  const weekStart = new Date();
  const dayOfWeek = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekCompleted = await prisma.activity.count({
    where: { profileId, status: 'DONE', startTime: { gte: weekStart } },
  });
  const weekTotal = await prisma.activity.count({
    where: { profileId, startTime: { gte: weekStart }, endTime: { lte: todayEnd } },
  });

  return {
    rewardType: profile?.rewardType || 'POINTS',
    balance,
    totalEarned,
    totalSpent,
    streak,
    todayCompleted,
    weekCompleted,
    weekTotal,
    rewards,
    earnedPoints: earnedPoints.map((ep) => ({
      id: ep.id,
      amount: ep.amount,
      reason: ep.reason,
      createdAt: ep.createdAt.toISOString(),
      activityTitle: ep.activity?.title || null,
    })),
    redemptions: redemptions.map((r) => ({
      id: r.id,
      cost: r.cost,
      createdAt: r.createdAt.toISOString(),
      rewardName: r.reward.name,
      rewardIcon: r.reward.iconUrl,
    })),
    badges,
    earnedBadges: earnedBadges.map((eb) => ({
      id: eb.id,
      earnedAt: eb.earnedAt.toISOString(),
      badge: eb.badge,
    })),
  };
}

async function calculateStreak(profileId: string): Promise<number> {
  let streak = 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const completed = await prisma.activity.count({
      where: {
        profileId,
        status: 'DONE',
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
      },
    });

    if (completed > 0) {
      streak++;
    } else if (i > 0) {
      // Allow today to have 0 without breaking streak
      break;
    }
  }

  return streak;
}

// ─── Mutations ────────────────────────────────────────────────────────

export async function createReward(formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const cost = parseInt(formData.get('cost') as string) || 10;
  const iconUrl = (formData.get('iconUrl') as string) || null;

  if (!name) return { error: 'Namn krävs.' };

  await prisma.reward.create({
    data: { name, description, cost, iconUrl, profileId: session.activeProfileId },
  });

  revalidatePath('/rewards');
}

export async function deleteReward(rewardId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.reward.deleteMany({
    where: { id: rewardId, profileId: session.activeProfileId },
  });

  revalidatePath('/rewards');
}

export async function redeemReward(rewardId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const reward = await prisma.reward.findFirst({
    where: { id: rewardId, profileId: session.activeProfileId },
  });
  if (!reward) return { error: 'Belöningen hittades inte.' };

  // Check balance
  const totalEarned = await prisma.earnedPoint.aggregate({
    where: { profileId: session.activeProfileId },
    _sum: { amount: true },
  });
  const totalSpent = await prisma.redemption.aggregate({
    where: { profileId: session.activeProfileId },
    _sum: { cost: true },
  });
  const balance = (totalEarned._sum.amount || 0) - (totalSpent._sum.cost || 0);

  if (balance < reward.cost) {
    return { error: 'Inte tillräckligt med poäng.' };
  }

  await prisma.redemption.create({
    data: {
      cost: reward.cost,
      profileId: session.activeProfileId,
      rewardId: reward.id,
    },
  });

  revalidatePath('/rewards');
}

export async function setRewardType(rewardType: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  if (!['POINTS', 'TOKENS', 'STARS', 'BADGES'].includes(rewardType)) return;

  await prisma.profile.update({
    where: { id: session.activeProfileId },
    data: { rewardType: rewardType as 'POINTS' | 'TOKENS' | 'STARS' | 'BADGES' },
  });

  revalidatePath('/rewards');
}

export async function earnPointsForActivity(activityId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, profileId: session.activeProfileId },
  });
  if (!activity || activity.pointValue <= 0) return;

  // Check if points already earned for this activity today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const existing = await prisma.earnedPoint.findFirst({
    where: { activityId, profileId: session.activeProfileId, createdAt: { gte: todayStart } },
  });
  if (existing) return; // Already earned today

  await prisma.earnedPoint.create({
    data: {
      amount: activity.pointValue,
      reason: `Slutfört: ${activity.title}`,
      profileId: session.activeProfileId,
      activityId,
    },
  });

  // Check and award badges
  await checkAndAwardBadges(session.activeProfileId);

  revalidatePath('/rewards');
}

export async function revokePointsForActivity(activityId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  await prisma.earnedPoint.deleteMany({
    where: { activityId, profileId: session.activeProfileId, createdAt: { gte: todayStart } },
  });

  revalidatePath('/rewards');
}

async function checkAndAwardBadges(profileId: string) {
  const badges = await prisma.badge.findMany({ where: { profileId } });
  const earnedBadgeIds = (
    await prisma.earnedBadge.findMany({ where: { profileId }, select: { badgeId: true } })
  ).map((eb) => eb.badgeId);

  const totalEarned = (
    await prisma.earnedPoint.aggregate({ where: { profileId }, _sum: { amount: true } })
  )._sum.amount || 0;

  const streak = await calculateStreak(profileId);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayCompleted = await prisma.activity.count({
    where: { profileId, status: 'DONE', startTime: { gte: todayStart }, endTime: { lte: todayEnd } },
  });

  for (const badge of badges) {
    if (earnedBadgeIds.includes(badge.id)) continue;

    const [type, valueStr] = badge.criteria.split(':');
    const value = parseInt(valueStr);
    let earned = false;

    if (type === 'streak' && streak >= value) earned = true;
    else if (type === 'total' && totalEarned >= value) earned = true;
    else if (type === 'daily' && todayCompleted >= value) earned = true;

    if (earned) {
      await prisma.earnedBadge.create({
        data: { profileId, badgeId: badge.id },
      });
    }
  }
}

export async function createBadge(formData: FormData) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const criteria = formData.get('criteria') as string;

  if (!name || !criteria) return { error: 'Namn och kriterium krävs.' };

  await prisma.badge.create({
    data: { name, description, criteria, profileId: session.activeProfileId },
  });

  revalidatePath('/rewards');
}

export async function deleteBadge(badgeId: string) {
  const session = await getSession();
  if (!session?.activeProfileId) redirect('/login');

  await prisma.badge.deleteMany({
    where: { id: badgeId, profileId: session.activeProfileId },
  });

  revalidatePath('/rewards');
}
