import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role) {
    const roleRoutes: { [key: string]: string } = {
      student: '/student',
      college: '/college',
      recruiter: '/recruiter',
      admin: '/admin',
    };
    const destination = roleRoutes[user.role];
    if (destination) {
      return <Navigate to={destination} replace />;
    }
  }

  const links: Array<{ to: string; title: string; body: string }> = [];

  if (!isAuthenticated) {
    links.push(
      {
        to: '/login',
        title: 'Sign in',
        body: 'Access your placement workspace with your institutional account.',
      },
      {
        to: '/register',
        title: 'Create account',
        body: 'Register as a student, college, or recruiter.',
      },
    );
  } else if (user?.role === 'student') {
    links.push(
      {
        to: '/student',
        title: 'Student home',
        body: 'Readiness, applications, and coding metrics from the database.',
      },
      {
        to: '/student/profile',
        title: 'Profile',
        body: 'Academics, skills, projects, and platform handles.',
      },
    );
  } else if (user?.role === 'college') {
    links.push({
      to: '/college',
      title: 'College console',
      body: 'Placement analytics and student records.',
    });
  } else if (user?.role === 'recruiter') {
    links.push(
      {
        to: '/recruiter',
        title: 'Recruiter home',
        body: 'Postings, pipeline, and hiring metrics.',
      },
      {
        to: '/recruiter/jobs',
        title: 'Jobs',
        body: 'Create and manage open roles.',
      },
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          title="Career Intelligence Portal"
          description="Role-based placement workflows backed by MongoDB and secured JWT sessions."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {links.map((item) => (
            <Link key={item.to} to={item.to} className="group block">
              <Card
                padding="md"
                className="h-full transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{item.body}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-slate-700" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          <Link to="/contact" className="underline hover:text-slate-700">
            Contact
          </Link>
          <span className="mx-2">·</span>
          <Link to="/status" className="underline hover:text-slate-700">
            Status
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
