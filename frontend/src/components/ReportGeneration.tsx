import React, { useState } from 'react';
import { FileText, Download, Eye, Share2, Clock } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'incident' | 'resource' | 'financial' | 'volunteer';
  generatedAt: string;
  author: string;
  status: 'draft' | 'published';
  pages: number;
}

const ReportGeneration: React.FC = () => {
  const [reports] = useState<Report[]>([
    {
      id: 'rpt-001',
      title: 'Daily Incident Summary - Dec 8',
      type: 'incident',
      generatedAt: '2025-12-08 09:30 UTC',
      author: 'Emergency Desk',
      status: 'published',
      pages: 12,
    },
    {
      id: 'rpt-002',
      title: 'Resource Allocation Report Q4 2025',
      type: 'resource',
      generatedAt: '2025-12-07 14:15 UTC',
      author: 'Resource Manager',
      status: 'published',
      pages: 8,
    },
    {
      id: 'rpt-003',
      title: 'Financial Reconciliation Nov 2025',
      type: 'financial',
      generatedAt: '2025-12-01 10:45 UTC',
      author: 'Finance Team',
      status: 'published',
      pages: 15,
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'incident': return 'bg-red-100 text-red-800';
      case 'resource': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'volunteer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="text-orange-600" />
        Report Generation & Download
      </h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Incident Reports</p>
          <p className="text-3xl font-bold text-red-700">24</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Resource Reports</p>
          <p className="text-3xl font-bold text-blue-700">18</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Financial Reports</p>
          <p className="text-3xl font-bold text-green-700">12</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Volunteer Reports</p>
          <p className="text-3xl font-bold text-purple-700">8</p>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow p-4 border border-orange-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-orange-600" size={18} />
                  <h3 className="text-lg font-semibold">{report.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getTypeColor(report.type)}`}>
                    {report.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">By {report.author}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Clock size={14} /> {report.generatedAt}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{report.pages} pages</p>
                <span className={`px-2 py-1 text-xs font-bold rounded mt-1 ${
                  report.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium">
                <Eye size={16} /> View
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center gap-2 text-sm font-medium">
                <Download size={16} /> Download PDF
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportGeneration;
