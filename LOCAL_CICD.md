# Local CI/CD & Deployment Guide

Due to restrictions on GitHub Actions, this project uses a **Local CI/CD Ecosystem** to ensure code quality and automate deployments directly from your development environment.

## 📁 System Overview

- **Scripts**: Located in `scripts/`, these PowerShell scripts orchestrate the build, test, and deploy process.
- **Git Hooks**: Managed by **Husky**, ensuring quality checks run automatically before commits and pushes.
- **Deployment**: Handled via **Vercel CLI** triggered by local scripts.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v20+)
- **Git**
- **Vercel CLI** (for deployment):
  ```bash
  npm install -g vercel
  vercel login
  ```

### 2. Initialize Hooks
If you just cloned the repo, initialize the git hooks:
```bash
npm install
npx husky init
```

---

## 🛠️ The Pipeline (`scripts/pipeline.ps1`)

This is the master script that mimics a CI server. It performs:
1.  **Dependency Check**: Ensures `node_modules` are clean (optional).
2.  **Linting**: Runs `npm run lint`.
3.  **Testing**: Runs Unit & Integration tests with mock environment variables.
4.  **Building**: Runs `npm run build` to verify compilation.

### Usage
Run from PowerShell:
```powershell
./scripts/pipeline.ps1
```

**Options:**
- `-InstallDeps`: Force a clean install (`npm ci`) before running.
- `-SkipTests`: Skip the testing phase (useful for quick build checks).

---

## 🚢 Deployment (`scripts/deploy.ps1`)

This script automates the deployment process to Vercel. It **automatically runs the pipeline first** to prevent broken deployments.

### Usage
To deploy to **Preview** (default):
```powershell
./scripts/deploy.ps1
```

To deploy to **Production**:
```powershell
./scripts/deploy.ps1 -Environment production
```

**Options:**
- `-SkipPipeline`: Bypasses the CI checks (Not Recommended, use only for emergencies).

---

## 🛡️ Git Hooks (Automated Checks)

We use Husky to enforce quality:

1.  **Pre-Commit**: Runs `npm run lint`. If linting fails, the commit is blocked.
2.  **Pre-Push**: Runs `npm test`. If tests fail, the push is blocked.

### Bypassing Hooks (Emergency Only)
If you absolutely must bypass checks (e.g., saving work in progress):
```bash
git commit -m "msg" --no-verify
git push --no-verify
```

---

## 🆘 Manual Emergency Procedures

If the automation fails or you are in a restricted shell:

**Manual Test Run:**
```bash
# Set Mocks
$env:NEXT_PUBLIC_SUPABASE_URL="https://mock.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="mock-key"
$env:SUPABASE_SERVICE_ROLE_KEY="mock-key"

# Run
npm test
```

**Manual Deployment:**
```bash
# Preview
vercel

# Production
vercel --prod
```