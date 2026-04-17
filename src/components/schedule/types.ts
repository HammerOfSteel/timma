export type RecurrenceType = 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY' | null;

export interface ActivityData {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  startTime: string; // ISO string (serialized from Date)
  endTime: string;
  completed: boolean;
  sortOrder: number;
  pointValue: number;
  imageUrl: string | null;
  recurrence: RecurrenceType;
  symbol: {
    id: string;
    name: string;
    imageUrl: string;
  } | null;
}

export interface ScheduleViewProps {
  activities: ActivityData[];
  date: string; // YYYY-MM-DD
  onToggleComplete: (id: string) => void;
  onEdit: (activity: ActivityData) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}
