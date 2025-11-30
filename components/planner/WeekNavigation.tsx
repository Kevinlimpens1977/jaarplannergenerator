'use client';

import { formatWeekNumber, getMonthYearRange } from '@/lib/utils/dateUtils';

interface WeekNavigationProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onDateSelect: (date: Date) => void;
}

export default function WeekNavigation({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onDateSelect,
}: WeekNavigationProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onDateSelect(newDate);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onPreviousWeek}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          ← Vorige week
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">
            {formatWeekNumber(currentDate)}
          </h2>
          <p className="text-sm text-gray-600">
            {getMonthYearRange(currentDate)}
          </p>
        </div>

        <button
          onClick={onNextWeek}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Volgende week →
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <label htmlFor="date-picker" className="text-sm text-gray-600">
          Ga naar datum:
        </label>
        <input
          id="date-picker"
          type="date"
          onChange={handleDateChange}
          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
