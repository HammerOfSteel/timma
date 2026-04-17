/**
 * Generate iCalendar (.ics) content from activities.
 * Follows RFC 5545 specification.
 */

interface ICalActivity {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function formatDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldLine(line: string): string {
  // RFC 5545: lines SHOULD NOT be longer than 75 octets
  const parts: string[] = [];
  let remaining = line;
  while (remaining.length > 75) {
    parts.push(remaining.substring(0, 75));
    remaining = ' ' + remaining.substring(75);
  }
  parts.push(remaining);
  return parts.join('\r\n');
}

export function generateICalFeed(profileName: string, activities: ICalActivity[]): string {
  const now = formatDate(new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Timma//Schedule//SV',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(profileName)} - Timma`,
    'X-WR-TIMEZONE:Europe/Stockholm',
    // Timezone definition
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Stockholm',
    'BEGIN:STANDARD',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
  ];

  for (const activity of activities) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${activity.id}@timma.app`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;TZID=Europe/Stockholm:${formatLocalDate(activity.startTime)}`);
    lines.push(`DTEND;TZID=Europe/Stockholm:${formatLocalDate(activity.endTime)}`);
    lines.push(`SUMMARY:${escapeText(activity.title)}`);
    if (activity.description) {
      lines.push(`DESCRIPTION:${escapeText(activity.description)}`);
    }
    if (activity.completed) {
      lines.push('STATUS:COMPLETED');
    }
    lines.push(`CREATED:${formatDate(activity.createdAt)}`);
    lines.push(`LAST-MODIFIED:${formatDate(activity.updatedAt)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join('\r\n');
}

/** Format as local datetime without UTC 'Z' suffix for TZID usage */
function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}`;
}
