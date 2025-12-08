import React, { useState } from 'react';
import { Zap, TrendingUp, Activity } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'good' | 'warning' | 'critical';
}

const PerformanceMonitor: React.FC = () => {
  const [metrics] = useState<PerformanceMetric[]>([
    { name: 'Response Time', value: 2.3, unit: 'seconds', target: 3, status: 'good' },
    { name: 'System Uptime', value: 99.97, unit: '%', target: 99.5, status: 'good' },
    { name: 'Request Load', value: 67, unit: '%', target: 80, status: 'good' },
    { name: 'Active Users', value: 1240, unit: 'users', target: 5000, status: 'warning' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-50';
      case 'warning': return 'bg-yellow-50';
      case 'critical': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Zap className="text-yellow-600" />
        System Performance
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, idx) => {
          const percentage = (metric.value / metric.target) * 100;
          return (
            <div key={idx} className={`rounded-lg shadow p-6 space-y-3 ${getStatusBg(metric.status)}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{metric.name}</h3>
                <Activity className={getStatusColor(metric.status)} size={20} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-bold">
                    {metric.value}
                    <span className="text-sm text-gray-600 ml-1">{metric.unit}</span>
                  </span>
                  <span className="text-sm text-gray-600">Target: {metric.target}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      metric.status === 'good'
                        ? 'bg-green-600'
                        : metric.status === 'warning'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="text-green-600" />
          Performance Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Response</p>
            <p className="text-2xl font-bold">2.1s</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Uptime</p>
            <p className="text-2xl font-bold">99.97%</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Health Score</p>
            <p className="text-2xl font-bold">A+</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
