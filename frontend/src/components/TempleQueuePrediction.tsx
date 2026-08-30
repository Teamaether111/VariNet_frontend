import { useState, type ReactNode } from 'react';

import { apiService } from '../api/apiService';
import type {
  TempleQueuePredictionInput,
  TempleQueuePredictionResult,
} from '../types';


const initialInput: TempleQueuePredictionInput = {
  date: new Date().toISOString().slice(0, 10),
  hour: new Date().getHours(),
  waiting_people: 850,
  gates_open: 4,
  crowd_count: 2200,
  crowd_density: 3.8,
  zone_id: 'Z011',
  location: 'Pandharpur',
  route_type: 'Main',
  darshan_status: 'OPEN',
  is_peak_day: false,
};

type PredictionView = TempleQueuePredictionResult & {
  explanation?: string | null;
  recommended_action?: string | null;
};


export function TempleQueuePrediction() {
  const [input, setInput] =
    useState<TempleQueuePredictionInput>(initialInput);
  const [result, setResult] = useState<PredictionView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setNumber = (
    field: keyof TempleQueuePredictionInput,
    value: string,
  ) => {
    setInput(current => ({
      ...current,
      [field]: Number(value),
    }));
  };

  const predict = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(await apiService.predictTempleQueue(input));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to predict the temple queue.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle: Record<string, string> = {
    LOW: 'border-emerald-300 bg-emerald-100 text-emerald-800',
    MODERATE: 'border-amber-300 bg-amber-100 text-amber-800',
    HIGH: 'border-orange-300 bg-orange-100 text-orange-800',
    CRITICAL: 'border-red-300 bg-red-100 text-red-800',
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          AI queue prediction
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">
          Temple Queue Prediction
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter the current operational readings and run the trained model.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Date">
          <input
            type="date"
            value={input.date}
            onChange={event =>
              setInput(current => ({
                ...current,
                date: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-300 p-2"
          />
        </Field>

        <NumberField label="Hour" value={input.hour} min={0} max={23}
          onChange={value => setNumber('hour', value)} />
        <NumberField label="Waiting people" value={input.waiting_people} min={0}
          onChange={value => setNumber('waiting_people', value)} />
        <NumberField label="Gates open" value={input.gates_open} min={1}
          onChange={value => setNumber('gates_open', value)} />
        <NumberField label="Crowd count" value={input.crowd_count} min={0}
          onChange={value => setNumber('crowd_count', value)} />
        <NumberField label="Crowd density" value={input.crowd_density} min={0} step={0.1}
          onChange={value => setNumber('crowd_density', value)} />

        <Field label="Zone ID">
          <input value={input.zone_id}
            onChange={event => setInput(current => ({ ...current, zone_id: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 p-2" />
        </Field>
        <Field label="Location">
          <input value={input.location}
            onChange={event => setInput(current => ({ ...current, location: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 p-2" />
        </Field>
        <Field label="Route type">
          <input value={input.route_type}
            onChange={event => setInput(current => ({ ...current, route_type: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 p-2" />
        </Field>
        <Field label="Darshan status">
          <select value={input.darshan_status}
            onChange={event => setInput(current => ({ ...current, darshan_status: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 p-2">
            <option value="OPEN">OPEN</option>
            <option value="RESTRICTED">RESTRICTED</option>
            <option value="PAUSED">PAUSED</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={input.is_peak_day}
            onChange={event => setInput(current => ({ ...current, is_peak_day: event.target.checked }))} />
          Peak day
        </label>
      </div>

      <button type="button" onClick={() => void predict()} disabled={isLoading}
        className="mt-5 rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
        {isLoading ? 'Predicting…' : 'Predict Queue Wait Time'}
      </button>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {result && (
        <div className="mt-5 rounded-xl bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Predicted wait</p>
              <p className="text-3xl font-bold text-slate-900">
                {result.predicted_wait_minutes} minutes
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${labelStyle[result.predicted_wait_label] ?? labelStyle.LOW}`}>
              {result.predicted_wait_label}
            </span>
          </div>

          {result.recommended_action && (
            <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="text-xs font-semibold uppercase text-orange-700">Recommended action</p>
              <p className="mt-1 text-sm text-orange-900">{result.recommended_action}</p>
              {result.explanation && <p className="mt-2 text-xs text-orange-800">Why: {result.explanation}</p>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}


function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}


function NumberField({
  label, value, onChange, min, max, step,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <input type="number" value={value} min={min} max={max} step={step}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 p-2" />
    </Field>
  );
}


export default TempleQueuePrediction;
