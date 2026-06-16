import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cloud,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  Gauge,
  Globe2,
  HardDrive,
  KeyRound,
  Layers,
  LockKeyhole,
  Network,
  Play,
  Search,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const findings = [
  {
    id: "S3-001",
    severity: "Critical",
    service: "S3",
    issue: "Public bucket exposure",
    resource: "demo-public-assets-bucket",
    region: "ap-south-1",
    evidence: "Block Public Access disabled; policy allows public read.",
  },
  {
    id: "EC2-001",
    severity: "Critical",
    service: "EC2",
    issue: "SSH exposed to internet",
    resource: "sg-0123456789abcdef0",
    region: "ap-south-1",
    evidence: "Inbound TCP/22 allows 0.0.0.0/0.",
  },
  {
    id: "IAM-001",
    severity: "High",
    service: "IAM",
    issue: "Console user without MFA",
    resource: "developer-user",
    region: "global",
    evidence: "Login profile exists but no MFA device configured.",
  },
  {
    id: "S3-002",
    severity: "High",
    service: "S3",
    issue: "Bucket encryption disabled",
    resource: "demo-logs-bucket",
    region: "ap-south-1",
    evidence: "Default server-side encryption not detected.",
  },
  {
    id: "IAM-002",
    severity: "Medium",
    service: "IAM",
    issue: "Old access key detected",
    resource: "automation-user",
    region: "global",
    evidence: "Access key age is greater than 90 days.",
  },
];

const controls = [
  {
    title: "Identity Security",
    service: "IAM",
    icon: KeyRound,
    passed: 3,
    failed: 2,
    description: "MFA, access keys, identity hygiene, and least privilege checks.",
  },
  {
    title: "Storage Security",
    service: "S3",
    icon: Database,
    passed: 2,
    failed: 2,
    description: "Public exposure, bucket encryption, and storage access controls.",
  },
  {
    title: "Network Exposure",
    service: "EC2",
    icon: Network,
    passed: 4,
    failed: 1,
    description: "Security group rules, risky ports, and internet-facing exposure.",
  },
  {
    title: "Audit Logging",
    service: "CloudTrail",
    icon: Activity,
    passed: 1,
    failed: 0,
    description: "CloudTrail readiness, management events, and investigation visibility.",
  },
];

function SeverityBadge({ severity }) {
  const styles = {
    Critical: "border-red-400/30 bg-red-500/10 text-red-300",
    High: "border-orange-400/30 bg-orange-500/10 text-orange-300",
    Medium: "border-yellow-400/30 bg-yellow-500/10 text-yellow-300",
    Low: "border-blue-400/30 bg-blue-500/10 text-blue-300",
    Info: "border-slate-400/30 bg-slate-500/10 text-slate-300",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function StatCard({ label, value, tone, icon: Icon }) {
  const tones = {
    cyan: "text-cyan-300 border-cyan-300/15 bg-cyan-300/[0.06]",
    red: "text-red-300 border-red-300/15 bg-red-300/[0.06]",
    orange: "text-orange-300 border-orange-300/15 bg-orange-300/[0.06]",
    emerald: "text-emerald-300 border-emerald-300/15 bg-emerald-300/[0.06]",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${tones[tone].split(" ")[0]}`} />
      </div>
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      animate={{
        width: scrolled ? "min(760px, calc(100% - 32px))" : "min(1080px, calc(100% - 32px))",
        y: scrolled ? 10 : 20,
        borderRadius: scrolled ? 999 : 26,
        paddingTop: scrolled ? 10 : 14,
        paddingBottom: scrolled ? 10 : 14,
      }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="fixed left-1/2 top-0 z-50 -translate-x-1/2 border border-white/10 bg-slate-950/75 px-5 shadow-2xl shadow-black/40 backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              height: scrolled ? 34 : 42,
              width: scrolled ? 34 : 42,
              borderRadius: scrolled ? 14 : 17,
            }}
            className="flex items-center justify-center border border-cyan-300/30 bg-cyan-300/10 shadow-lg shadow-cyan-500/15"
          >
            <ShieldCheck className={`${scrolled ? "h-4 w-4" : "h-5 w-5"} text-cyan-300`} />
          </motion.div>

          <div>
            <p className="text-sm font-black tracking-tight text-white">CloudSec Auditor</p>
            {!scrolled && (
              <p className="text-xs text-slate-500">AWS Security Desktop Console</p>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-7 text-sm font-semibold text-slate-400 md:flex">
          <a href="#overview" className="transition hover:text-white">Overview</a>
          <a href="#findings" className="transition hover:text-white">Findings</a>
          <a href="#controls" className="transition hover:text-white">Controls</a>
          <a href="#reports" className="transition hover:text-white">Reports</a>
        </div>

        <button className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200 transition hover:bg-cyan-300/20">
          Mock Mode
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </motion.nav>
  );
}

function RiskMeter() {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Overall posture
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-6xl font-black text-white">96</span>
            <span className="pb-2 text-slate-500">/100</span>
          </div>
        </div>

        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-red-400/25 bg-red-500/10">
          <Gauge className="h-11 w-11 text-red-300" />
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-red-500" />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
        <span>Critical</span>
      </div>
    </div>
  );
}

function CommandCenter() {
  return (
    <div className="glass-strong rounded-[1.5rem] p-4">
      <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-sm font-black text-white">Scan Command Center</p>
          <p className="mt-1 text-xs text-slate-500">Configure and run AWS posture checks</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Backend Ready
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-2 flex items-center gap-2 text-slate-400">
            <Cloud className="h-4 w-4 text-cyan-300" />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">Profile</span>
          </div>
          <p className="text-lg font-black text-white">demo-aws-account</p>
          <p className="mt-1 text-xs text-slate-500">Mock profile for safe local demo</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-2 flex items-center gap-2 text-slate-400">
            <Globe2 className="h-4 w-4 text-cyan-300" />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">Region</span>
          </div>
          <p className="text-lg font-black text-white">ap-south-1</p>
          <p className="mt-1 text-xs text-slate-500">Mumbai region selected</p>
        </div>
      </div>

      <button className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-4 font-black text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:bg-cyan-200">
        <Play className="h-4 w-4 fill-slate-950" />
        Run Mock Security Scan
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </button>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/45 p-4">
        <div className="mb-3 flex items-center gap-2 text-slate-300">
          <Terminal className="h-4 w-4 text-cyan-300" />
          <span className="terminal-font text-xs">cloudsec-auditor scan --mode mock</span>
        </div>

        <div className="space-y-2 terminal-font text-xs">
          <p className="text-cyan-300">$ initializing scan engine...</p>
          <p className="text-slate-400">loaded 8 security controls</p>
          <p className="text-slate-400">evaluating IAM, S3, EC2, CloudTrail</p>
          <p className="text-orange-300">warning: 6 failed controls detected</p>
          <p className="text-emerald-300">reports ready: JSON · HTML · Markdown</p>
        </div>
      </div>
    </div>
  );
}

function FindingsTable() {
  return (
    <div id="findings" className="glass-strong rounded-[1.5rem] p-4">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black text-white">Evidence-Based Findings</p>
          <p className="mt-1 text-xs text-slate-500">
            Prioritized issues with service, resource, evidence, and severity
          </p>
        </div>

        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/[0.08]">
            <Search className="h-4 w-4" />
            Search
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/[0.08]">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[0.8fr_0.9fr_1.5fr_1.2fr_0.8fr] bg-white/[0.04] px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          <span>Severity</span>
          <span>Service</span>
          <span>Issue</span>
          <span>Resource</span>
          <span>Region</span>
        </div>

        {findings.map((finding) => (
          <div
            key={finding.id}
            className="grid grid-cols-[0.8fr_0.9fr_1.5fr_1.2fr_0.8fr] items-center border-t border-white/10 px-4 py-3 text-sm transition hover:bg-white/[0.035]"
          >
            <SeverityBadge severity={finding.severity} />
            <span className="font-bold text-slate-200">{finding.service}</span>
            <div>
              <p className="font-bold text-white">{finding.issue}</p>
              <p className="mt-1 text-xs text-slate-500">{finding.evidence}</p>
            </div>
            <span className="terminal-font text-xs text-slate-400">{finding.resource}</span>
            <span className="text-slate-400">{finding.region}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlCoverage() {
  return (
    <div id="controls" className="grid gap-3 lg:grid-cols-4">
      {controls.map((control) => {
        const Icon = control.icon;
        const total = control.passed + control.failed;
        const percent = Math.round((control.passed / total) * 100);

        return (
          <div key={control.title} className="glass rounded-[1.35rem] p-4">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
                <Icon className="h-6 w-6 text-cyan-300" />
              </div>

              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-slate-400">
                {control.service}
              </span>
            </div>

            <h3 className="text-lg font-black text-white">{control.title}</h3>
            <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">
              {control.description}
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">Coverage</span>
                <span className="font-black text-white">{percent}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-between text-xs">
              <span className="text-emerald-300">{control.passed} passed</span>
              <span className="text-red-300">{control.failed} failed</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportPanel() {
  return (
    <div id="reports" className="glass-strong grid overflow-hidden rounded-[1.5rem] lg:grid-cols-[0.85fr_1.15fr]">
      <div className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
          <Download className="h-7 w-7 text-cyan-300" />
        </div>

        <h2 className="text-3xl font-black tracking-tight text-white">Export reports with evidence.</h2>
        <p className="mt-4 leading-7 text-slate-400">
          Generate JSON for automation, HTML for visual review, and Markdown for GitHub-style audit notes.
        </p>

        <div className="mt-7 grid gap-3">
          <button className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left hover:bg-white/[0.08]">
            <span className="font-bold text-white">Export JSON</span>
            <FileText className="h-4 w-4 text-cyan-300" />
          </button>
          <button className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left hover:bg-white/[0.08]">
            <span className="font-bold text-white">Export HTML</span>
            <Eye className="h-4 w-4 text-cyan-300" />
          </button>
          <button className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left hover:bg-white/[0.08]">
            <span className="font-bold text-white">Export Markdown</span>
            <Layers className="h-4 w-4 text-cyan-300" />
          </button>
        </div>
      </div>

      <div className="p-7">
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="font-black text-white">cloudsec_report.md</p>
              <p className="text-xs text-slate-500">Generated security summary</p>
            </div>

            <FileText className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="space-y-3 terminal-font text-sm">
            <p className="text-white"># CloudSec Auditor Report</p>
            <p className="text-slate-400">Scan target: demo-aws-account</p>
            <p className="text-slate-400">Risk score: <span className="text-red-300">96/100</span></p>
            <p className="text-slate-400">Critical findings: <span className="text-red-300">2</span></p>
            <p className="text-cyan-300">## Finding: Public S3 Bucket Exposure</p>
            <p className="text-slate-400">Evidence: Block Public Access disabled.</p>
            <p className="text-emerald-300">Remediation: Enable Block Public Access.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          className="h-full w-full object-cover opacity-55"
          src="/background/video2.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/55 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-slate-950/80" />
      </div>

      <div className="fixed inset-0 z-[1] noise-layer opacity-45" />
      <div className="fixed inset-0 z-[1] cyber-grid opacity-25" />
      <div className="fixed -left-48 top-28 z-[1] h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="fixed -right-40 top-56 z-[1] h-[540px] w-[540px] rounded-full bg-blue-600/10 blur-[130px]" />
      <div className="fixed bottom-0 left-1/2 z-[1] h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[130px]" />

      <Navbar />

      <section id="overview" className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-32">
        <div className="mb-6 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              AWS Security Misconfiguration Scanner
            </div>

            <h1 className="max-w-5xl text-4xl font-black leading-[0.98] tracking-tight text-white md:text-6xl">
              Cloud security posture, summarized like a real audit.
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
              CloudSec Auditor is a desktop security console for checking AWS misconfigurations
              across identity, storage, network exposure, logging, and encryption controls.
            </p>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-cyan-300" />
              <div>
                <p className="text-sm font-black text-white">Last mock scan</p>
                <p className="text-xs text-slate-500">Generated locally · no AWS credentials used</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Checks" value="08" tone="cyan" icon={ShieldCheck} />
              <StatCard label="Critical" value="02" tone="red" icon={AlertTriangle} />
              <StatCard label="Failed" value="06" tone="orange" icon={Activity} />
              <StatCard label="Passed" value="02" tone="emerald" icon={CheckCircle2} />
            </div>

            <CommandCenter />
          </div>

          <div className="space-y-4">
            <RiskMeter />

            <div className="glass-strong rounded-[1.5rem] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">Service Breakdown</p>
                  <p className="mt-1 text-xs text-slate-500">Mock scan distribution</p>
                </div>
                <BarChart3 className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="space-y-4">
                {["IAM", "S3", "EC2", "CloudTrail"].map((service, index) => (
                  <div key={service}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-300">{service}</span>
                      <span className="text-slate-500">{[71, 64, 82, 100][index]}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
                        style={{ width: `${[71, 64, 82, 100][index]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[1.5rem] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
                  <HardDrive className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <p className="font-black text-white">Local-first desktop workflow</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Mock mode runs without AWS credentials. Real AWS mode will use local read-only
                    AWS CLI profiles through the Python backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <FindingsTable />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-cyan-300">
            Control coverage
          </p>
          <h2 className="max-w-3xl text-4xl font-black tracking-tight text-white">
            Checks grouped like a real security assessment.
          </h2>
        </div>

        <ControlCoverage />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <ReportPanel />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-12 pt-6">
        <div id="workflow" className="grid gap-3 md:grid-cols-3">
          <div className="glass rounded-[1.35rem] p-4">
            <Cloud className="mb-4 h-7 w-7 text-cyan-300" />
            <h3 className="text-xl font-black text-white">1. Choose scan mode</h3>
            <p className="mt-3 leading-6 text-slate-400">
              Start with mock data for demos, then switch to read-only AWS profile scanning later.
            </p>
          </div>

          <div className="glass rounded-[1.35rem] p-4">
            <Server className="mb-4 h-7 w-7 text-blue-300" />
            <h3 className="text-xl font-black text-white">2. Evaluate resources</h3>
            <p className="mt-3 leading-6 text-slate-400">
              Check IAM, S3, EC2, CloudTrail, encryption, and network exposure controls.
            </p>
          </div>

          <div className="glass rounded-[1.35rem] p-4">
            <FileText className="mb-4 h-7 w-7 text-violet-300" />
            <h3 className="text-xl font-black text-white">3. Export evidence</h3>
            <p className="mt-3 leading-6 text-slate-400">
              Generate JSON, HTML, and Markdown reports with severity and remediation notes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
