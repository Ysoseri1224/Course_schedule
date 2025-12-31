import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export function getWeekStartDate(date = new Date()) {
  return dayjs(date).startOf('isoWeek').format('YYYY-MM-DD');
}

export function getWeekEndDate(date = new Date()) {
  return dayjs(date).endOf('isoWeek').format('YYYY-MM-DD');
}

export function getWeekDates(weekStart) {
  const start = dayjs(weekStart);
  return Array.from({ length: 7 }, (_, i) => ({
    date: start.add(i, 'day').format('YYYY-MM-DD'),
    dayOfWeek: i + 1,
    month: start.add(i, 'day').format('MM'),
    day: start.add(i, 'day').format('DD'),
    weekday: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
  }));
}

export function formatWeekRange(weekStart) {
  const start = dayjs(weekStart);
  const end = start.add(6, 'day');
  return `${start.format('MM.DD')}-${end.format('MM.DD')}`;
}

export function getWeekStartFromDate(dateString) {
  return dayjs(dateString).startOf('isoWeek').format('YYYY-MM-DD');
}

export const TIME_SLOTS = [
  { id: 1, label: '1st', time: '08:10-08:55' },
  { id: 2, label: '2nd', time: '09:05-09:50' },
  { id: 3, label: '3rd', time: '10:00-10:45' },
  { id: 4, label: '4th', time: '10:55-11:40' },
  { id: 5, label: '5th', time: '13:30-14:15' },
  { id: 6, label: '6th', time: '14:25-15:10' },
  { id: 7, label: '7th', time: '15:20-16:05' },
  { id: 8, label: '8th', time: '16:15-17:00' },
  { id: 9, label: '9th', time: '17:00-17:45' },
  { id: 10, label: '10th', time: '17:55-18:40' },
];
