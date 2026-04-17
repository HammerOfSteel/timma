'use client';

import { useState, useTransition } from 'react';
import {
  createReward,
  deleteReward,
  redeemReward,
  setRewardType,
  createBadge,
  deleteBadge,
} from '@/app/actions/rewards';

interface EarnedPointData {
  id: string;
  amount: number;
  reason: string | null;
  createdAt: string;
  activityTitle: string | null;
}

interface RedemptionData {
  id: string;
  cost: number;
  createdAt: string;
  rewardName: string;
  rewardIcon: string | null;
}

interface RewardData {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  cost: number;
}

interface BadgeData {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  criteria: string;
}

interface EarnedBadgeData {
  id: string;
  earnedAt: string;
  badge: BadgeData;
}

interface RewardsDashboardProps {
  rewardType: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  streak: number;
  todayCompleted: number;
  weekCompleted: number;
  weekTotal: number;
  rewards: RewardData[];
  earnedPoints: EarnedPointData[];
  redemptions: RedemptionData[];
  badges: BadgeData[];
  earnedBadges: EarnedBadgeData[];
}

const REWARD_TYPES = [
  { key: 'POINTS', label: 'Poäng', icon: '🎯' },
  { key: 'TOKENS', label: 'Tokens', icon: '🪙' },
  { key: 'STARS', label: 'Stjärnor', icon: '⭐' },
  { key: 'BADGES', label: 'Märken', icon: '🏅' },
];

const BADGE_CRITERIA = [
  { value: 'streak:3', label: '3 dagars streak' },
  { value: 'streak:7', label: '7 dagars streak' },
  { value: 'streak:14', label: '14 dagars streak' },
  { value: 'streak:30', label: '30 dagars streak' },
  { value: 'total:50', label: '50 poäng totalt' },
  { value: 'total:100', label: '100 poäng totalt' },
  { value: 'total:500', label: '500 poäng totalt' },
  { value: 'daily:3', label: '3 aktiviteter på en dag' },
  { value: 'daily:5', label: '5 aktiviteter på en dag' },
  { value: 'daily:10', label: '10 aktiviteter på en dag' },
];

export function RewardsDashboard(props: RewardsDashboardProps) {
  const {
    rewardType,
    balance,
    totalEarned,
    streak,
    todayCompleted,
    weekCompleted,
    weekTotal,
    rewards,
    earnedPoints,
    redemptions,
    badges,
    earnedBadges,
  } = props;

  const [isPending, startTransition] = useTransition();
  const [showAddReward, setShowAddReward] = useState(false);
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'shop' | 'history' | 'badges'>('overview');

  function handleSetType(type: string) {
    startTransition(() => { setRewardType(type); });
  }

  function handleRedeem(rewardId: string) {
    startTransition(() => { redeemReward(rewardId); });
  }

  function handleDeleteReward(rewardId: string) {
    startTransition(() => { deleteReward(rewardId); });
  }

  function handleAddReward(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => { createReward(formData); });
    setShowAddReward(false);
  }

  function handleAddBadge(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => { createBadge(formData); });
    setShowAddBadge(false);
  }

  function handleDeleteBadge(badgeId: string) {
    startTransition(() => { deleteBadge(badgeId); });
  }

  const unitLabel = rewardType === 'TOKENS' ? 'tokens' : rewardType === 'STARS' ? 'stjärnor' : 'poäng';
  const unitIcon = REWARD_TYPES.find((t) => t.key === rewardType)?.icon || '🎯';

  return (
    <div className="flex flex-1 flex-col p-4">
      {isPending && (
        <div className="flex justify-center py-1">
          <div className="h-1 w-24 animate-pulse rounded-full bg-indigo-400" />
        </div>
      )}

      {/* Reward type selector */}
      <div className="mb-4 flex items-center justify-center gap-2">
        {REWARD_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => handleSetType(t.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
              rewardType === t.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Saldo" value={`${balance} ${unitLabel}`} icon={unitIcon} color="bg-indigo-50 text-indigo-700" />
        <StatCard label="Streak" value={`${streak} dagar`} icon="🔥" color="bg-orange-50 text-orange-700" />
        <StatCard label="Idag" value={`${todayCompleted} klara`} icon="✅" color="bg-green-50 text-green-700" />
        <StatCard label="Veckan" value={weekTotal > 0 ? `${weekCompleted}/${weekTotal}` : '—'} icon="📊" color="bg-blue-50 text-blue-700" />
      </div>

      {/* Visual display based on reward type */}
      {rewardType === 'TOKENS' && <TokenBoard balance={balance} />}
      {rewardType === 'STARS' && <StarChart weekCompleted={weekCompleted} weekTotal={weekTotal} />}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {([
          { key: 'overview', label: 'Översikt' },
          { key: 'shop', label: 'Belöningsbutik' },
          { key: 'history', label: 'Historik' },
          { key: 'badges', label: 'Märken' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === tab.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Senaste intjänade</h3>
          {earnedPoints.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">Inga poäng intjänade ännu. Slutför aktiviteter för att tjäna {unitLabel}!</p>
          )}
          {earnedPoints.slice(0, 10).map((ep) => (
            <div key={ep.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2">
              <div>
                <p className="text-sm font-medium">{ep.reason || ep.activityTitle || 'Poäng'}</p>
                <p className="text-xs text-gray-400">{new Date(ep.createdAt).toLocaleDateString('sv-SE')}</p>
              </div>
              <span className="font-semibold text-green-600">+{ep.amount}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Belöningar att lösa in</h3>
            <button
              onClick={() => setShowAddReward(true)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              + Ny belöning
            </button>
          </div>

          {rewards.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">Inga belöningar skapade. Lägg till en belöning som kan lösas in!</p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rewards.map((reward) => (
              <div key={reward.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{reward.iconUrl || '🎁'}</span>
                    <div>
                      <h4 className="font-semibold">{reward.name}</h4>
                      {reward.description && <p className="text-xs text-gray-500">{reward.description}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="rounded p-1 text-gray-300 hover:text-red-500"
                    title="Ta bort"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">{reward.cost} {unitLabel}</span>
                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={balance < reward.cost}
                    className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                      balance >= reward.cost
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'cursor-not-allowed bg-gray-100 text-gray-400'
                    }`}
                  >
                    Lös in
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add reward modal */}
          {showAddReward && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <form onSubmit={handleAddReward} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold">Ny belöning</h3>
                <div className="mt-4 space-y-3">
                  <input name="name" type="text" required placeholder="Namn (t.ex. Extra skärmtid)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <input name="description" type="text" placeholder="Beskrivning (valfritt)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <div className="flex gap-3">
                    <input name="cost" type="number" min="1" defaultValue="10" required className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                    <span className="self-center text-sm text-gray-500">{unitLabel}</span>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Ikon (emoji)</label>
                    <input name="iconUrl" type="text" placeholder="🎁" maxLength={4} className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-center text-lg focus:border-indigo-500 focus:outline-none" />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddReward(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50">Avbryt</button>
                  <button type="submit" className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">Lägg till</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Inlösta belöningar</h3>
          {redemptions.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">Inga belöningar inlösta ännu.</p>
          )}
          {redemptions.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{r.rewardIcon || '🎁'}</span>
                <div>
                  <p className="text-sm font-medium">{r.rewardName}</p>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('sv-SE')}</p>
                </div>
              </div>
              <span className="font-semibold text-red-500">-{r.cost}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Märken & Prestationer</h3>
            <button
              onClick={() => setShowAddBadge(true)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              + Nytt märke
            </button>
          </div>

          {/* Earned badges */}
          {earnedBadges.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Intjänade</h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {earnedBadges.map((eb) => (
                  <div key={eb.id} className="flex flex-col items-center rounded-xl border border-yellow-200 bg-yellow-50 p-3">
                    <span className="text-3xl">{eb.badge.iconUrl || '🏅'}</span>
                    <p className="mt-1 text-center text-xs font-semibold">{eb.badge.name}</p>
                    <p className="text-[10px] text-gray-400">{new Date(eb.earnedAt).toLocaleDateString('sv-SE')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All badges */}
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Alla märken</h4>
            {badges.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">Inga märken skapade. Lägg till prestationer att sträva efter!</p>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {badges.map((badge) => {
                const isEarned = earnedBadges.some((eb) => eb.badge.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`relative flex flex-col items-center rounded-xl border p-3 ${
                      isEarned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="absolute right-1 top-1 rounded p-0.5 text-gray-300 hover:text-red-500"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <span className={`text-2xl ${isEarned ? '' : 'grayscale'}`}>{badge.iconUrl || '🏅'}</span>
                    <p className="mt-1 text-center text-xs font-semibold">{badge.name}</p>
                    {badge.description && <p className="text-center text-[10px] text-gray-500">{badge.description}</p>}
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {formatCriteria(badge.criteria)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add badge modal */}
          {showAddBadge && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <form onSubmit={handleAddBadge} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold">Nytt märke</h3>
                <div className="mt-4 space-y-3">
                  <input name="name" type="text" required placeholder="Namn (t.ex. Superstreaker)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <input name="description" type="text" placeholder="Beskrivning (valfritt)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Kriterium</label>
                    <select name="criteria" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                      {BADGE_CRITERIA.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddBadge(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50">Avbryt</button>
                  <button type="submit" className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">Lägg till</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className={`rounded-xl p-3 ${color}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">{label}</p>
          <p className="text-sm font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TokenBoard({ balance }: { balance: number }) {
  const maxTokens = 20;
  const filled = Math.min(balance, maxTokens);

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="mb-2 text-center text-sm font-semibold text-amber-800">Token-tavla</h3>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: maxTokens }, (_, i) => (
          <div
            key={i}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
              i < filled
                ? 'bg-amber-400 shadow-md'
                : 'border-2 border-dashed border-amber-300 bg-amber-100'
            }`}
          >
            {i < filled ? '🪙' : ''}
          </div>
        ))}
      </div>
      {balance > maxTokens && (
        <p className="mt-2 text-center text-xs text-amber-600">+{balance - maxTokens} fler tokens</p>
      )}
    </div>
  );
}

function StarChart({ weekCompleted, weekTotal }: { weekCompleted: number; weekTotal: number }) {
  const percentage = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
  const stars = 5;
  const filledStars = Math.round((percentage / 100) * stars);

  return (
    <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <h3 className="mb-2 text-center text-sm font-semibold text-blue-800">Veckans stjärnor</h3>
      <div className="flex justify-center gap-3">
        {Array.from({ length: stars }, (_, i) => (
          <span key={i} className={`text-3xl transition ${i < filledStars ? '' : 'opacity-20 grayscale'}`}>
            ⭐
          </span>
        ))}
      </div>
      {/* Progress bar */}
      <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-blue-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-center text-xs text-blue-600">
        {weekCompleted}/{weekTotal} aktiviteter ({percentage}%)
      </p>
    </div>
  );
}

function formatCriteria(criteria: string): string {
  const [type, value] = criteria.split(':');
  switch (type) {
    case 'streak': return `${value} dagars streak`;
    case 'total': return `${value} poäng totalt`;
    case 'daily': return `${value} per dag`;
    default: return criteria;
  }
}
