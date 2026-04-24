'use client';

import Link from 'next/link';
import { getApiBaseUrl } from '@/lib/api';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Search, Users } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

type CalendarMode = 'native' | 'bungalow';

type Props = {
  bungalowId?: string;
  hint?: string;
  locale?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  /** Ana sayfa: native tarayici takvimi. Bungalov detay: dolu gunleri pasif gosteren ozel takvim. */
  calendarMode?: CalendarMode;
};

export function ReservationForm({
  bungalowId,
  hint,
  locale = 'tr',
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 2,
  calendarMode = 'native',
}: Props) {
  const t = useTranslations('search');
  const tCommon = useTranslations('common');
  const format = useFormatter();
  const isBungalowCalendar = calendarMode === 'bungalow';

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const [openCalendar, setOpenCalendar] = useState<'checkIn' | 'checkOut' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  const [availabilityStatus, setAvailabilityStatus] = useState<
    'idle' | 'checking' | 'available' | 'unavailable'
  >(bungalowId ? 'idle' : 'available');

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        format.dateTime(new Date(2024, 0, 1 + i), { weekday: 'short' }),
      ),
    [format],
  );
  const monthLabel = useMemo(
    () => calendarMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
    [calendarMonth, locale],
  );

  function openPicker(ref: RefObject<HTMLInputElement>) {
    const input = ref.current;
    if (!input) return;
    try {
      input.showPicker?.();
    } catch {
      // Tarayici izin vermezse native date input yine normal calisir.
    }
  }

  function toDateKey(date: Date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function localTodayKey() {
    return toDateKey(new Date());
  }

  function addOneDayToDateKey(key: string) {
    const [y, m, d] = key.split('-').map(Number);
    if (!y || !m || !d) return key;
    const dt = new Date(y, m - 1, d + 1);
    return toDateKey(dt);
  }

  function apiDateToLocalKey(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value.slice(0, 10);
    return toDateKey(d);
  }

  function parseDate(value: string) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function getCalendarDays(viewDate: Date) {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const start = addDays(firstDay, -offset);
    return Array.from({ length: 42 }, (_, idx) => addDays(start, idx));
  }

  function hasUnavailableInRange(startValue: string, endValue: string) {
    const start = parseDate(startValue);
    const end = parseDate(endValue);
    if (!start || !end || end <= start) return false;
    for (let cursor = new Date(start); cursor < end; cursor = addDays(cursor, 1)) {
      if (unavailableDates.has(toDateKey(cursor))) return true;
    }
    return false;
  }

  function selectDate(value: string) {
    if (openCalendar === 'checkIn') {
      setCheckIn(value);
      if (checkOut && parseDate(checkOut) && parseDate(value) && parseDate(checkOut)! <= parseDate(value)!) {
        setCheckOut('');
      }
      setOpenCalendar('checkOut');
      return;
    }
    if (openCalendar === 'checkOut') {
      setCheckOut(value);
      setOpenCalendar(null);
    }
  }

  const hasDateRange =
    checkIn &&
    checkOut &&
    new Date(checkOut).getTime() > new Date(checkIn).getTime();

  const rangeHasUnavailable =
    isBungalowCalendar && hasDateRange ? hasUnavailableInRange(checkIn, checkOut) : false;

  const todayKeyStr = localTodayKey();
  const checkInNotInPast = !checkIn || checkIn >= todayKeyStr;

  const canContinue =
    hasDateRange &&
    checkInNotInPast &&
    !rangeHasUnavailable &&
    (!bungalowId ||
      availabilityStatus === 'available' ||
      availabilityStatus === 'idle');

  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);

  useEffect(() => {
    if (!isBungalowCalendar || !bungalowId) return;
    const controller = new AbortController();
    fetch(`${getApiBaseUrl()}/availability/${bungalowId}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return [];
        return (await response.json()) as Array<{ date: string; isAvailable: boolean }>;
      })
      .then((rows) => {
        const blocked = rows
          .filter((row) => row.isAvailable === false)
          .map((row) => apiDateToLocalKey(row.date));
        setUnavailableDates(new Set(blocked));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setUnavailableDates(new Set());
      });

    return () => controller.abort();
  }, [bungalowId, isBungalowCalendar]);

  useEffect(() => {
    if (!bungalowId || !hasDateRange) {
      setAvailabilityStatus(bungalowId ? 'idle' : 'available');
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    }).toString();

    setAvailabilityStatus('checking');
    fetch(`${getApiBaseUrl()}/bungalows/search?${params}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('search failed');
        const rows = (await response.json()) as Array<{ id: string }>;
        const available = rows.some((item) => item.id === bungalowId);
        setAvailabilityStatus(available ? 'available' : 'unavailable');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setAvailabilityStatus('available');
      });

    return () => controller.abort();
  }, [bungalowId, checkIn, checkOut, guests, hasDateRange]);

  return (
    <div className="rounded-[2rem] border border-bgl-mist/90 bg-white/95 p-4 shadow-soft md:p-5">
      {hint ? <p className="text-xs leading-relaxed text-bgl-muted">{hint}</p> : null}
      {bungalowId && availabilityStatus === 'checking' ? (
        <p className="mt-2 text-xs text-bgl-muted">{t('availabilityChecking')}</p>
      ) : null}
      {bungalowId && availabilityStatus === 'unavailable' ? (
        <p className="mt-2 text-xs font-medium text-rose-700">{t('selectedDatesUnavailable')}</p>
      ) : null}
      {isBungalowCalendar && rangeHasUnavailable ? (
        <p className="mt-2 text-xs font-medium text-rose-700">{t('selectedDatesUnavailable')}</p>
      ) : null}
      {checkIn && !checkInNotInPast ? (
        <p className="mt-2 text-xs font-medium text-rose-700">{t('checkInPastNotAllowed')}</p>
      ) : null}

      <div className="mt-2 grid gap-3 md:grid-cols-3 lg:grid-cols-[1fr_1fr_220px_auto] lg:items-end">
        <label className="relative block text-xs font-medium text-bgl-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {t('checkIn')}
          </span>
          {isBungalowCalendar ? (
            <button
              type="button"
              className="bgl-input mt-1.5 w-full text-left"
              onClick={() => {
                setOpenCalendar('checkIn');
                if (checkIn) {
                  const current = parseDate(checkIn);
                  if (current) setCalendarMonth(new Date(current.getFullYear(), current.getMonth(), 1));
                }
              }}
            >
              {checkIn || tCommon('datePlaceholder')}
            </button>
          ) : (
            <input
              ref={checkInRef}
              type="date"
              min={todayKeyStr}
              value={checkIn}
              onClick={() => openPicker(checkInRef)}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bgl-input mt-1.5"
            />
          )}
        </label>

        <label className="relative block text-xs font-medium text-bgl-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {t('checkOut')}
          </span>
          {isBungalowCalendar ? (
            <button
              type="button"
              className="bgl-input mt-1.5 w-full text-left"
              onClick={() => {
                setOpenCalendar('checkOut');
                if (checkOut) {
                  const current = parseDate(checkOut);
                  if (current) setCalendarMonth(new Date(current.getFullYear(), current.getMonth(), 1));
                } else if (checkIn) {
                  const current = parseDate(checkIn);
                  if (current) setCalendarMonth(new Date(current.getFullYear(), current.getMonth(), 1));
                }
              }}
            >
              {checkOut || tCommon('datePlaceholder')}
            </button>
          ) : (
            <input
              ref={checkOutRef}
              type="date"
              min={checkIn ? addOneDayToDateKey(checkIn) : todayKeyStr}
              value={checkOut}
              onClick={() => openPicker(checkOutRef)}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bgl-input mt-1.5"
            />
          )}
        </label>

        <label className="block text-xs font-medium text-bgl-muted">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {t('guests')}
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="bgl-input mt-1.5"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
              <option key={value} value={value}>
                {value} {t('person')}
              </option>
            ))}
          </select>
        </label>

        <div className="sticky bottom-3 z-20 md:static">
          <Link
            href={
              canContinue
                ? bungalowId
                  ? `/${locale}/reservation?bungalowId=${bungalowId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
                  : `/${locale}/search?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
                : '#'
            }
            aria-disabled={!canContinue}
            onClick={(e) => {
              if (!canContinue) e.preventDefault();
            }}
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold transition lg:w-auto ${
              canContinue
                ? 'bg-bgl-moss text-white hover:bg-bgl-mossDark'
                : 'cursor-not-allowed bg-bgl-moss/60 text-white'
            }`}
          >
            <Search className="h-4 w-4" />
            {bungalowId ? t('reserveNow') : t('searchButton')}
          </Link>
        </div>
      </div>

      {isBungalowCalendar && openCalendar ? (
        <div className="relative z-40 mt-3">
          <div className="absolute left-0 right-0 rounded-2xl border border-bgl-mist bg-white p-3 shadow-card md:max-w-[360px]">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-bgl-muted hover:bg-bgl-cream/70"
                onClick={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                  )
                }
              >
                ‹
              </button>
              <p className="text-sm font-semibold capitalize text-bgl-ink">{monthLabel}</p>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-bgl-muted hover:bg-bgl-cream/70"
                onClick={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                  )
                }
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 pb-1">
              {weekDays.map((label) => (
                <span key={label} className="text-center text-[11px] font-semibold text-bgl-muted">
                  {label}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const key = toDateKey(day);
                const inMonth = day.getMonth() === calendarMonth.getMonth();
                const checkInDate = parseDate(checkIn);
                const checkOutDate = parseDate(checkOut);

                if (!inMonth) {
                  return (
                    <span
                      key={`pad-${key}`}
                      className="flex h-9 items-center justify-center text-[11px] text-bgl-muted/35"
                      aria-hidden
                    >
                      {day.getDate()}
                    </span>
                  );
                }

                const isReserved = bungalowId ? unavailableDates.has(key) : false;
                const isBeforeToday = key < todayKeyStr;
                const isBlockedByRange =
                  openCalendar === 'checkOut'
                    ? Boolean(checkInDate && day <= checkInDate)
                    : Boolean(checkOutDate && day >= checkOutDate);
                const isDisabled = isBeforeToday || isReserved || isBlockedByRange;
                const isSelected =
                  (openCalendar === 'checkIn' && checkIn === key) ||
                  (openCalendar === 'checkOut' && checkOut === key);

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => selectDate(key)}
                    className={`h-9 rounded-lg text-xs transition ${
                      isSelected
                        ? 'bg-bgl-moss text-white'
                        : isReserved
                          ? 'cursor-not-allowed bg-rose-50 text-rose-400 line-through ring-1 ring-rose-100'
                          : isBeforeToday || isBlockedByRange
                            ? 'cursor-not-allowed bg-bgl-mist/30 text-bgl-muted/60'
                            : 'hover:bg-bgl-cream/70'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                className="text-xs font-semibold text-bgl-moss hover:text-bgl-mossDark"
                onClick={() => setOpenCalendar(null)}
              >
                {tCommon('close')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
