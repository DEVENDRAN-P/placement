import React, { useCallback, useEffect, useState } from 'react';
import { aiAPI } from '../../services/api';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { RefreshCw } from 'lucide-react';

interface Factor {
  factor: string;
  impact: string;
  score: number;
}

interface PredictionPayload {
  placementProbability?: number;
  placementScore?: number;
  confidence?: string;
  factors?: Factor[];
  recommendations?: string[];
  suggestedRoles?: string[];
  message?: string;
}

const CareerPrediction: React.FC = () => {
  const [data, setData] = useState<PredictionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh: boolean) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      const res: any = await aiAPI.predictCareer();
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        setError(res?.message || 'No prediction data returned.');
        setData(null);
      }
    } catch (e: any) {
      setError(
        typeof e === 'string'
          ? e
          : e?.message || 'Could not load career prediction from the server.',
      );
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const pct = Math.round(
    data?.placementProbability ?? data?.placementScore ?? 0,
  );
  const confidenceLabel =
    data?.confidence === 'medium'
      ? 'Medium'
      : data?.confidence === 'low'
        ? 'Low'
        : data?.confidence === 'high'
          ? 'High'
          : data?.confidence
            ? String(data.confidence)
            : '—';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title="Placement outlook"
          description="Scores and recommendations are computed from your MongoDB student profile and anonymized placement history."
          actions={
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                aria-hidden
              />
              Refresh analysis
            </button>
          }
        />

        {error && (
          <div className="mt-8 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-slate-600">Loading analysis…</p>
        ) : data ? (
          <div className="mt-10 space-y-8">
            {data.message && (
              <p className="text-sm text-slate-600">{data.message}</p>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2" padding="lg">
                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  Estimated placement probability
                </h2>
                <div className="mt-4 flex flex-wrap items-end gap-6">
                  <span className="text-5xl font-semibold tabular-nums text-slate-900">
                    {pct}%
                  </span>
                  <div className="min-w-[200px] flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-800 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Confidence: {confidenceLabel}
                    </p>
                  </div>
                </div>
              </Card>

              <Card padding="lg">
                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  Role fit
                </h2>
                <ul className="mt-4 space-y-2">
                  {(data.suggestedRoles || []).map((role) => (
                    <li
                      key={role}
                      className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800"
                    >
                      {role}
                    </li>
                  ))}
                  {(!data.suggestedRoles || data.suggestedRoles.length === 0) && (
                    <li className="text-sm text-slate-500">No roles suggested.</li>
                  )}
                </ul>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card padding="lg">
                <h2 className="text-base font-semibold text-slate-900">
                  Profile signals
                </h2>
                <ul className="mt-4 divide-y divide-slate-100">
                  {(data.factors || []).map((f) => (
                    <li
                      key={f.factor}
                      className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0"
                    >
                      <span className="text-slate-700">{f.factor}</span>
                      <span className="tabular-nums font-medium text-slate-900">
                        {f.score}
                        <span className="ml-2 text-xs font-normal capitalize text-slate-500">
                          ({f.impact})
                        </span>
                      </span>
                    </li>
                  ))}
                  {(!data.factors || data.factors.length === 0) && (
                    <li className="py-4 text-sm text-slate-500">
                      Complete your academic and coding profile for richer
                      signals.
                    </li>
                  )}
                </ul>
              </Card>

              <Card padding="lg">
                <h2 className="text-base font-semibold text-slate-900">
                  Recommended actions
                </h2>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-700">
                  {(data.recommendations || []).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                  {(!data.recommendations ||
                    data.recommendations.length === 0) && (
                    <li className="list-none pl-0 text-slate-500">
                      No recommendations yet.
                    </li>
                  )}
                </ol>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CareerPrediction;
