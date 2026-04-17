import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { Role, ViewMode, SensoryMode, RewardType, TaskStatus } from '../src/generated/prisma/enums.ts';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Clean existing data
    await prisma.earnedPoint.deleteMany();
    await prisma.redemption.deleteMany();
    await prisma.reward.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.kanbanColumn.deleteMany();
    await prisma.kanbanBoard.deleteMany();
    await prisma.symbol.deleteMany();
    await prisma.favoriteSymbol.deleteMany();
    await prisma.earnedBadge.deleteMany();
    await prisma.badge.deleteMany();
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
        avatarUrl: '🧑‍🎓',
        role: Role.USER,
        householdId: household.id,
        viewMode: ViewMode.CARDS,
        themeId: nature.id,
        sensoryMode: SensoryMode.LOW_STIMULATION,
        rewardType: RewardType.TOKENS,
      },
    });

    const maja = await prisma.profile.create({
      data: {
        name: 'Maja',
        pin: '5678',
        avatarUrl: '🧑‍🎨',
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
        avatarUrl: '👨‍💻',
        role: Role.ADMIN,
        householdId: household.id,
        viewMode: ViewMode.TIMELINE,
        themeId: highContrast.id,
        sensoryMode: SensoryMode.LOW_STIMULATION,
        rewardType: RewardType.POINTS,
      },
    });

    // ─── Activities (unified tasks) ───────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const makeTime = (hour: number, minute = 0) => {
      const d = new Date(today);
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    // Erik's scheduled activities (appear in calendar)
    await prisma.activity.createMany({
      data: [
        {
          title: 'Frukost',
          color: '#fbbf24',
          startTime: makeTime(7, 0),
          endTime: makeTime(7, 30),
          status: TaskStatus.TODO,
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
          status: TaskStatus.TODO,
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
          status: TaskStatus.TODO,
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
          status: TaskStatus.TODO,
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
          status: TaskStatus.TODO,
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
          status: TaskStatus.TODO,
          sortOrder: 6,
          profileId: erik.id,
          symbolId: symbols[5].id,
          pointValue: 5,
        },
      ],
    });

    // Maja's scheduled activities
    await prisma.activity.createMany({
      data: [
        {
          title: 'Frukost',
          color: '#fbbf24',
          startTime: makeTime(7, 30),
          endTime: makeTime(8, 0),
          status: TaskStatus.TODO,
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
          status: TaskStatus.TODO,
          sortOrder: 2,
          profileId: maja.id,
          pointValue: 10,
        },
        {
          title: 'Leka ute',
          color: '#22c55e',
          startTime: makeTime(15, 30),
          endTime: makeTime(17, 0),
          status: TaskStatus.TODO,
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
          status: TaskStatus.TODO,
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
          status: TaskStatus.TODO,
          sortOrder: 5,
          profileId: maja.id,
          symbolId: symbols[7].id,
          pointValue: 0,
        },
      ],
    });

    // Backlog tasks (no startTime/endTime — appear in backlog/kanban)
    await prisma.activity.createMany({
      data: [
        { title: 'Packa skolväska', status: TaskStatus.BACKLOG, sortOrder: 10, profileId: erik.id, pointValue: 5, color: '#3b82f6' },
        { title: 'Läsa 20 minuter', status: TaskStatus.BACKLOG, sortOrder: 11, profileId: erik.id, pointValue: 10, color: '#f97316' },
        { title: 'Städa rummet', status: TaskStatus.BACKLOG, sortOrder: 12, profileId: erik.id, pointValue: 15, color: '#ef4444' },
        { title: 'Sortera lego', status: TaskStatus.IN_PROGRESS, sortOrder: 13, profileId: erik.id, pointValue: 10, color: '#22c55e' },
        { title: 'Plocka undan leksaker', status: TaskStatus.BACKLOG, sortOrder: 10, profileId: maja.id, pointValue: 5, color: '#ec4899' },
        { title: 'Vattna blomman', status: TaskStatus.BACKLOG, sortOrder: 11, profileId: maja.id, pointValue: 5, color: '#22c55e' },
        { title: 'Rita en teckning', status: TaskStatus.TODO, sortOrder: 12, profileId: maja.id, pointValue: 5, color: '#a78bfa' },
      ],
    });

    // ─── Rewards ───────────────────────────────────────────────────────
    await prisma.reward.createMany({
      data: [
        { name: 'Skärmtid (30 min)', cost: 30, profileId: erik.id, description: 'Titta på iPad eller spela TV-spel', iconUrl: '📱' },
        { name: 'Godis', cost: 50, profileId: erik.id, description: 'Välj en godis i affären', iconUrl: '🍬' },
        { name: 'Ny leksak', cost: 200, profileId: erik.id, description: 'Välj en leksak under 100 kr', iconUrl: '🧸' },
        { name: 'Film­kväll', cost: 80, profileId: erik.id, description: 'Välj film och gör popcorn', iconUrl: '🎬' },
        { name: 'Utflykt till parken', cost: 100, profileId: erik.id, description: 'Välj en park att besöka', iconUrl: '🌳' },
        { name: 'Klistermärke', cost: 10, profileId: maja.id, description: 'Välj ett fint klistermärke', iconUrl: '⭐' },
        { name: 'Skärmtid (15 min)', cost: 20, profileId: maja.id, description: 'Titta på Bolibompa eller liknande', iconUrl: '📺' },
        { name: 'Välj middag', cost: 40, profileId: maja.id, description: 'Bestäm vad vi äter till middag', iconUrl: '🍕' },
        { name: 'Pyssel', cost: 25, profileId: maja.id, description: 'Välj ett pyssel att göra', iconUrl: '🎨' },
        { name: 'Extra godnattsaga', cost: 15, profileId: maja.id, description: 'En extra saga vid läggdags', iconUrl: '📖' },
        { name: 'Baka kakor', cost: 60, profileId: maja.id, description: 'Baka kakor med mamma/pappa', iconUrl: '🍪' },
      ],
    });

    // ─── Pre-seeded earned points (so rewards have some balance) ──────
    await prisma.earnedPoint.createMany({
      data: [
        { amount: 25, reason: 'Startbonus – Välkommen till Timma!', profileId: erik.id },
        { amount: 25, reason: 'Startbonus – Välkommen till Timma!', profileId: maja.id },
      ],
    });

    // ─── Badges ────────────────────────────────────────────────────────
    await prisma.badge.createMany({
      data: [
        { name: 'Stjärnstartare', description: 'Klara 3 uppgifter på en dag', criteria: 'daily:3', profileId: erik.id, iconUrl: '🌟' },
        { name: 'Veckomästare', description: '7 dagars streak', criteria: 'streak:7', profileId: erik.id, iconUrl: '🏆' },
        { name: 'Poängjägare', description: 'Samla 100 poäng totalt', criteria: 'total:100', profileId: erik.id, iconUrl: '💰' },
        { name: 'Liten hjälte', description: 'Klara 2 uppgifter på en dag', criteria: 'daily:2', profileId: maja.id, iconUrl: '🦸' },
        { name: 'Superstjärna', description: '5 dagars streak', criteria: 'streak:5', profileId: maja.id, iconUrl: '⭐' },
      ],
    });

    // ─── Kanban Board ──────────────────────────────────────────────────
    await prisma.kanbanBoard.create({
      data: {
        name: 'Familjen Svenssons tavla',
        householdId: household.id,
        columns: {
          create: [
            { title: 'Att göra', sortOrder: 0, color: '#6366f1' },
            { title: 'Pågår', sortOrder: 1, color: '#f59e0b' },
            { title: 'Klart', sortOrder: 2, color: '#22c55e' },
          ],
        },
      },
    });

    console.log('Seed data created successfully!');
    console.log('  - 4 themes');
    console.log('  - 8 symbols');
    console.log('  - 1 household (Familjen Svensson)');
    console.log('  - 1 caregiver (anna@example.com)');
    console.log('  - 3 profiles (Erik, Maja, Admin)');
    console.log('  - 18 activities (11 scheduled + 7 backlog)');
    console.log('  - 11 rewards');
    console.log('  - 5 badges');
    console.log('  - 1 kanban board with 3 columns');
    console.log('  - 2 x 25 starting points');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
