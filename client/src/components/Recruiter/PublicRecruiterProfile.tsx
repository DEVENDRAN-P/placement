import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { recruiterAPI } from '../../services/api';
import { Search, ChevronRight, GraduationCap } from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';

interface StudentRecord {
  _id: string;
  academicInfo?: {
    cgpa?: number;
    department?: string;
    year?: number;
  };
  user?: {
    email?: string;
    profile?: { firstName?: string; lastName?: string };
  };
  college?: { name?: string };
  skills?: Array<{ name: string }>;
}

const PublicRecruiterProfile: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res: any = await recruiterAPI.searchStudents({
          limit: 48,
          page: 1,
        });
        if (cancelled) return;
        if (res?.success && Array.isArray(res.data?.students)) {
          setStudents(res.data.students);
        } else {
          setStudents([]);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(
            typeof e === 'string'
              ? e
              : e?.message || 'Unable to load candidates from the database.',
          );
          setStudents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const fn = s.user?.profile?.firstName || '';
      const ln = s.user?.profile?.lastName || '';
      const email = s.user?.email || '';
      const dept = s.academicInfo?.department || '';
      const skills = (s.skills || []).map((x) => x.name).join(' ');
      const blob = `${fn} ${ln} ${email} ${dept} ${skills}`.toLowerCase();
      return blob.includes(q);
    });
  }, [students, query]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title="Candidate directory"
          description="Live student profiles from MongoDB. Open a record to view the full public profile."
        />

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search by name, email, department, or skill…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <p className="text-sm text-slate-600">
            Showing{' '}
            <span className="font-medium text-slate-900">{filtered.length}</span>{' '}
            of{' '}
            <span className="font-medium text-slate-900">{students.length}</span>
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-slate-600">Loading candidates…</p>
        ) : filtered.length === 0 ? (
          <Card className="mt-10" padding="lg">
            <p className="text-sm text-slate-600">
              No student profiles match your filters yet. Add students through
              registration or adjust search.
            </p>
          </Card>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const fn = s.user?.profile?.firstName || '';
              const ln = s.user?.profile?.lastName || '';
              const name = `${fn} ${ln}`.trim() || 'Unnamed';
              const cgpa = s.academicInfo?.cgpa;
              return (
                <li key={s._id}>
                  <Card padding="md" className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-base font-medium text-slate-900">
                          {name}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {s.user?.email || '—'}
                        </p>
                      </div>
                      <GraduationCap
                        className="h-5 w-5 shrink-0 text-slate-400"
                        aria-hidden
                      />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <dt className="text-slate-500">CGPA</dt>
                        <dd className="font-medium text-slate-900">
                          {cgpa != null ? Number(cgpa).toFixed(2) : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Department</dt>
                        <dd className="font-medium text-slate-900">
                          {s.academicInfo?.department || '—'}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-slate-500">College</dt>
                        <dd className="font-medium text-slate-900">
                          {s.college?.name || '—'}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {(s.skills || []).slice(0, 4).map((sk) => (
                        <span
                          key={sk.name}
                          className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                        >
                          {sk.name}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/students/public/${s._id}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900 hover:text-slate-700"
                    >
                      View profile
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PublicRecruiterProfile;
