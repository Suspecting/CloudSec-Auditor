import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Database,
  Download,
  FileText,
  Gauge,
  LockKeyhole,
  Network,
  Play,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";

const findings = [
  {
    severity: "Critical",
    service: "S3",
    issue: "Public bucket exposure",
    resource: "demo-public-assets-bucket",
  },
  {
    severity: "Critical",
    service: "EC2",
    issue: "SSH open to 0.0.0.0/0",
    resource: "sg-0123456789abcdef0",
  },
  {
    severity: "High",
    service: "IAM",
    issue: "IAM user without MFA",
    resource: "developer-user",
  },
];

const features = [
  {
    icon: LockKeyhole,
    title: "IAM Security",
    text: "Find users without MFA, old access keys, risky identities, and weak credential hygiene.",
    stat: "Identity",
  },
  {
    icon: Database,
    title: "S3 Protection",
    text: "Detect public buckets, missing default encryption, and unsafe storage exposure patterns.",
    stat: "Storage",
  },
  {
    icon: Network,
    title: "Network Exposure",
    text: "Audit security groups exposing SSH, RDP, databases, and sensitive ports to the internet.",
    stat: "EC2",
  },
  {
    icon: Activity,
    title: "Logging Visibility",
    text: "Check CloudTrail and logging readiness so suspicious activity can be investigated.",
    stat: "Audit",
  },
];

function SeverityBadge({ severity }) {
  const styles = {
    Critical: "border-red-400/30 bg-red-500/10 text-red-300",
    High: "border-orange-400/30 bg-orange-500/10 text-orange-300",
    Medium: "border-yellow-400/30 bg-yellow-500/10 text-yellow-300",
    Low: "border-blue-400/30 bg-blue-500/10 text-blue-300",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[severity]}`}>
      {severity}
    </span>
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
        width: scrolled ? "min(760px, calc(100% - 32px))" : "min(1120px, calc(100% - 32px))",
        y: scrolled ? 12 : 26,
        borderRadius: scrolled ? 999 : 28,
        paddingTop: scrolled ? 10 : 14,
        paddingBottom: scrolled ? 10 : 14,
      }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="fixed left-1/2 top-0 z-50 -translate-x-1/2 border border-white/10 bg-slate-950/72 px-5 shadow-2xl shadow-black/35 backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              height: scrolled ? 34 : 44,
              width: scrolled ? 34 : 44,
              borderRadius: scrolled ? 14 : 18,
            }}
            className="flex items-center justify-center border border-cyan-300/30 bg-cyan-300/10 shadow-lg shadow-cyan-500/20"
          >
            <ShieldCheck className={`${scrolled ? "h-4 w-4" : "h-5 w-5"} text-cyan-300`} />
          </motion.div>

          <div>
            <p className="text-sm font-bold tracking-tight text-white">CloudSec Auditor</p>
            {!scrolled && (
              <p className="text-xs text-slate-500">AWS Security Desktop Dashboard</p>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-400 md:flex">
          <a href="#dashboard" className="transition hover:text-white">Dashboard</a>
          <a href="#features" className="transition hover:text-white">Checks</a>
          <a href="#reports" className="transition hover:text-white">Reports</a>
          <a href="#workflow" className="transition hover:text-white">Workflow</a>
        </div>

        <button className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/20">
          Mock Mode
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </motion.nav>
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

        <div className="absolute inset-0 bg-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/45 to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/30 to-slate-950/70" />
      </div>
      <div className="fixed inset-0 noise-layer" />
      <div className="fixed inset-0 cyber-grid opacity-60" />
      <div className="fixed -left-48 top-28 h-[520px] w-[520px] rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="fixed -right-40 top-56 h-[540px] w-[540px] rounded-full bg-blue-600/20 blur-[130px]" />
      <div className="fixed bottom-0 left-1/2 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px]" />

      <Navbar />

      <section id="dashboard" className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 pb-20 pt-36 lg:grid-cols-[1fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200 shadow-lg shadow-cyan-500/10">
            <Sparkles className="h-4 w-4" />
            AWS Security Misconfiguration Scanner
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
            Audit cloud risks with{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              evidence.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
            A premium desktop dashboard for identifying AWS misconfigurations across IAM,
            S3, EC2, CloudTrail, encryption, and network exposure — with evidence,
            severity, and remediation guidance.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 py-4 font-black text-slate-950 shadow-2xl shadow-cyan-500/25 transition hover:bg-cyan-200">
              <Play className="h-4 w-4 fill-slate-950" />
              Run Mock Scan
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>

            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white/10">
              <FileText className="h-4 w-4" />
              View Sample Report
            </button>
          </div>

          <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
            <div className="glass rounded-3xl p-5">
              <p className="text-4xl font-black text-white">08</p>
              <p className="mt-2 text-sm text-slate-400">Security checks</p>
            </div>
            <div className="glass rounded-3xl p-5">
              <p className="text-4xl font-black text-red-300">02</p>
              <p className="mt-2 text-sm text-slate-400">Critical risks</p>
            </div>
            <div className="glass rounded-3xl p-5">
              <p className="text-4xl font-black text-cyan-300">96</p>
              <p className="mt-2 text-sm text-slate-400">Risk score</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="glass-strong overflow-hidden rounded-[2rem]"
        >
          <div className="border-b border-white/10 bg-slate-950/70 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Security Overview</p>
                <p className="text-xs text-slate-500">demo-aws-account · ap-south-1</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Backend Ready
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Overall Risk Score</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-6xl font-black text-white">96</span>
                    <span className="pb-2 text-slate-500">/100</span>
                  </div>
                </div>

                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10">
                  <Gauge className="h-11 w-11 text-red-300" />
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-red-500" />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-300" />
                <h3 className="font-bold text-white">Top Findings</h3>
              </div>

              <div className="space-y-3">
                {findings.map((finding) => (
                  <div
                    key={finding.resource}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{finding.issue}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {finding.service} · {finding.resource}
                        </p>
                      </div>

                      <SeverityBadge severity={finding.severity} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-5">
              <div className="mb-4 flex items-center gap-2 text-slate-300">
                <Terminal className="h-4 w-4 text-cyan-300" />
                <span className="terminal-font text-sm">cloudsec-auditor scan --mode mock</span>
              </div>

              <div className="space-y-2 terminal-font text-sm">
                <p className="text-cyan-300">$ initializing scanner...</p>
                <p className="text-slate-400">loaded 8 security checks</p>
                <p className="text-slate-400">detected 6 failed controls</p>
                <p className="text-red-300">critical: public S3 bucket exposure</p>
                <p className="text-emerald-300">report ready: JSON · HTML · Markdown</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-cyan-300">
              Security checks
            </p>
            <h2 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
              Built for cloud security triage, not random scanning.
            </h2>
          </div>

          <p className="max-w-md text-slate-400">
            Every check is designed to return a resource, evidence, severity, and remediation.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="glass group rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
                    <Icon className="h-6 w-6 text-cyan-300" />
                  </div>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">
                    {feature.stat}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="reports" className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="glass-strong grid overflow-hidden rounded-[2rem] lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
              <Download className="h-7 w-7 text-cyan-300" />
            </div>

            <h2 className="text-4xl font-black text-white">Exportable reports for proof.</h2>
            <p className="mt-4 leading-7 text-slate-400">
              The final app will generate JSON for automation, HTML for visual review, and
              Markdown for GitHub or audit-style documentation.
            </p>

            <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-200">
              Generate Report
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="p-8">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="font-bold text-white">cloudsec_report.md</p>
                  <p className="text-xs text-slate-500">Risk-scored security summary</p>
                </div>

                <FileText className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="space-y-3 terminal-font text-sm">
                <p className="text-white"># CloudSec Auditor Report</p>
                <p className="text-slate-400">Risk score: <span className="text-red-300">96/100</span></p>
                <p className="text-slate-400">Critical findings: <span className="text-red-300">2</span></p>
                <p className="text-slate-400">Failed checks: <span className="text-orange-300">6</span></p>
                <p className="text-cyan-300">## Finding: Public S3 Bucket Exposure</p>
                <p className="text-slate-400">Evidence: Block Public Access disabled.</p>
                <p className="text-emerald-300">Remediation: Enable Block Public Access.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="relative mx-auto max-w-7xl px-6 pb-24 pt-16">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="glass rounded-[1.75rem] p-6">
            <Cloud className="mb-4 h-7 w-7 text-cyan-300" />
            <h3 className="text-xl font-black text-white">1. Select scan mode</h3>
            <p className="mt-3 leading-6 text-slate-400">
              Start with mock data for demos, then use read-only AWS profiles later.
            </p>
          </div>

          <div className="glass rounded-[1.75rem] p-6">
            <BarChart3 className="mb-4 h-7 w-7 text-blue-300" />
            <h3 className="text-xl font-black text-white">2. Score security risks</h3>
            <p className="mt-3 leading-6 text-slate-400">
              Convert failed controls into severity, evidence, and overall risk score.
            </p>
          </div>

          <div className="glass rounded-[1.75rem] p-6">
            <FileText className="mb-4 h-7 w-7 text-violet-300" />
            <h3 className="text-xl font-black text-white">3. Export reports</h3>
            <p className="mt-3 leading-6 text-slate-400">
              Generate clean reports for documentation, GitHub, and interview explanation.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
