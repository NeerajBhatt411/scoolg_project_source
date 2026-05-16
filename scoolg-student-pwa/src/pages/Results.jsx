import React from 'react';
import { motion } from 'framer-motion';

const Results = () => {
  return (
    <div className="min-h-full">
      {/* MOBILE VIEW - FROM raw_design/results_screen */}
      <div className="lg:hidden px-container-margin pt-6 pb-32 space-y-stack-gap">
        <div className="space-y-4">
          <h2 className="text-display-lg font-display-lg text-on-surface">Academic Results</h2>
          <div className="flex p-1 bg-surface-container rounded-xl">
            <button className="flex-1 py-2.5 text-label-md font-label-md rounded-lg bg-primary-container text-on-primary-container shadow-sm">
              Mid-term
            </button>
            <button className="flex-1 py-2.5 text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
              Final
            </button>
          </div>
        </div>

        {/* Grade Summary Bento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 bg-primary text-on-primary p-card-internal-padding rounded-3xl shadow-lg flex flex-col justify-between aspect-square">
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md opacity-80 uppercase tracking-wider">Average Score</span>
              <span className="material-symbols-outlined opacity-80">analytics</span>
            </div>
            <div className="space-y-1">
              <span className="text-[42px] font-bold leading-none">88.4%</span>
              <p className="text-label-md font-label-md opacity-90 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                +2.4%
              </p>
            </div>
          </div>
          <div className="col-span-1 bg-white p-card-internal-padding rounded-3xl shadow-sm flex flex-col justify-between aspect-square border border-outline-variant/30">
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-secondary opacity-80 uppercase tracking-wider">Class Rank</span>
              <span className="material-symbols-outlined text-secondary">emoji_events</span>
            </div>
            <div className="space-y-1">
              <span className="text-[42px] font-bold text-on-surface leading-none">04<span className="text-title-lg font-medium opacity-40">/42</span></span>
              <p className="text-label-md font-label-md text-secondary">Top 10%</p>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-outline-variant/20">
          <div className="px-card-internal-padding py-4 border-b border-surface-container-high flex justify-between items-center">
            <h3 className="text-title-lg font-title-lg text-on-surface">Subject Wise</h3>
            <button className="text-primary text-label-md font-label-md flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[18px]">download</span>
              PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50">
                <tr>
                  <th className="px-4 py-3 text-label-md text-secondary uppercase">Subject</th>
                  <th className="px-4 py-3 text-label-md text-secondary uppercase text-center">Marks</th>
                  <th className="px-4 py-3 text-label-md text-secondary uppercase text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                <ResultRow icon="functions" subject="Mathematics" code="MA-402" marks="94" grade="A+" iconBg="bg-tertiary-container/10" iconColor="text-tertiary" />
                <ResultRow icon="biotech" subject="Quantum Physics" code="PH-210" marks="86" grade="A" iconBg="bg-primary-container/10" iconColor="text-primary" />
                <ResultRow icon="terminal" subject="Data Structures" code="CS-105" marks="89" grade="A" iconBg="bg-secondary-container/20" iconColor="text-on-secondary-container" />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW - Polished Table Design */}
      <div className="hidden lg:block p-8 space-y-stack-gap max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-display-lg font-display-lg text-on-surface">Academic Results</h2>
            <p className="text-body-lg text-secondary">Term 1 • Fall Semester 2023</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-high rounded-xl font-label-md hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined">file_download</span>
              Download Report Card
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md shadow-soft hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined">share</span>
              Share with Parents
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <DesktopStatCard title="GPA Score" value="3.8 / 4.0" subValue="+0.2 from mid-term" icon="auto_graph" color="bg-primary" />
          <DesktopStatCard title="Credits Earned" value="24" subValue="Target: 30 credits" icon="token" color="bg-tertiary" />
          <DesktopStatCard title="Performance" value="Excellent" subValue="Ranked #4 in Grade 11-A" icon="military_tech" color="bg-secondary" />
        </div>

        <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-surface-container">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-6 text-label-md text-secondary uppercase tracking-widest font-bold">Subject Details</th>
                <th className="px-8 py-6 text-label-md text-secondary uppercase tracking-widest font-bold text-center">Marks Obtained</th>
                <th className="px-8 py-6 text-label-md text-secondary uppercase tracking-widest font-bold text-center">Class Average</th>
                <th className="px-8 py-6 text-label-md text-secondary uppercase tracking-widest font-bold text-right">Final Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              <DesktopResultRow subject="Advanced Mathematics" code="MA-402" marks="94" average="82" grade="A+" />
              <DesktopResultRow subject="Quantum Physics" code="PH-210" marks="86" average="78" grade="A" />
              <DesktopResultRow subject="Data Structures" code="CS-105" marks="89" average="85" grade="A" />
              <DesktopResultRow subject="Modern World History" code="HS-301" marks="78" average="72" grade="B+" />
              <DesktopResultRow subject="English Literature" code="EN-202" marks="92" average="80" grade="A+" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ResultRow = ({ icon, subject, code, marks, grade, iconBg, iconColor }) => (
  <tr className="hover:bg-surface-container-low/30 transition-colors">
    <td className="px-4 py-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-body-md font-semibold text-on-surface">{subject}</p>
          <p className="text-label-md text-secondary">{code}</p>
        </div>
      </div>
    </td>
    <td className="px-4 py-4 text-center">
      <p className="text-body-md font-bold text-on-surface">{marks}<span className="text-label-md font-normal text-secondary">/100</span></p>
    </td>
    <td className="px-4 py-4 text-right">
      <span className="px-3 py-1 bg-green-100 text-green-700 text-label-md font-bold rounded-full">{grade}</span>
    </td>
  </tr>
);

const DesktopStatCard = ({ title, value, subValue, icon, color }) => (
  <div className="bg-white p-8 rounded-3xl shadow-soft border border-surface-container flex justify-between items-center">
    <div>
      <p className="text-label-md font-bold text-secondary uppercase tracking-widest mb-2">{title}</p>
      <p className="text-[32px] font-bold text-on-surface leading-tight">{value}</p>
      <p className="text-body-md text-secondary mt-1">{subValue}</p>
    </div>
    <div className={`${color} p-4 rounded-2xl text-on-primary`}>
      <span className="material-symbols-outlined text-[32px]">{icon}</span>
    </div>
  </div>
);

const DesktopResultRow = ({ subject, code, marks, average, grade }) => (
  <tr className="hover:bg-surface-container-low/10 transition-colors">
    <td className="px-8 py-6">
      <p className="text-body-lg font-bold text-on-surface">{subject}</p>
      <p className="text-label-md text-secondary font-medium">{code}</p>
    </td>
    <td className="px-8 py-6 text-center">
      <div className="inline-flex flex-col items-center">
        <p className="text-body-lg font-bold text-on-surface">{marks}%</p>
        <div className="w-24 h-1.5 bg-surface-container rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${marks}%` }}></div>
        </div>
      </div>
    </td>
    <td className="px-8 py-6 text-center text-body-lg text-secondary font-medium">{average}%</td>
    <td className="px-8 py-6 text-right">
      <span className={`px-4 py-1.5 rounded-full text-label-md font-bold ${
        grade.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}>
        {grade}
      </span>
    </td>
  </tr>
);

export default Results;
