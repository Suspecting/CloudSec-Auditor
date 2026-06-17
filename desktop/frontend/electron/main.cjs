const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const isDev = !app.isPackaged;

app.setName("CloudSec Auditor");

const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = "8000";
const BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

let backendProcess = null;

function waitForBackend(timeoutMs = 20000) {
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

function startBackend() {
  if (backendProcess) {
    return;
  }

  const projectRoot = path.join(__dirname, "../../..");
  const backendDir = path.join(projectRoot, "backend");

  const pythonCandidates = process.platform === "win32"
    ? ["python", "py"]
    : [
        path.join(backendDir, ".venv", "bin", "python"),
        "python3",
        "python",
      ];

  const args = [
    "-m",
    "uvicorn",
    "main:app",
    "--host",
    BACKEND_HOST,
    "--port",
    BACKEND_PORT,
  ];

  for (const pythonCmd of pythonCandidates) {
    try {
      backendProcess = spawn(pythonCmd, args, {
        cwd: backendDir,
        env: {
          ...process.env,
          CLOUDSEC_DESKTOP_MODE: "1",
          PYTHONUNBUFFERED: "1",
        },
        stdio: "ignore",
        detached: false,
      });

      backendProcess.on("error", () => {
        backendProcess = null;
      });

      backendProcess.on("exit", () => {
        backendProcess = null;
      });

      return;
    } catch {
      backendProcess = null;
    }
  }
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }

  backendProcess = null;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#020617",
    title: "CloudSec Auditor",
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
    shell.openExternal(url);
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
