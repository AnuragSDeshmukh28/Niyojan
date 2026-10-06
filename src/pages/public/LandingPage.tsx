import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Calendar,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  Clock,
  Zap,
  Users,
  ChevronRight,
  Building2,
  Award,
  Sparkles,
  Lock,
} from 'lucide-react';
import { UserRole } from '../../types';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onSelectRoleDemo: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectRoleDemo }) => {
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('principal');
  const [workflowStep, setWorkflowStep] = useState(1);

  const roleDetails: Record<UserRole, { title: string; subtitle: string; features: string[]; quote: string }> = {
    student: {
      title: 'Student Portal',
      subtitle: 'Zero physical queueing. Submit requests & document approvals remotely.',
      features: ['Book principal appointments online', 'Track document verification live', 'Instant SMS & portal notifications'],
      quote: '"I no longer wait in front of the principal office for hours just to get a bonafide signed!"',
    },
    parent: {
      title: 'Parent Portal',
      subtitle: 'Seamless parent-teacher interaction & fee waiver tracking.',
      features: ['Schedule direct principal discussions', 'Track child leave & NOC progress', 'Transparent administrative updates'],
      quote: '"Transparent communication. I can schedule a meeting with the Principal without taking a full day off work."',
    },
    faculty: {
      title: 'Faculty Workspace',
      subtitle: 'Streamline research grant approvals & departmental meetings.',
      features: ['Submit research grant papers', 'Endorse student leave applications', 'Departmental meeting calendar'],
      quote: '"Grant approvals that used to take 3 weeks are now signed digitally within 24 hours."',
    },
    mediator: {
      title: 'Mediator Desk (Office Staff)',
      subtitle: 'The intelligent filter layer that prevents administrative congestion.',
      features: ['Triage & verify attached documents', 'Forward verified requests to Principal', 'Add office notes & priority tags'],
      quote: '"We screen incomplete applications before they clutter the Principal desk, saving hours daily."',
    },
    principal: {
      title: 'Principal Executive Command Center',
      subtitle: 'One-click digital approvals, schedule manager & institutional analytics.',
      features: ['Side-by-side digital signature viewer', 'Interactive calendar slot manager', 'Institutional efficiency metrics'],
      quote: '"Niyojan gives me complete oversight and lets me clear 40+ approvals in under 15 minutes."',
    },
    admin: {
      title: 'System Administrator Control',
      subtitle: 'Institutional user management, role privileges & immutable audit logs.',
      features: ['Manage user roles & permissions', 'Immutable system audit logs', 'Custom approval workflow rules'],
      quote: '"Enterprise security with zero data leakage. Compliant with university governance mandates."',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">Niyojan</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              SaaS v2.4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              onSelectRoleDemo('principal');
              onNavigate('dashboard');
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            Launch Live Demo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50/40">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Digital Transformation for Higher Education & Colleges</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Transform Institutional Administration with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600">
              Niyojan
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Streamline appointments, document approvals, and institutional workflows through a secure, multi-role digital approval system.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                onSelectRoleDemo('principal');
                onNavigate('dashboard');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-blue-600/30 transition-all text-sm flex items-center justify-center gap-2"
            >
              Explore Executive Dashboard <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl border border-slate-200 shadow-subtle transition-all text-sm"
            >
              Try Role Presets
            </button>
          </div>

          {/* Floating UI Showcase */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-slate-900 p-4 shadow-2xl border border-slate-800 text-left relative overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs text-slate-400 font-mono">niyojan.institution.edu.in/app/principal</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono">LIVE DEMO PREVIEW</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold">Pending Principal Approvals</p>
                <p className="text-3xl font-black text-blue-400 mt-1">14 Requests</p>
                <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> 82% resolution speedup
                </div>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold">Mediator Desk Queue</p>
                <p className="text-3xl font-black text-teal-400 mt-1">3 Under Triage</p>
                <p className="mt-2 text-[11px] text-slate-400">Avg processing: 18 mins</p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold">Digital Certificate Stamps Issued</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">1,240 Verified</p>
                <p className="mt-2 text-[11px] text-slate-400">100% Tamper-Proof Audit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section className="py-20 px-6 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Interactive 5-Step Workflow Engine
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              How Niyojan eliminates bottlenecks with Mediator Triage and Executive Sign-off.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: 1, title: '1. Request Submission', desc: 'Student / Parent / Faculty files request online with attachments.' },
              { step: 2, title: '2. Mediator Review', desc: 'Office staff filters, verifies authenticity, and adds notes.' },
              { step: 3, title: '3. Principal Decision', desc: 'Principal receives clean packet, counter-signs or schedules.' },
              { step: 4, title: '4. Slot / Digital Stamp', desc: 'Calendar slot locked & official digital stamp generated.' },
              { step: 5, title: '5. Completion', desc: 'Notification dispatched and audit record permanently saved.' },
            ].map((s) => (
              <div
                key={s.step}
                onClick={() => setWorkflowStep(s.step)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  workflowStep === s.step
                    ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  workflowStep === s.step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  0{s.step}
                </div>
                <h3 className="mt-3 text-xs font-bold text-slate-800">{s.title}</h3>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Enterprise Feature Modules
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Built specifically to handle the governance, compliance, and appointment scheduling needs of universities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Smart Appointment Scheduling</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Prevents crowding at administration doors. Priority slot allocation with automated calendar synchronization.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Digital Document Approval</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Upload bonafide certificates, NOCs, and fee waiver forms. Secure digital seals replace physical rubber stamps.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Mediator Office Triage Desk</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Empowers administrative office staff to screen, verify, and tag requests before escalating to the Principal.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Principal Command Desk</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Executive level one-click approval, slot rescheduling, and analytics monitoring.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Real-Time Approval Tracking</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Step-by-step visual audit trail keeps students, parents, and faculty informed at every stage.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Immutable Audit & Security</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Full governance tracking with IP logging, timestamping, and user role access matrix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Showcase Tabs */}
      <section className="py-20 px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Tailored Personas for All Stakeholders
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Select a role below to see how Niyojan transforms their daily institutional experience.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {(['student', 'parent', 'faculty', 'mediator', 'principal', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRoleTab(r)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeRoleTab === r
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Active Persona Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs font-semibold">
                {roleDetails[activeRoleTab].title}
              </div>
              <h3 className="text-2xl font-bold">{roleDetails[activeRoleTab].subtitle}</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {roleDetails[activeRoleTab].features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs italic text-slate-400 border-l-2 border-amber-400 pl-3 pt-1">
                {roleDetails[activeRoleTab].quote}
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-3">
              <button
                onClick={() => {
                  onSelectRoleDemo(activeRoleTab);
                  onNavigate('dashboard');
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                Open {activeRoleTab.toUpperCase()} Workspace <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-black text-lg mb-3">
              <Layers className="w-5 h-5 text-blue-500" /> Niyojan
            </div>
            <p className="text-[11px] leading-relaxed">
              Smart Administrative Workflow & Digital Approval System for Educational Institutions.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">System Roles</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Student Portal</li>
              <li>Parent Desk</li>
              <li>Faculty Workspace</li>
              <li>Mediator Desk</li>
              <li>Principal Executive Desk</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Governance</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Digital Stamp Verification</li>
              <li>Audit Log Compliance</li>
              <li>Data Privacy & Security</li>
              <li>University ERP Integration</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Institutional Support</h4>
            <p className="text-[11px]">Designed for Colleges & Educational Campuses</p>
            <button
              onClick={() => {
                onSelectRoleDemo('principal');
                onNavigate('dashboard');
              }}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs"
            >
              Launch Live Application
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-900 text-center text-[10px] text-slate-500">
          © 2026 Niyojan Institutional Workflow Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
