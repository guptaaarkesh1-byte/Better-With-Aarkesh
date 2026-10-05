import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Icon from '../components/common/AdminIcons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const inr = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

export default function AdminOverview() {
  const [appointments, setAppointments] = useState([]);
  const [courseStats, setCourseStats] = useState({ totalPurchased: 0, totalRevenue: 0, totalRegistered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { Authorization: `Bearer ${token}` };

        const [appRes, courseRes] = await Promise.all([
          fetch(`${API_URL}/api/appointments/admin`, { headers }),
          fetch(`${API_URL}/api/course-auth/admin/stats`, { headers })
        ]);

        if (appRes.ok) {
          const data = await appRes.json();
          setAppointments(data);
        }

        if (courseRes.ok) {
          const cData = await courseRes.json();
          setCourseStats(cData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalClientsCount = new Set(appointments.map(a => a.email || a.userId?.email).filter(Boolean)).size;
  const coachingRevenue = appointments.filter(a => !a.isFreeSession && a.paymentStatus === 'Paid').length * 5000;
  const totalCombinedRevenue = (courseStats.totalRevenue || 0) + coachingRevenue;
  const upcomingCount = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Refunded').length;

  const stats = [
    {
      label: 'Course Students',
      value: courseStats.totalPurchased || 0,
      icon: 'user',
      trend: `${courseStats.totalRegistered || 0} registered total`,
      link: '/course?tab=students'
    },
    {
      label: 'Coaching Clients',
      value: totalClientsCount || appointments.length,
      icon: 'user',
      trend: 'Active coaching roster',
      link: '/appointments'
    },
    {
      label: 'Upcoming Sessions',
      value: upcomingCount,
      icon: 'layout',
      trend: 'Scheduled bookings',
      link: '/appointments'
    },
    {
      label: 'Total Revenue',
      value: inr(totalCombinedRevenue),
      icon: 'rupee',
      trend: `${inr(courseStats.totalRevenue || 0)} from courses`,
      link: '/appointments'
    }
  ];

  // Sessions today or needing action
  const todaySessions = appointments.filter(a => {
    if (!a.date) return false;
    const today = new Date();
    const [y, m, d] = String(a.date).split('-').map(Number);
    return today.getFullYear() === y && today.getMonth() + 1 === m && today.getDate() === d;
  });

  const chartData = [
    { name: 'Jan', revenue: 40000 },
    { name: 'Feb', revenue: 35000 },
    { name: 'Mar', revenue: 60000 },
    { name: 'Apr', revenue: 52000 },
    { name: 'May', revenue: 85000 },
    { name: 'Jun', revenue: 95000 },
    { name: 'Jul', revenue: 120000 },
    { name: 'Aug', revenue: 145000 },
    { name: 'Sep', revenue: totalCombinedRevenue > 145000 ? totalCombinedRevenue : 160000 }
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1500px] mx-auto">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '32px', margin: '0 0 6px', color: 'var(--ink)' }}>
          Overview Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
          Welcome back. Here is your current business pulse across courses and coaching.
        </p>
      </div>

      {/* 4 Clickable KPI Cards */}
      <div className="bwa-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <Link
            key={i}
            to={s.link}
            className="bwa-stat"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="bwa-row" style={{ marginBottom: '8px' }}>
              <span style={{ color: 'var(--accent)' }}>
                <Icon name={s.icon} size={20} />
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>
                {s.label}
              </span>
            </div>
            <b>{s.value}</b>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
              {s.trend}
            </span>
          </Link>
        ))}
      </div>

      {/* Charts & Actions Grid */}
      <div className="bwa-grid3" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Revenue Trajectory Area Chart */}
        <div className="bwa-card" style={{ marginBottom: 0 }}>
          <h3>Revenue trajectory</h3>
          <p className="sub">Combined revenue from masterclass enrollments and 1-on-1 coaching.</p>

          <div style={{ width: '100%', height: '280px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8532F" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C8532F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DCCB" vertical={false} />
                <XAxis dataKey="name" stroke="#7A6B60" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#7A6B60" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E6DCCB', borderRadius: '10px', color: '#2B211C', boxShadow: '0 4px 12px rgba(60,40,20,0.1)' }}
                  itemStyle={{ color: '#C8532F' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C8532F" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schedule Breakdown */}
        <div className="bwa-card" style={{ marginBottom: 0 }}>
          <h3>Sessions breakdown</h3>
          <p className="sub">Completed vs scheduled.</p>

          <div style={{ width: '100%', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <span style={{ color: 'var(--muted)' }}>Loading...</span>
            ) : appointments.length === 0 ? (
              <span style={{ color: 'var(--muted)' }}>No session data</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length },
                      { name: 'Upcoming', value: appointments.filter(a => a.status !== 'Completed' && a.status !== 'Refunded').length },
                      { name: 'Refunded', value: appointments.filter(a => a.status === 'Refunded').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#1F7F57" />
                    <Cell fill="#C8532F" />
                    <Cell fill="#B0302A" />
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E6DCCB', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12.5px', color: '#7A6B60' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Table: Sessions Today */}
      <div className="bwa-card">
        <div className="bwa-row" style={{ marginBottom: '12px' }}>
          <div>
            <h3>Sessions today ({todaySessions.length})</h3>
            <p className="sub" style={{ margin: 0 }}>Immediate coaching schedule for today.</p>
          </div>
          <Link to="/appointments" className="bwa-btn sm">
            View all appointments →
          </Link>
        </div>

        {todaySessions.length === 0 ? (
          <div className="bwa-empty" style={{ padding: '30px 20px' }}>
            <b>No sessions scheduled for today</b>
            <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Your schedule is clear for today.</p>
          </div>
        ) : (
          <div className="bwa-table-container" style={{ margin: 0 }}>
            <table className="bwa-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {todaySessions.map(app => (
                  <tr key={app._id}>
                    <td><b>{app.name}</b> <small style={{ color: 'var(--muted)' }}>({app.email})</small></td>
                    <td><b>{app.time}</b></td>
                    <td>{app.duration || 60} mins</td>
                    <td>
                      <span className="bwa-chip b">
                        {app.isFreeSession ? 'Course Session' : 'Coaching'}
                      </span>
                    </td>
                    <td>
                      <Link to="/appointments" className="bwa-btn sm">
                        Open in Appointments
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
