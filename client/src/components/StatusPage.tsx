import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Server } from 'lucide-react';

interface ServiceStatus {
  service: string;
  status: 'up' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

const StatusPage: React.FC = () => {
  const [services] = useState<ServiceStatus[]>([
    {
      service: 'Frontend Server',
      status: 'up',
      uptime: 99.98,
      responseTime: 120,
      lastChecked: new Date().toISOString(),
    },
    {
      service: 'Backend API',
      status: 'up',
      uptime: 99.95,
      responseTime: 250,
      lastChecked: new Date().toISOString(),
    },
    {
      service: 'MongoDB Database',
      status: 'up',
      uptime: 99.99,
      responseTime: 50,
      lastChecked: new Date().toISOString(),
    },
    {
      service: 'LeetCode Integration',
      status: 'up',
      uptime: 98.5,
      responseTime: 800,
      lastChecked: new Date().toISOString(),
    },
    {
      service: 'CodeChef Integration',
      status: 'up',
      uptime: 98.2,
      responseTime: 1200,
      lastChecked: new Date().toISOString(),
    },
    {
      service: 'Codeforces Integration',
      status: 'up',
      uptime: 99.1,
      responseTime: 600,
      lastChecked: new Date().toISOString(),
    },
  ]);

  const [incidents] = useState([
    {
      id: 1,
      title: 'Scheduled Maintenance',
      description: 'Database maintenance completed successfully',
      status: 'resolved',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: 'API Response Time High',
      description: 'Brief spike in API response times resolved',
      status: 'resolved',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const overallStatus = services.every(s => s.status === 'up') ? 'operational' : 'degraded';
  const averageUptime = (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'down':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'down':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">System Status</h1>
          <p className="text-slate-600">Real-time monitoring of Career Intelligence Portal services</p>
        </div>

        {/* Overall Status */}
        <div className={`bg-white rounded-lg shadow-md p-8 mb-8 border-l-4 ${
          overallStatus === 'operational' ? 'border-green-500' : 'border-yellow-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {overallStatus === 'operational' ? '✓ All Systems Operational' : '⚠ Some Services Degraded'}
              </h2>
              <p className="text-slate-600">Average Uptime: {averageUptime}%</p>
            </div>
            <Server className={`w-12 h-12 ${overallStatus === 'operational' ? 'text-green-600' : 'text-yellow-600'}`} />
          </div>
        </div>

        {/* Service Status */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Service Status</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service, idx) => (
              <div key={idx} className={`border rounded-lg p-4 flex justify-between items-start ${getStatusColor(service.status)}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(service.status)}
                    <h4 className="font-semibold text-slate-900">{service.service}</h4>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Uptime: {service.uptime}%</p>
                    <p>Response Time: {service.responseTime}ms</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Recent Incidents</h3>
          {incidents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-slate-600">No recent incidents reported</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900">{incident.title}</h4>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-2">{incident.description}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(incident.date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Response Time Chart */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Response Times</h3>
          <div className="space-y-4">
            {services.map((service, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <p className="font-semibold text-slate-900">{service.service}</p>
                  <p className="text-sm text-slate-600">{service.responseTime}ms</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      service.responseTime < 500
                        ? 'bg-green-500'
                        : service.responseTime < 1000
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((service.responseTime / 1500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-2">Page refreshes every 60 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
