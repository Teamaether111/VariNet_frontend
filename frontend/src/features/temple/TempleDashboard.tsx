import TempleQueuePrediction from '../../components/TempleQueuePrediction';
import TempleQueueAlerts from '../../components/TempleQueueAlerts';


const templeMetrics = [
  {
    label: 'Active Gates',
    value: '4',
    description: 'All public-entry gates operational',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  {
    label: 'Current Throughput',
    value: '1,240/hr',
    description: 'Estimated pilgrim darshan throughput',
    color: 'border-blue-200 bg-blue-50 text-blue-900',
  },
  {
    label: 'Queue Holding Areas',
    value: '3',
    description: 'Two active and one available',
    color: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  {
    label: 'Temple Status',
    value: 'OPEN',
    description: 'Normal darshan operations',
    color: 'border-orange-200 bg-orange-50 text-orange-900',
  },
];


export function TempleDashboard() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-600 to-amber-500 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">
            VARI-Net Temple Operations
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Vitthal-Rukmini Temple Command Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-orange-50 sm:text-base">
            Monitor predicted waiting time, queue pressure, gate throughput
            and recommended crowd-management actions.
          </p>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {templeMetrics.map(metric => (
            <article key={metric.label}
              className={`rounded-xl border p-4 shadow-sm ${metric.color}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-bold">{metric.value}</p>
              <p className="mt-1 text-xs opacity-75">{metric.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-6">
          <TempleQueuePrediction />
        </section>

        <section className="mt-6">
          <TempleQueueAlerts />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-blue-600">
              Gate operations
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Entry Gate Status
            </h2>
            <div className="mt-4 space-y-3">
              <GateStatus name="Main Darshan Gate" status="OPEN" detail="520 pilgrims/hour" />
              <GateStatus name="Namdev Gate" status="OPEN" detail="340 pilgrims/hour" />
              <GateStatus name="East Approach Gate" status="MONITORING" detail="230 pilgrims/hour" />
              <GateStatus name="Emergency Gate" status="RESERVED" detail="Emergency access only" />
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-orange-600">
              Human-in-the-loop operations
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Queue Management Principle
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              VARI-Net predicts queue pressure and recommends actions.
              Temple authorities and police remain responsible for approving
              gate changes, diversions and operational interventions.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}


function GateStatus({
  name,
  status,
  detail,
}: {
  name: string;
  status: 'OPEN' | 'MONITORING' | 'RESERVED';
  detail: string;
}) {
  const styles = {
    OPEN: 'border-emerald-300 bg-emerald-100 text-emerald-800',
    MONITORING: 'border-amber-300 bg-amber-100 text-amber-800',
    RESERVED: 'border-slate-300 bg-slate-100 text-slate-700',
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">{name}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </div>
      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {status}
      </span>
    </div>
  );
}


export default TempleDashboard;
