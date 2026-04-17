export type RecurrenceType = 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY' | null;
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface ActivityData {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  startTime: string | null;
  endTime: string | null;
  status: TaskStatus;
  sortOrder: number;
  pointValue: number;
  imageUrl: string | null;
  recurrence: RecurrenceType;
  profileId?: string;
  profileName?: string;
  profileAvatarUrl?: string | null;
  symbol: {
    id: string;
    name: string;
    imageUrl: string;
  } | null;
  signVideo: {
    id: string;
    word: string;
    videoUrl: string;
  } | null;
}

export interface ScheduleViewProps {
  activities: ActivityData[];
  date: string;
  onToggleComplete: (id: string) => void;
  onEdit: (activity: ActivityData) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}
