import { useCallback, useEffect, useState } from 'react';

import {
  apiService,
  type QueueAlert,
  type QueueAlertStatus,
} from '../api/apiService';


const filters: Array<QueueAlertStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'RESOLVED',
];


export default function TempleQueueAlerts() {
  const [alerts, setAlerts] = useState<QueueAlert[]>([]);
  const [filter, setFilter] = useState<QueueAlertStatus | 'ALL'>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.getTempleQueueAlerts(filter);
      setAlerts(response.items);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load temple queue alerts.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setIsLoading(true);
    void loadAlerts();

    const intervalId = window.setInterval(() => {
      void loadAlerts();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadAlerts]);

  const reviewAlert = async (
    alertId: number,
    nextStatus: 'APPROVED' | 'REJECTED' | 'RESOLVED',
  ) => {
    try {
      setReviewingId(alertId);
      setError(null);
      await apiService.reviewTempleQueueAlert(alertId, nextStatus);
      await loadAlerts();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update the queue alert.',
      );
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
            Human review queue
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Temple Queue Alerts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review the model explanation before approving an operational action.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            void loadAlerts();
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map(item => (
          <button
            type="button"
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              filter === item
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-5 text-sm text-slate-500">Loading queue alerts…</p>
      ) : alerts.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center">
          <p className="font-medium text-slate-700">No {filter.toLowerCase()} alerts</p>
          <p className="mt-1 text-sm text-slate-500">
            Run a moderate, high, or critical queue prediction to create one.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {alerts.map(alert => (
            <AlertCard
              key={alert.alert_id}
              alert={alert}
              isReviewing={reviewingId === alert.alert_id}
              onReview={status => void reviewAlert(alert.alert_id, status)}
            />
          ))}
        </div>
      )}
    </section>
  );
}


function AlertCard({
  alert,
  isReviewing,
  onReview,
}: {
  alert: QueueAlert;
  isReviewing: boolean;
  onReview: (status: 'APPROVED' | 'REJECTED' | 'RESOLVED') => void;
}) {
  const levelStyle = {
    MODERATE: 'border-amber-300 bg-amber-100 text-amber-800',
    HIGH: 'border-orange-300 bg-orange-100 text-orange-800',
    CRITICAL: 'border-red-300 bg-red-100 text-red-800',
  }[alert.alert_level];

  const statusStyle: Record<QueueAlertStatus, string> = {
    PENDING: 'bg-slate-100 text-slate-700',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800',
    RESOLVED: 'bg-blue-100 text-blue-800',
  };

  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">
            Alert #{alert.alert_id} · {alert.zone_id}
          </p>
          <h3 className="mt-1 font-bold text-slate-900">{alert.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
        </div>
        <div className="flex gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${levelStyle}`}>
            {alert.alert_level}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[alert.status]}`}>
            {alert.status}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-bold uppercase text-slate-500">Why?</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{alert.explanation}</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs font-bold uppercase text-orange-700">Recommended action</p>
          <p className="mt-1 text-sm leading-6 text-orange-900">{alert.recommended_action}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        {alert.predicted_wait_minutes !== undefined && (
          <span>Predicted wait: {alert.predicted_wait_minutes} min</span>
        )}
        {alert.waiting_people !== undefined && (
          <span>Waiting people: {alert.waiting_people.toLocaleString()}</span>
        )}
        {alert.gates_open !== undefined && <span>Open gates: {alert.gates_open}</span>}
      </div>

      {alert.status === 'PENDING' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={isReviewing} onClick={() => onReview('APPROVED')}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {isReviewing ? 'Saving…' : 'Approve Action'}
          </button>
          <button type="button" disabled={isReviewing} onClick={() => onReview('REJECTED')}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
            Reject
          </button>
        </div>
      )}

      {alert.status === 'APPROVED' && (
        <button type="button" disabled={isReviewing} onClick={() => onReview('RESOLVED')}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {isReviewing ? 'Saving…' : 'Mark Resolved'}
        </button>
      )}

      {alert.reviewed_by && (
        <p className="mt-3 text-xs text-slate-500">
          Reviewed by {alert.reviewed_by}
          {alert.reviewed_at ? ` · ${new Date(alert.reviewed_at).toLocaleString()}` : ''}
        </p>
      )}
    </article>
  );
}
