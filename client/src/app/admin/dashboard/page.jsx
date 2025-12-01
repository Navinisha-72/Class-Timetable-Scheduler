'use client';

import { Users, GraduationCap, Calendar, CheckCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function AdminDashboard() {
  // StatBlock Component
  const StatBlock = ({ title, value, icon: Icon, description, trend }) => {
    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-500',
    };

    return (
      <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
            {description && (
              <p
                className={`text-sm mt-2 ${
                  trend ? trendColors[trend] : 'text-gray-600'
                }`}
              >
                {description}
              </p>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of the scheduling system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatBlock
            title="Total Faculties"
            value="42"
            icon={Users}
            description="+3 this month"
            trend="up"
          />
          <StatBlock
            title="Total Students"
            value="856"
            icon={GraduationCap}
            description="+28 this month"
            trend="up"
          />
          <StatBlock
            title="Timetables Generated"
            value="18"
            icon={Calendar}
            description="Current semester"
          />
          <StatBlock
            title="Active Classes"
            value="24"
            icon={CheckCircle}
            description="Across all departments"
          />
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                {
                  action: 'Timetable generated',
                  class: 'B.Tech CSE - Section A',
                  time: '2 hours ago',
                },
                {
                  action: 'New faculty added',
                  class: 'Dr. Sarah Johnson',
                  time: '5 hours ago',
                },
                {
                  action: 'Student enrolled',
                  class: 'Jane Smith - B.Tech ECE',
                  time: '1 day ago',
                },
                {
                  action: 'Timetable updated',
                  class: 'B.Tech ME - Section B',
                  time: '2 days ago',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">{activity.class}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Distribution */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Department Distribution
            </h3>
            <div className="space-y-4">
              {[
                { dept: 'Computer Science', count: 245, color: 'bg-blue-500' },
                { dept: 'Electronics', count: 198, color: 'bg-green-500' },
                { dept: 'Mechanical', count: 176, color: 'bg-orange-500' },
                { dept: 'Civil', count: 154, color: 'bg-purple-500' },
                { dept: 'Others', count: 83, color: 'bg-gray-400' },
              ].map((dept) => (
                <div key={dept.dept}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">
                      {dept.dept}
                    </span>
                    <span className="text-gray-600">
                      {dept.count} students
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${dept.color} h-2 rounded-full transition-all`}
                      style={{ width: `${(dept.count / 856) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}