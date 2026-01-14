export interface EventDetails {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  url?: string;
}

export function generateIcs(event: EventDetails): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EveNex//Event Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@evenex.com`,
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(event.endTime)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    ...(event.url ? [`URL:${event.url}`] : []),
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

export function downloadIcsFile(event: EventDetails, filename?: string): void {
  const icsContent = generateIcs(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(link.href);
}