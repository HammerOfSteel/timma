import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { Role, ViewMode, SensoryMode, RewardType } from '../src/generated/prisma/enums.ts';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Clean existing data
    await prisma.earnedPoint.deleteMany();
    await prisma.reward.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.todo.deleteMany();
    await prisma.symbol.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.caregiver.deleteMany();
    await prisma.theme.deleteMany();
    await prisma.household.deleteMany();

    // ─── Themes ────────────────────────────────────────────────────────
    const calmPastel = await prisma.theme.create({
      data: {
        name: 'Lugn Pastell',
        isBuiltIn: true,
        primaryColor: '#a78bfa',
        secondaryColor: '#c4b5fd',
        backgroundColor: '#faf5ff',
        textColor: '#1e1b4b',
        accentColor: '#7c3aed',
      },
    });

    const highContrast = await prisma.theme.create({
      data: {
        name: 'Hög Kontrast',
        isBuiltIn: true,
        primaryColor: '#ffffff',
        secondaryColor: '#fbbf24',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        accentColor: '#fbbf24',
      },
    });

    const nature = await prisma.theme.create({
      data: {
        name: 'Natur',
        isBuiltIn: true,
        primaryColor: '#22c55e',
        secondaryColor: '#86efac',
        backgroundColor: '#f0fdf4',
        textColor: '#14532d',
        accentColor: '#16a34a',
      },
    });

    await prisma.theme.create({
      data: {
        name: 'Rymden',
        isBuiltIn: true,
        primaryColor: '#6366f1',
        secondaryColor: '#818cf8',
        backgroundColor: '#0f172a',
        textColor: '#e2e8f0',
        accentColor: '#a78bfa',
      },
    });

    // ─── Symbols ───────────────────────────────────────────────────────
    const symbols = await Promise.all([
      prisma.symbol.create({
        data: { name: 'Frukost', imageUrl: '/symbols/breakfast.svg', category: 'food' },
      }),
      prisma.symbol.create({
        data: { name: 'Skola', imageUrl: '/symbols/school.svg', category: 'activity' },
      }),
      prisma.symbol.create({
        data: { name: 'Lunch', imageUrl: '/symbols/lunch.svg', category: 'food' },
      }),
      prisma.symbol.create({
        data: { name: 'Leka', imageUrl: '/symbols/play.svg', category: 'activity' },
      }),
      prisma.symbol.create({
        data: { name: 'Läxa', imageUrl: '/symbols/homework.svg', category: 'activity' },
      }),
      prisma.symbol.create({
        data: { name: 'Middag', imageUrl: '/symbols/dinner.svg', category: 'food' },
      }),
      prisma.symbol.create({
        data: {
          name: 'Borsta tänder',
          imageUrl: '/symbols/brush-teeth.svg',
          category: 'routine',
        },
      }),
      prisma.symbol.create({
        data: { name: 'Sova', imageUrl: '/symbols/sleep.svg', category: 'routine' },
      }),
    ]);

    // ─── Household ─────────────────────────────────────────────────────
    const household = await prisma.household.create({
      data: { name: 'Familjen Svensson' },
    });

    // ─── Caregiver ─────────────────────────────────────────────────────
    await prisma.caregiver.create({
      data: {
        email: 'anna@example.com',
        // Password: timma123
        passwordHash: '$2b$10$Qfka32TZBo/Y6TdfM1xyIeZXIpxefP/27VCzpleyGlnsmvWlIARl6',
        name: 'Anna Svensson',
        householdId: household.id,
      },
    });

    // ─── Profiles ──────────────────────────────────────────────────────
    const erik = await prisma.profile.create({
      data: {
        name: 'Erik',
        pin: '1234',
        role: Role.USER,
        householdId: household.id,
        viewMode: ViewMode.CARDS,
        themeId: calmPastel.id,
        sensoryMode: SensoryMode.LOW_STIMULATION,
        rewardType: RewardType.TOKENS,
      },
    });

    const maja = await prisma.profile.create({
      data: {
        name: 'Maja',
        pin: '5678',
        role: Role.USER,
        householdId: household.id,
        viewMode: ViewMode.BLOCKS,
        themeId: nature.id,
        sensoryMode: SensoryMode.HIGH_ENGAGEMENT,
        rewardType: RewardType.STARS,
      },
    });

    await prisma.profile.create({
      data: {
        name: 'Admin',
        pin: '0000',
        role: Role.ADMIN,
        householdId: household.id,
        viewMode: ViewMode.TIMELINE,
        themeId: highContrast.id,
        sensoryMode: SensoryMode.LOW_STIMULATION,
        rewardType: RewardType.POINTS,
      },
    });

    // ─── Activities for Erik (today) ──────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const makeTime = (hour, minute = 0) => {
      const d = new Date(today);
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    await prisma.activity.createMany({
      data: [
        {
          title: 'Frukost',
          color: '#fbbf24',
          startTime: makeTime(7, 0),
          endTime: makeTime(7, 30),
          sortOrder: 1,
          profileId: erik.id,
          symbolId: symbols[0].id,
          pointValue: 5,
        },
        {
          title: 'Skola',
          color: '#3b82f6',
          startTime: makeTime(8, 0),
          endTime: makeTime(14, 0),
          sortOrder: 2,
          profileId: erik.id,
          symbolId: symbols[1].id,
          pointValue: 10,
        },
        {
          title: 'Lunch',
          color: '#22c55e',
          startTime: makeTime(12, 0),
          endTime: makeTime(12, 30),
          sortOrder: 3,
          profileId: erik.id,
          symbolId: symbols[2].id,
          pointValue: 5,
        },
        {
          title: 'Leka',
          color: '#a78bfa',
          startTime: makeTime(15, 0),
          endTime: makeTime(16, 30),
          sortOrder: 4,
          profileId: erik.id,
          symbolId: symbols[3].id,
          pointValue: 0,
        },
        {
          title: 'Läxa',
          color: '#f97316',
          startTime: makeTime(17, 0),
          endTime: makeTime(17, 45),
          sortOrder: 5,
          profileId: erik.id,
          symbolId: symbols[4].id,
          pointValue: 15,
        },
        {
          title: 'Middag',
          color: '#ef4444',
          startTime: makeTime(18, 0),
          endTime: makeTime(18, 30),
          sortOrder: 6,
          profileId: erik.id,
          symbolId: symbols[5].id,
          pointValue: 5,
        },
      ],
    });

    // ─── Activities for Maja (today) ──────────────────────────────────
    await prisma.activity.createMany({
      data: [
        {
          title: 'Frukost',
          color: '#fbbf24',
          startTime: makeTime(7, 30),
          endTime: makeTime(8, 0),
          sortOrder: 1,
          profileId: maja.id,
          symbolId: symbols[0].id,
          pointValue: 5,
        },
        {
          title: 'Förskola',
          color: '#ec4899',
          startTime: makeTime(8, 30),
          endTime: makeTime(15, 0),
          sortOrder: 2,
          profileId: maja.id,
          pointValue: 10,
        },
        {
          title: 'Leka ute',
          color: '#22c55e',
          startTime: makeTime(15, 30),
          endTime: makeTime(17, 0),
          sortOrder: 3,
          profileId: maja.id,
          symbolId: symbols[3].id,
          pointValue: 0,
        },
        {
          title: 'Borsta tänder',
          color: '#06b6d4',
          startTime: makeTime(19, 0),
          endTime: makeTime(19, 15),
          sortOrder: 4,
          profileId: maja.id,
          symbolId: symbols[6].id,
          pointValue: 5,
        },
        {
          title: 'Godnattsaga',
          color: '#8b5cf6',
          startTime: makeTime(19, 30),
          endTime: makeTime(20, 0),
          sortOrder: 5,
          profileId: maja.id,
          symbolId: symbols[7].id,
          pointValue: 0,
        },
      ],
    });

    // ─── Rewards ───────────────────────────────────────────────────────
    await prisma.reward.createMany({
      data: [
        { name: 'Skärmtid (30 min)', cost: 30, profileId: erik.id },
        { name: 'Godis', cost: 50, profileId: erik.id },
        { name: 'Ny leksak', cost: 200, profileId: erik.id },
        { name: 'Klistermärke', cost: 10, profileId: maja.id },
        { name: 'Skärmtid (15 min)', cost: 20, profileId: maja.id },
        { name: 'Välj middag', cost: 40, profileId: maja.id },
      ],
    });

    // ─── Todos ─────────────────────────────────────────────────────────
    await prisma.todo.createMany({
      data: [
        { title: 'Packa skolväska', sortOrder: 1, profileId: erik.id },
        { title: 'Läsa 20 minuter', sortOrder: 2, profileId: erik.id },
        { title: 'Städa rummet', sortOrder: 3, profileId: erik.id },
        { title: 'Plocka undan leksaker', sortOrder: 1, profileId: maja.id },
        { title: 'Vattna blomman', sortOrder: 2, profileId: maja.id },
      ],
    });

    console.log('Seed data created successfully!');
    console.log('  - 4 themes');
    console.log('  - 8 symbols');
    console.log('  - 1 household (Familjen Svensson)');
    console.log('  - 1 caregiver (anna@example.com)');
    console.log('  - 3 profiles (Erik, Maja, Admin)');
    console.log('  - 11 activities');
    console.log('  - 6 rewards');
    console.log('  - 5 todos');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
