const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;

app.setName("CloudSec Auditor");

function getAppIcon() {
  if (isDev) {
    return path.join(__dirname, "../build/icon.png");
  }

  return path.join(process.resourcesPath, "icon.png");
}


const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = "8000";
const BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

let backendProcess = null;
let backendLogFd = null;

function waitForBackend(timeoutMs = 25000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`${BACKEND_URL}/health`, (res) => {
        res.resume();

        if (res.statusCode >= 200 && res.statusCode < 500) {
          resolve(true);
        } else {
          retry();
        }
      });

      req.on("error", retry);

      req.setTimeout(1500, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error("Backend did not become ready in time."));
        return;
      }

      setTimeout(check, 700);
    };

    check();
  });
}

function getBackendExecutable() {
  if (isDev) {
    return path.join(__dirname, "../../../backend/dist/cloudsec-backend");
  }

  const binaryName = process.platform === "win32"
    ? "cloudsec-backend.exe"
    : "cloudsec-backend";

  return path.join(process.resourcesPath, "backend", binaryName);
}

function startBackend() {
  if (backendProcess) {
    return;
  }

  const backendExecutable = getBackendExecutable();

  if (!fs.existsSync(backendExecutable)) {
    console.error(`Backend executable not found: ${backendExecutable}`);
    return;
  }

  try {
    fs.chmodSync(backendExecutable, 0o755);
  } catch {
    // Ignore chmod failures on platforms that do not need it.
  }

  const userDataDir = app.getPath("userData");
  const backendWorkDir = path.join(userDataDir, "backend-runtime");
  fs.mkdirSync(backendWorkDir, { recursive: true });

  const logPath = path.join(userDataDir, "cloudsec-backend.log");
  backendLogFd = fs.openSync(logPath, "a");

  backendProcess = spawn(backendExecutable, [], {
    cwd: backendWorkDir,
    env: {
      ...process.env,
      CLOUDSEC_DESKTOP_MODE: "1",
      PYTHONUNBUFFERED: "1",
    },
    stdio: ["ignore", backendLogFd, backendLogFd],
    windowsHide: true,
    detached: false,
  });

  backendProcess.on("error", (error) => {
    console.error("Backend process error:", error);
    backendProcess = null;
  });

  backendProcess.on("exit", () => {
    backendProcess = null;
  });
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }

  backendProcess = null;

  if (backendLogFd !== null) {
    try {
      fs.closeSync(backendLogFd);
    } catch {
      // Ignore close errors.
    }

    backendLogFd = null;
  }
}


function openReportWindow(url) {
  const isLocalReport =
    url.startsWith("http://127.0.0.1:8000") ||
    url.startsWith("file://");

  if (!isLocalReport) {
    shell.openExternal(url);
    return;
  }

  const reportWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 700,
    backgroundColor: "#020617",
    title: "CloudSec Auditor Report",
    icon: getAppIcon(),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  reportWindow.loadURL(url);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#020617",
    title: "CloudSec Auditor",
    icon: getAppIcon(),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:5173");

    if (process.env.CLOUDSEC_DEVTOOLS === "1") {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openReportWindow(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  startBackend();

  try {
    await waitForBackend();
  } catch (error) {
    console.error(error);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  stopBackend();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
