import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export const bootstrapDayjs = () => {
  dayjs.tz.setDefault(DEFAULT_TIMEZONE);
};

export const toUtc = (value: string | Date | undefined | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  return dayjs(value).utc().toISOString();
};

export const fromUtc = (value: string | undefined | null): dayjs.Dayjs | undefined => {
  if (!value) {
    return undefined;
  }
  return dayjs(value).tz(DEFAULT_TIMEZONE);
};

export const formatForList = (value: string | undefined | null): string => {
  const parsed = fromUtc(value);
  return parsed ? parsed.format('DD MMM, HH:mm') : '';
};
