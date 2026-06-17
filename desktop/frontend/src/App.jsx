import { useEffect, useState } from "react";
const API_BASE_URL = "http://127.0.0.1:8000";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Clock3,
  RefreshCw,
  Search,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Database,
  FileText,
  Gauge,
  Play,
  ShieldCheck,
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

function SeverityBadge({ severity }) {
  const styles = {
    Critical: "border-red-400/40 bg-red-500/15 text-red-200",
    High: "border-orange-400/40 bg-orange-500/15 text-orange-200",
    Medium: "border-yellow-400/40 bg-yellow-500/15 text-yellow-200",
    Low: "border-blue-400/40 bg-blue-500/15 text-blue-200",
    Info: "border-slate-400/40 bg-slate-500/15 text-slate-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${styles[severity] ?? styles.Info
        }`}
    >
      {severity}
    </span>
  );
}

function Navbar({ onRunScan, isScanning, backendStatus, apiStatus }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 35);
    onScroll();

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      animate={{
        y: scrolled ? 14 : 28,
        width: scrolled
          ? "min(720px, calc(100% - 32px))"
          : "min(960px, calc(100% - 32px))",
        paddingTop: scrolled ? 10 : 14,
        paddingBottom: scrolled ? 10 : 14,
        borderRadius: scrolled ? 999 : 22,
      }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="fixed left-1/2 top-0 z-50 -translate-x-1/2 border border-white/10 bg-slate-950/45 px-4 shadow-2xl shadow-black/35 backdrop-blur-2xl backdrop-saturate-150"
    >
      <div className="flex items-center justify-between gap-5">
        {/* Logo */}
        <a href="#overview" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/25">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-base font-black tracking-tight text-white">
              CloudSec
            </span>
            <span className="text-base font-black tracking-tight text-cyan-300">
              Auditor
            </span>
          </div>
        </a>

        {/* Menu */}
        <div className="hidden items-center gap-5 text-sm font-semibold text-slate-300 md:flex">
          <a href="#scanner" className="transition hover:text-white">
            Scanner
          </a>

          <a href="#coverage" className="transition hover:text-white">
            Coverage
          </a>

          <a href="#reports" className="transition hover:text-white">
            Reports
          </a>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 lg:flex">
          <span
            className={`h-2 w-2 rounded-full ${backendStatus === "online"
              ? "bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.75)]"
              : backendStatus === "offline"
                ? "bg-red-300 shadow-[0_0_12px_rgba(252,165,165,0.75)]"
                : "bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.75)]"
              }`}
          />

          {backendStatus === "online"
            ? `API Online${apiStatus?.version ? ` · v${apiStatus.version}` : ""}`
            : backendStatus === "offline"
              ? "API Offline"
              : "Checking API"}
        </div>

        {/* CTA */}
        <button
          onClick={onRunScan}
          disabled={isScanning}
          className="group inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isScanning ? "Scanning" : "Scan"}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.nav>
  );
}

function ProductPreview({ scanResult, scanError, isScanning, lastScanAt }) {

  const hasScanResult = Boolean(scanResult);

  const summary = scanResult?.summary;
  const activeFindings = hasScanResult
    ? scanResult?.findings?.slice(0, 3) ?? []
    : [];

  const riskScore = hasScanResult ? summary?.risk_score ?? 0 : 0;
  const totalChecks = hasScanResult ? summary?.total_checks ?? 0 : 0;
  const criticalCount = hasScanResult ? summary?.critical ?? 0 : 0;
  const passedCount = hasScanResult ? summary?.passed ?? 0 : 0;
  const failedCount = hasScanResult ? summary?.failed ?? 0 : 0;
  const dataSource = hasScanResult ? "Real AWS Read-Only API" : "No scan yet";

  const lastScanLabel = lastScanAt
    ? lastScanAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    : "Not run yet";

  const scanStatusLabel = isScanning
    ? "Scanning..."
    : scanResult
      ? "Scan completed"
      : "Ready";

  return (
    <motion.div
      initial={{ opacity: 0, y: 70, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
      id="scanner"
      className="relative mx-auto mt-20 w-[min(820px,92vw)] scroll-mt-32"
    >
      <div className="absolute -inset-8 rounded-[2rem] bg-cyan-500/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/88 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>

          <div className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 py-1 text-xs font-bold text-cyan-200">
            AWS Security Dashboard · {dataSource}
          </div>


          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-300">
            {isScanning ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-300" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            )}
            {scanStatusLabel}
          </div>
        </div>

        {scanError && (
          <div className="mx-5 mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-left text-sm font-bold text-red-200">
            {scanError}
          </div>
        )}

        <div className="mx-5 mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 className="h-4 w-4 text-cyan-300" />
            <span>Last scan: {lastScanLabel}</span>
          </div>

          <div className="text-xs font-bold text-cyan-200">
            Source: {dataSource}
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Overall Risk
                  </p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-5xl font-black text-white">{riskScore}</span>
                    <span className="pb-1 text-slate-500">/100</span>
                  </div>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-400/25 bg-red-500/10">
                  <Gauge className="h-8 w-8 text-red-300" />
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-red-500"
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-2xl font-black text-white">
                  {String(totalChecks).padStart(2, "0")}
                </p>
                <p className="mt-1 text-xs text-slate-500">Checks</p>
              </div>

              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
                <p className="text-2xl font-black text-red-200">
                  {String(criticalCount).padStart(2, "0")}
                </p>
                <p className="mt-1 text-xs text-slate-500">Critical</p>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="text-2xl font-black text-emerald-200">
                  {String(passedCount).padStart(2, "0")}
                </p>
                <p className="mt-1 text-xs text-slate-500">Passed</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-300" />
                <p className="font-mono text-xs text-slate-300">cloudsec-auditor scan --mode aws-readonly</p>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <p className="text-cyan-300">
                  {isScanning
                    ? "$ scanning AWS controls..."
                    : hasScanResult
                      ? "$ scan completed"
                      : "$ waiting for scan command..."}
                </p>

                <p className="text-slate-400">
                  {hasScanResult
                    ? `loaded ${totalChecks} security controls`
                    : "no controls executed yet"}
                </p>

                <p className={hasScanResult ? "text-orange-300" : "text-slate-500"}>
                  {hasScanResult
                    ? `warning: ${failedCount} failed controls detected`
                    : "findings pending until scan runs"}
                </p>

                <p className={hasScanResult ? "text-emerald-300" : "text-slate-500"}>
                  {hasScanResult
                    ? "reports ready: JSON · HTML · Markdown"
                    : "reports pending until scan runs"}
                </p>
              </div>
            </div>
          </div>

          <div id="findings" className="scroll-mt-32 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-black text-white">Prioritized Findings</p>
                <p className="text-xs text-slate-500">Evidence-based AWS misconfiguration results</p>
              </div>

              <AlertTriangle className="h-5 w-5 text-orange-300" />
            </div>

            <div className="space-y-3">
              {activeFindings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/25 p-6 text-center">
                  <Terminal className="mx-auto mb-3 h-6 w-6 text-cyan-300" />
                  <p className="font-bold text-white">No findings loaded yet</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Run AWS Scan to load prioritized AWS findings from the backend.
                  </p>
                </div>
              ) : (
                activeFindings.map((finding) => (
                  <div
                    key={finding.id ?? finding.resource}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">
                          {finding.issue ?? finding.check}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {finding.service} · {finding.resource}
                        </p>
                      </div>

                      <SeverityBadge severity={finding.severity} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                <Database className="mb-2 h-5 w-5 text-cyan-300" />
                <p className="text-sm font-black text-white">S3 Security</p>
                <p className="mt-1 text-xs text-slate-500">Exposure + encryption</p>
              </div>

              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                <Activity className="mb-2 h-5 w-5 text-cyan-300" />
                <p className="text-sm font-black text-white">CloudTrail</p>
                <p className="mt-1 text-xs text-slate-500">Audit visibility</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FindingsExplorerSection({ scanResult }) {
  const [activeSeverity, setActiveSeverity] = useState("All");
  const [activeService, setActiveService] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const allFindings = scanResult?.findings ?? [];

  const severities = ["All", "Critical", "High", "Medium", "Low", "Info"];
  const services = [
    "All",
    ...Array.from(
      new Set(
        allFindings
          .map((finding) => finding.service)
          .filter(Boolean)
      )
    ),
  ];
  const severityCounts = allFindings.reduce((acc, finding) => {
    const severity = finding.severity ?? "Info";
    acc[severity] = (acc[severity] ?? 0) + 1;
    return acc;
  }, {});

  const failedCount = allFindings.filter(
    (finding) => finding.status === "Failed"
  ).length;

  const passedCount = allFindings.filter(
    (finding) => finding.status === "Passed"
  ).length;

  const severitySummary = [
    {
      label: "Critical",
      value: severityCounts.Critical ?? 0,
      className: "border-red-400/25 bg-red-500/10 text-red-200",
    },
    {
      label: "High",
      value: severityCounts.High ?? 0,
      className: "border-orange-400/25 bg-orange-500/10 text-orange-200",
    },
    {
      label: "Medium",
      value: severityCounts.Medium ?? 0,
      className: "border-yellow-400/25 bg-yellow-500/10 text-yellow-200",
    },
    {
      label: "Passed",
      value: passedCount,
      className: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
    },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleFindings = allFindings.filter((finding) => {
    const severityMatch =
      activeSeverity === "All" || finding.severity === activeSeverity;

    const serviceMatch =
      activeService === "All" || finding.service === activeService;

    const searchableText = [
      finding.id,
      finding.service,
      finding.severity,
      finding.status,
      finding.check,
      finding.issue,
      finding.resource,
      finding.region,
      finding.category,
      finding.evidence,
      finding.remediation,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const searchMatch =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

    return severityMatch && serviceMatch && searchMatch;
  });

  const isFilterActive =
    activeSeverity !== "All" ||
    activeService !== "All" ||
    normalizedQuery.length > 0;

  function resetFindingFilters() {
    setActiveSeverity("All");
    setActiveService("All");
    setSearchQuery("");
  }

  return (
    <section
      id="findings-explorer"
      className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-6"
    >
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">
          Findings Explorer
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Review every detected AWS security finding.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300/85">
          After a scan, CloudSec Auditor lists every finding with severity, affected
          resource, evidence, and remediation guidance.
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {severitySummary.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-5 text-left shadow-2xl shadow-black/20 backdrop-blur-xl ${item.className}`}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] opacity-75">
              {item.label}
            </p>

            <p className="mt-3 text-4xl font-black">
              {String(item.value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black text-white">Scan Findings</p>
            <p className="mt-1 text-sm text-slate-500">
              {allFindings.length > 0
                ? `Showing ${visibleFindings.length} of ${allFindings.length} findings`
                : "Run a scan to load findings"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {severities.map((severity) => (
              <button
                key={severity}
                onClick={() => setActiveSeverity(severity)}
                className={`rounded-full border px-3 py-2 text-xs font-bold transition ${activeSeverity === severity
                  ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                  : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
              >
                {severity}
                <span className="ml-1 opacity-60">
                  {severity === "All"
                    ? allFindings.length
                    : severityCounts[severity] ?? 0}
                </span>
              </button>
            ))}
            {isFilterActive && (
              <button
                onClick={resetFindingFilters}
                className="rounded-full border border-red-300/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/15"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search findings, resources, evidence, remediation..."
              className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/35 focus:bg-black/35"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <button
                key={service}
                onClick={() => setActiveService(service)}
                className={`rounded-full border px-3 py-2 text-xs font-bold transition ${activeService === service
                  ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                  : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {isFilterActive && (
          <div className="mb-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-3 text-sm text-cyan-100">
            Active filters:
            <span className="ml-2 font-bold">
              Severity: {activeSeverity} · Service: {activeService}
              {normalizedQuery ? ` · Search: "${searchQuery}"` : ""}
            </span>
          </div>
        )}

        {allFindings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/25 p-8 text-center">
            <Terminal className="mx-auto mb-4 h-8 w-8 text-cyan-300" />
            <p className="font-black text-white">No scan results yet</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Click Run AWS Scan first. The backend will return findings, generate
              reports, and this section will show the full result set.
            </p>
          </div>
        ) : visibleFindings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/25 p-6 text-center">
            <p className="font-bold text-slate-300">
              No findings match the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleFindings.map((finding) => (
              <div
                key={finding.id ?? `${finding.service}-${finding.resource}`}
                className="rounded-2xl border border-white/10 bg-black/25 p-5 transition hover:border-cyan-300/25 hover:bg-black/35"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={finding.severity} />

                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-300">
                        {finding.status ?? "Unknown"}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-300">
                        {finding.service}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white">
                      {finding.check ?? finding.issue}
                    </h3>

                    <p className="mt-2 font-mono text-xs text-cyan-200">
                      {finding.resource}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Region
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-300">
                      {finding.region ?? "global"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                      Evidence
                    </p>
                    <p className="text-sm leading-6 text-slate-300">
                      {finding.evidence ?? "Evidence will be shown after scan execution."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                      Remediation
                    </p>
                    <p className="text-sm leading-6 text-slate-300">
                      {finding.remediation ?? "Remediation guidance will be shown here."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SecurityCoverageSection() {
  const checks = [
    {
      title: "IAM Security",
      service: "Identity & Access",
      icon: ShieldCheck,
      points: [
        "IAM users without MFA",
        "Old access keys",
        "Credential hygiene checks",
      ],
    },
    {
      title: "S3 Exposure",
      service: "Storage Security",
      icon: Database,
      points: [
        "Public bucket exposure",
        "Missing bucket encryption",
        "Unsafe storage configuration",
      ],
    },
    {
      title: "EC2 Network Risk",
      service: "Network Security",
      icon: Cloud,
      points: [
        "SSH exposed to internet",
        "Risky security group rules",
        "Sensitive port exposure",
      ],
    },
    {
      title: "CloudTrail Logging",
      service: "Audit Visibility",
      icon: Activity,
      points: [
        "CloudTrail status check",
        "Management event visibility",
        "Logging readiness review",
      ],
    },
  ];

  return (
    <section
      id="coverage"
      className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10"
    >
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">
          Security Coverage
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Built around real AWS misconfiguration checks.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300/85">
          CloudSec Auditor focuses on cloud security areas that matter in practical audits:
          identity, storage exposure, network access, logging, and evidence-based reporting.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {checks.map((check) => {
          const Icon = check.icon;

          return (
            <div
              key={check.title}
              className="group rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-left shadow-2xl shadow-black/25 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-950/70"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 shadow-lg shadow-cyan-400/10">
                    <Icon className="h-6 w-6 text-cyan-300" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">{check.title}</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {check.service}
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
                  Audit
                </span>
              </div>

              <div className="space-y-3">
                {check.points.map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <p className="text-sm text-slate-300">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    {
      number: "01",
      title: "Choose scan mode",
      icon: Cloud,
      description:
        "Start with safe mock mode for demos, then switch to read-only AWS profile scanning later.",
      detail: "Mock mode uses local demo findings. AWS mode will use boto3 and local AWS CLI profiles.",
    },
    {
      number: "02",
      title: "Run security checks",
      icon: Terminal,
      description:
        "The backend evaluates cloud controls across IAM, S3, EC2, CloudTrail, and encryption areas.",
      detail: "Each module returns service, resource, evidence, severity, and remediation data.",
    },
    {
      number: "03",
      title: "Score the findings",
      icon: Gauge,
      description:
        "Failed controls are converted into Critical, High, Medium, Low, and Info severity levels.",
      detail: "The dashboard summarizes total checks, failed controls, passed controls, and risk score.",
    },
    {
      number: "04",
      title: "Export audit reports",
      icon: FileText,
      description:
        "Generate structured reports for documentation, GitHub, interview explanation, and review.",
      detail: "Planned report formats: JSON, HTML, and Markdown.",
    },
  ];

  return (
    <section
      id="workflow"
      className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-6"
    >
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">
          Workflow
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
          From scan execution to evidence-based reporting.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300/85">
          CloudSec Auditor follows a simple security workflow: run checks, collect evidence,
          prioritize risks, and generate reports that are easy to explain.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 top-10 hidden h-[2px] w-[78%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent lg:block" />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-left shadow-2xl shadow-black/25 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-950/70"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 shadow-lg shadow-cyan-400/10">
                    <Icon className="h-6 w-6 text-cyan-300" />
                  </div>

                  <span className="font-mono text-sm font-black text-cyan-200">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">{step.title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {step.description}
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs leading-5 text-slate-400">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ReportsSection({
  onOpenReport,
  reportExport,
  scanResult,
  openingReportType,
}) {
  const reports = [
    {
      title: "JSON Report",
      type: "Automation Output",
      icon: Database,
      description:
        "Structured scan data containing summary, risk score, affected resources, severity, evidence, and remediation.",
      example: "cloudsec_report.json",
    },
    {
      title: "HTML Report",
      type: "Visual Review",
      icon: FileText,
      description:
        "Clean browser-readable report for reviewing AWS posture, failed checks, service breakdown, and top risks.",
      example: "cloudsec_report.html",
    },
    {
      title: "Markdown Report",
      type: "GitHub Ready",
      icon: Terminal,
      description:
        "Developer-friendly report format for GitHub README, documentation, interview explanation, and audit notes.",
      example: "cloudsec_report.md",
    },
  ];
  function getReportFileName(reportValue) {
    if (!reportValue) return "Not generated yet";

    if (typeof reportValue === "string") {
      return reportValue.split(/[\\/]/).pop();
    }

    return reportValue.filename ?? "Not generated yet";
  }
  const latestReports = reportExport?.reports;

  const latestExportTime =
    latestReports?.exported_at ?? "Run a scan to generate timestamped reports";

  const latestJsonFile = getReportFileName(latestReports?.json);
  const latestHtmlFile = getReportFileName(latestReports?.html);
  const latestMarkdownFile = getReportFileName(latestReports?.markdown);

  const summary = scanResult?.summary;
  const liveFindings = scanResult?.findings ?? [];

  const reportRiskScore = summary?.risk_score ?? 96;
  const reportTotalChecks = summary?.total_checks ?? 8;
  const reportFailedControls = summary?.failed ?? 6;
  const hasScanResult = Boolean(scanResult);
  const hasGeneratedReports = Boolean(latestReports?.exported_at);

  const topCriticalFinding =
    liveFindings.find((finding) => finding.severity === "Critical") ??
    liveFindings[0];

  const topFindingService = topCriticalFinding?.service ?? "S3";
  const topFindingTitle =
    topCriticalFinding?.check ??
    topCriticalFinding?.issue ??
    "Public Bucket Exposure";

  const topFindingEvidence =
    topCriticalFinding?.evidence ??
    "Block Public Access disabled and public read policy detected.";

  const topFindingRemediation =
    topCriticalFinding?.remediation ??
    "Enable S3 Block Public Access and review bucket policy.";


  return (
    <section
      id="reports"
      className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-6"
    >
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">
          Reports
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Export findings into clean audit-ready reports.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300/85">
          Every scan result should be easy to review, explain, and document. CloudSec Auditor
          is designed to export structured reports with risk score, evidence, and remediation.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid gap-5">
          {reports.map((report) => {
            const Icon = report.icon;

            return (
              <div
                key={report.title}
                className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-left shadow-2xl shadow-black/25 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-950/70"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
                      <Icon className="h-6 w-6 text-cyan-300" />
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white">{report.title}</h3>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        {report.type}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
                    Export
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-300">
                  {report.description}
                </p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="font-mono text-xs text-cyan-200">
                    {report.title === "JSON Report"
                      ? latestJsonFile
                      : report.title === "HTML Report"
                        ? latestHtmlFile
                        : latestMarkdownFile}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-left shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="font-black text-white">Report Preview</p>
              <p className="mt-1 text-xs text-slate-500">
                {hasScanResult
                  ? "Live preview from latest scan"
                  : "Run a scan to generate report preview"}
              </p>
            </div>

            <FileText className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="mb-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-cyan-300" />
                <p className="text-sm font-black text-white">Latest Export</p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
                {latestReports ? "Ready" : "Pending"}
              </span>
            </div>

            <p className="text-xs leading-5 text-slate-400">
              {latestExportTime}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => onOpenReport("json")}
                disabled={!hasGeneratedReports || openingReportType === "json"}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {openingReportType === "json" ? "Opening..." : "JSON"}
              </button>

              <button
                onClick={() => onOpenReport("html")}
                disabled={!hasGeneratedReports || openingReportType === "html"}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {openingReportType === "html" ? "Opening..." : "HTML"}
              </button>

              <button
                onClick={() => onOpenReport("markdown")}
                disabled={!hasGeneratedReports || openingReportType === "markdown"}
                className="rounded-full bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {openingReportType === "markdown" ? "Opening..." : "Markdown"}
              </button>
            </div>
          </div>



          {hasScanResult ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-5 font-mono text-sm">
              <p className="text-white"># CloudSec Auditor Report</p>

              <p className="text-slate-400">
                Scan Target: <span className="text-cyan-200">demo-aws-account</span>
              </p>

              <p className="text-slate-400">
                Risk Score: <span className="text-red-300">{reportRiskScore}/100</span>
              </p>

              <p className="text-slate-400">
                Total Checks: <span className="text-white">{reportTotalChecks}</span>
              </p>

              <p className="text-slate-400">
                Failed Controls:{" "}
                <span className="text-orange-300">{reportFailedControls}</span>
              </p>

              <p className="pt-3 text-cyan-300">## Critical Finding</p>

              <p className="text-white">
                {topFindingService} - {topFindingTitle}
              </p>

              <p className="text-slate-400">
                Evidence: {topFindingEvidence}
              </p>

              <p className="text-emerald-300">
                Remediation: {topFindingRemediation}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-black/30 p-8 text-center">
              <FileText className="mx-auto mb-4 h-8 w-8 text-cyan-300" />
              <p className="font-black text-white">No report preview yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Run AWS Scan to generate scan data, timestamped exports, and a live report preview.
              </p>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => onOpenReport("json")}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              JSON
            </button>

            <button
              onClick={() => onOpenReport("html")}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              HTML
            </button>

            <button
              onClick={() => onOpenReport("markdown")}
              className="rounded-full bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              Markdown
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTASection({
  onRunScan,
  isScanning,
  onOpenReport,
  openingReportType,
  apiStatus,
}) {
  const footerLinks = [
    {
      title: "Product",
      links: ["Scanner", "Coverage", "Reports", "Mock Mode"],
    },
    {
      title: "Security",
      links: ["IAM Checks", "S3 Checks", "EC2 Checks", "CloudTrail"],
    },
    {
      title: "Output",
      links: ["JSON Report", "HTML Report", "Markdown Report", "Evidence"],
    },
  ];

  return (
    <footer className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 shadow-2xl shadow-black/30 backdrop-blur-xl">
        {/* Top CTA strip */}
        <div className="flex flex-col gap-5 border-b border-white/10 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-black text-white">
              Ready to run a safe mock audit?
            </p>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Review AWS misconfiguration findings, risk score, evidence, and report output
              without using real AWS credentials.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
                Report files: {apiStatus?.generated_reports ?? 0}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300">
                Mode: {apiStatus?.mode ?? "mock"}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300">
                Engine: {apiStatus?.scan_engine ?? "mock"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onRunScan}
              disabled={isScanning}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              {isScanning ? "Scanning..." : "Run Scan"}
            </button>

            <button
              onClick={() => onOpenReport("html")}
              disabled={openingReportType === "html"}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {openingReportType === "html" ? "Opening..." : "View Report"}
            </button>

          </div>
        </div>

        {/* Main footer */}
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.3fr_2fr]">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
              </div>

              <div>
                <p className="text-base font-black text-white">
                  CloudSec <span className="text-cyan-300">Auditor</span>
                </p>
                <p className="text-xs text-slate-500">
                  AWS Security Misconfiguration Scanner
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-6 text-slate-400">
              A local-first security dashboard for auditing AWS posture across IAM, S3,
              EC2, CloudTrail, and reportable evidence.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300">
                React
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300">
                FastAPI
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300">
                Electron
              </span>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
                boto3 planned
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-6 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  {group.title}
                </p>

                <div className="space-y-2">
                  {group.links.map((link) => (
                    <p
                      key={link}
                      className="cursor-default text-sm font-medium text-slate-400 transition hover:text-white"
                    >
                      {link}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div className="border-t border-white/10 px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Mock mode does not use or store AWS credentials.
            </div>

            <p className="text-xs text-slate-500">
              Real AWS mode will use local read-only AWS CLI profiles through the Python backend.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 bg-black/20 px-6 py-4">
          <div className="flex flex-col gap-2 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              © 2026 CloudSec Auditor. Built for defensive cloud security auditing.
            </p>

            <p>
              Local-first · Evidence-based · Report-ready
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Toast({ toast, onClose }) {
  const isSuccess = toast.type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, x: 420 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 420 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 28,
      }}
      className={`fixed bottom-6 right-6 z-[80] w-[min(380px,calc(100vw-32px))] rounded-2xl border px-4 py-4 shadow-2xl shadow-black/40 backdrop-blur-2xl ${isSuccess
        ? "border-emerald-300/25 bg-emerald-950/45"
        : "border-red-300/25 bg-red-950/45"
        }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border ${isSuccess
            ? "border-emerald-300/25 bg-emerald-300/10"
            : "border-red-300/25 bg-red-300/10"
            }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-black text-white">{toast.title}</p>
          <p className="mt-1 text-sm leading-5 text-slate-300">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm font-bold text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}


function AWSProfileStatusPanel({
  awsProfiles,
  selectedAwsProfile,
  setSelectedAwsProfile,
  awsProfileValidation,
  awsProfileStatus,
  isValidatingAwsProfile,
  onValidateProfile,
  onRefreshProfiles,
}) {
  const hasProfiles = awsProfiles.length > 0;
  const isValid = awsProfileStatus === "valid";
  const isError = awsProfileStatus === "error";

  const statusLabel = isValid
    ? "Validated"
    : isError
      ? "Validation failed"
      : hasProfiles
        ? "Ready to validate"
        : "No profile found";

  return (
    <section
      id="aws-profile"
      className="relative z-10 mx-auto w-[min(980px,92vw)] px-6 py-16"
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 text-left shadow-2xl shadow-black/25 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
              <Cloud className="h-3.5 w-3.5" />
              AWS Read-Only Mode
            </div>

            <h2 className="mt-3 text-3xl font-black text-white">
              AWS Profile Status
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Detect and validate local AWS CLI profiles safely. CloudSec Auditor does not expose access keys, secret keys, or session tokens.
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${
              isValid
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                : isError
                  ? "border-red-300/30 bg-red-300/10 text-red-100"
                  : "border-yellow-300/30 bg-yellow-300/10 text-yellow-100"
            }`}
          >
            {isValid ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : isError ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {statusLabel}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Profiles Found
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {awsProfiles.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Selected Profile
            </p>

            <select
              value={selectedAwsProfile}
              onChange={(event) => setSelectedAwsProfile(event.target.value)}
              disabled={!hasProfiles}
              className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-bold text-white outline-none transition focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasProfiles ? (
                awsProfiles.map((profile) => (
                  <option key={profile} value={profile}>
                    {profile}
                  </option>
                ))
              ) : (
                <option value="">No AWS profile configured</option>
              )}
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Credentials Exposed
            </p>
            <p className="mt-2 text-2xl font-black text-emerald-200">
              false
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Read-Only Safety
            </p>
            <p className="mt-2 text-sm font-bold text-slate-200">
              {awsProfileValidation?.safe_for_read_only_scan
                ? "Safe for future read-only checks"
                : "Validate profile first"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Masked Account
            </p>
            <p className="mt-2 text-sm font-bold text-slate-200">
              {awsProfileValidation?.account_id_masked ?? "Hidden until validated"}
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4 sm:flex-row md:flex-col">
            <button
              onClick={onRefreshProfiles}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Profiles
            </button>

            <button
              onClick={() => onValidateProfile(selectedAwsProfile)}
              disabled={!hasProfiles || isValidatingAwsProfile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {isValidatingAwsProfile ? "Validating..." : "Validate Profile"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


function App() {

  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lastScanAt, setLastScanAt] = useState(null);
  const [toast, setToast] = useState(null);
  const [reportExport, setReportExport] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [openingReportType, setOpeningReportType] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [awsProfiles, setAwsProfiles] = useState([]);
  const [selectedAwsProfile, setSelectedAwsProfile] = useState("");
  const [awsProfileValidation, setAwsProfileValidation] = useState(null);
  const [awsProfileStatus, setAwsProfileStatus] = useState("checking");
  const [isValidatingAwsProfile, setIsValidatingAwsProfile] = useState(false);

  const heroSummary = scanResult?.summary;
  const heroFindings = scanResult?.findings ?? [];

  const hasScanResult = Boolean(scanResult);

  const heroTotalChecks = hasScanResult ? heroSummary?.total_checks ?? 0 : 0;
  const heroFailedControls = hasScanResult ? heroSummary?.failed ?? 0 : 0;

  const heroServiceCount =
    hasScanResult && heroFindings.length > 0
      ? new Set(heroFindings.map((finding) => finding.service)).size
      : 0;

  const heroGeneratedReports = reportExport?.reports ? 3 : 0;

  function showToast(type, title, message) {
    setToast({
      id: Date.now(),
      type,
      title,
      message,
    });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  async function checkBackendHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/status`);
      setApiStatus(response.data);
      setBackendStatus("online");
    } catch (error) {
      setApiStatus(null);
      setBackendStatus("offline");
    }
  }

  async function loadLatestReports() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports/latest`);
      setReportExport(response.data);
    } catch (error) {
      // No reports generated yet, so keep it silent.
    }
  }

  async function loadAwsProfiles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/aws/profiles`);
      const profiles = response.data?.profiles ?? [];

      setAwsProfiles(profiles);

      if (profiles.length === 0) {
        setSelectedAwsProfile("");
        setAwsProfileValidation(null);
        setAwsProfileStatus("missing");
        return;
      }

      setSelectedAwsProfile((currentProfile) => {
        if (currentProfile && profiles.includes(currentProfile)) {
          return currentProfile;
        }

        if (profiles.includes("cloudsec-auditor")) {
          return "cloudsec-auditor";
        }

        return profiles[0];
      });

      setAwsProfileStatus("ready");
    } catch (error) {
      setAwsProfiles([]);
      setSelectedAwsProfile("");
      setAwsProfileValidation(null);
      setAwsProfileStatus("error");
    }
  }

  async function handleValidateAwsProfile(profileName = selectedAwsProfile) {
    if (!profileName) {
      showToast(
        "error",
        "No AWS profile found",
        "Configure an AWS CLI profile first, then refresh profiles."
      );
      return;
    }

    try {
      setIsValidatingAwsProfile(true);
      setAwsProfileStatus("checking");

      const response = await axios.get(
        `${API_BASE_URL}/api/aws/profiles/${encodeURIComponent(profileName)}/validate`
      );

      setAwsProfileValidation(response.data);
      setAwsProfileStatus("valid");

      showToast(
        "success",
        "AWS profile validated",
        "Profile is ready for future read-only AWS checks. No credential values were exposed."
      );
    } catch (error) {
      setAwsProfileValidation(null);
      setAwsProfileStatus("error");

      const message =
        error?.response?.data?.message ??
        "AWS profile validation failed. Check your AWS CLI configuration.";

      showToast("error", "Profile validation failed", message);
    } finally {
      setIsValidatingAwsProfile(false);
    }
  }

  useEffect(() => {
    checkBackendHealth();
    loadLatestReports();
    loadAwsProfiles();

    const healthInterval = setInterval(() => {
      checkBackendHealth();
    }, 15000);

    return () => clearInterval(healthInterval);
  }, []);
  async function handleOpenReport(reportType = "html") {
    try {
      setOpeningReportType(reportType);

      await axios.get(`${API_BASE_URL}/api/reports/latest`);

      const reportUrl = `${API_BASE_URL}/api/reports/latest/${reportType}`;

      window.open(reportUrl, "_blank", "noopener,noreferrer");

      showToast(
        "success",
        "Report opened",
        `Latest ${reportType.toUpperCase()} report is ready.`
      );
    } catch (error) {
      showToast(
        "error",
        "No report found",
        "Run a scan first to generate JSON, HTML, and Markdown reports."
      );
    } finally {
      setOpeningReportType(null);
    }
  }

  async function handleRunScan() {
    try {
      setIsScanning(true);
      setScanError("");
      setToast(null);

      if (!selectedAwsProfile) {
        throw new Error("No AWS profile selected. Refresh profiles first.");
      }

      const scanResponse = await axios.get(
        `${API_BASE_URL}/api/scan/aws/${encodeURIComponent(selectedAwsProfile)}`
      );

      setScanResult(scanResponse.data);
      setLastScanAt(new Date());

      const reportResponse = await axios.get(
        `${API_BASE_URL}/api/reports/generate/aws/${encodeURIComponent(selectedAwsProfile)}`
      );

      setReportExport(reportResponse.data);
      await loadLatestReports();

      const summary = scanResponse.data?.summary;
      const exportedAt = reportResponse.data?.reports?.exported_at;

      showToast(
        "success",
        "AWS scan and reports completed",
        `${summary?.total_checks ?? 0} real AWS checks analyzed safely${exportedAt ? ` · Reports exported at ${exportedAt}` : ""}`
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.detail ??
        error?.message ??
        "Backend is not reachable. Check FastAPI on http://127.0.0.1:8000";

      setScanError(message);

      showToast("error", "AWS scan failed", message);
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          className="h-full w-full object-cover opacity-70"
          src="/background/video2.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/45 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-slate-950/75" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(rgba(148,163,184,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <Navbar
        onRunScan={handleRunScan}
        isScanning={isScanning}
        backendStatus={backendStatus}
        apiStatus={apiStatus}
      />

      <AnimatePresence mode="wait">
        {toast && (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <section
        id="overview"
        className="relative z-10 flex min-h-screen flex-col items-center px-6 pb-20 pt-32 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mx-auto max-w-5xl"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-500/10">
            <Cloud className="h-4 w-4" />
            AWS Security Misconfiguration Scanner
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl lg:text-7xl">
            Audit AWS risks with evidence, not assumptions.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-200/85 md:text-lg">
            CloudSec Auditor is a desktop security dashboard for checking IAM, S3, EC2,
            CloudTrail, encryption, and network exposure misconfigurations with risk scoring
            and exportable reports.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950 shadow-2xl shadow-cyan-500/25 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              {isScanning ? "Scanning..." : "Run AWS Scan"}
            </button>

            <button
              onClick={() => handleOpenReport("html")}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 font-bold text-white backdrop-blur-xl transition hover:bg-white/10"
            >
              <FileText className="h-4 w-4" />
              View Sample Report
            </button>

          </div>
        </motion.div>

        <ProductPreview
          scanResult={scanResult}
          scanError={scanError}
          isScanning={isScanning}
          lastScanAt={lastScanAt}
        />

        <div className="relative z-10 mt-12 grid w-[min(860px,92vw)] grid-cols-2 gap-6 border-t border-white/10 pt-8 text-center md:grid-cols-4">
          <div>
            <p className="text-4xl font-semibold text-white">
              {String(heroTotalChecks).padStart(2, "0")}
            </p>
            <p className="mt-2 text-sm text-slate-300">Security checks</p>
          </div>

          <div>
            <p className="text-4xl font-semibold text-white">
              {String(heroServiceCount).padStart(2, "0")}
            </p>
            <p className="mt-2 text-sm text-slate-300">AWS services</p>
          </div>

          <div>
            <p className="text-4xl font-semibold text-white">
              {String(heroGeneratedReports).padStart(2, "0")}
            </p>
            <p className="mt-2 text-sm text-slate-300">Report formats</p>
          </div>

          <div>
            <p className="text-4xl font-semibold text-white">
              {String(heroFailedControls).padStart(2, "0")}
            </p>
            <p className="mt-2 text-sm text-slate-300">Failed controls</p>
          </div>
        </div>
      </section>
      <AWSProfileStatusPanel
        awsProfiles={awsProfiles}
        selectedAwsProfile={selectedAwsProfile}
        setSelectedAwsProfile={setSelectedAwsProfile}
        awsProfileValidation={awsProfileValidation}
        awsProfileStatus={awsProfileStatus}
        isValidatingAwsProfile={isValidatingAwsProfile}
        onValidateProfile={handleValidateAwsProfile}
        onRefreshProfiles={loadAwsProfiles}
      />

      <FindingsExplorerSection scanResult={scanResult} />
      <SecurityCoverageSection />
      <WorkflowSection />
      <ReportsSection
        onOpenReport={handleOpenReport}
        reportExport={reportExport}
        scanResult={scanResult}
        openingReportType={openingReportType}
      />
      <FinalCTASection
        onRunScan={handleRunScan}
        isScanning={isScanning}
        onOpenReport={handleOpenReport}
        openingReportType={openingReportType}
        apiStatus={apiStatus}
      />
    </main>
  );
}

export default App;
