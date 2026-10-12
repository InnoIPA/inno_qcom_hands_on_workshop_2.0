# hands-on-workshop-package — setup notes

This folder is the iQ-Foundry hands-on workshop package (YOLO26 → Q911, FP32 → INT8),
including the three Claude agent skills (`.agent/skills/`) and the local live-progress
server (`progress_server/`).

A few assets are **not** included in this commit — either because they exceed GitHub's
file size limit, or because they don't belong to this package at all. Do these once per
machine before running the workshop.

## Before you can run this package

### 1. Docker image (`innodiskorg/iqf:latest`)

No file to place — pull it directly from Docker Hub, on the Windows host, inside WSL:

```bash
docker pull innodiskorg/iqf:latest
```

This is the same image `docker_images/iqf-latest.tar.gz` was a frozen copy of (excluded
from this commit — it's ~4GB, over GitHub's 100MB file limit). Source:
[InnoIPA/iQ-Foundry — Windows_host.md](https://github.com/InnoIPA/iQ-Foundry/blob/main/Windows_host.md).

> Note: `latest` is a moving tag — it can drift from the exact image this package was
> originally built against. If something behaves unexpectedly after pulling it fresh,
> that's the first thing to suspect; check with AP team / your manager for the pinned
> version if needed.

### 2. On-device runtime venv (`iqqnn_venv.tar.gz`)

Not downloadable — there is no pre-built copy anywhere. It has to be **built on an
actual Q911 device** (not the Windows host — the wheel below is compiled for
ARM64 Linux + Python 3.12, and the venv is created with `--system-site-packages`,
so it depends on Q911's own system packages).

The two inputs it needs already ship inside this package, at
`hands-on-workshop-package/github/iQ-Foundry/`. Push them to the device, build the venv
there, then pull the result back:

```bash
# 1) From the Windows host (WSL), push the two required files to the Q911:
adb push hands-on-workshop-package/github/iQ-Foundry/requirements/target.txt /home/root/target.txt
adb push hands-on-workshop-package/github/iQ-Foundry/wheels/onnxruntime_qnn-1.23.0-cp312-cp312-linux_aarch64.whl /home/root/

# 2) adb shell into the Q911 and build the venv there:
adb shell
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv --system-site-packages .venv
source .venv/bin/activate
uv pip install -r /home/root/target.txt
uv pip install /home/root/onnxruntime_qnn-1.23.0-cp312-cp312-linux_aarch64.whl
deactivate
tar czf iqqnn_venv.tar.gz .venv
exit

# 3) Pull the built tarball back to the Windows host, into this package:
adb pull /home/root/iqqnn_venv.tar.gz hands-on-workshop-package/iqf_save/test/iq9-venv/iqqnn_venv.tar.gz
```

Source of the build recipe:
[InnoIPA/iQ-Foundry — docs/test_mode.md](https://github.com/InnoIPA/iQ-Foundry/blob/main/docs/test_mode.md)
("Direct On-Device Mode" section).

### 3. Q911 firmware image (`workshop_exmp-q911_v2.3.3_image`)

Get this from **AP team**. It does not belong inside `hands-on-workshop-package/` at all —
it's only used by the `flash-q911-image` skill, which searches for a directory matching
`*workshop_exmp-q911*_image*` anywhere under the Windows user's profile (e.g. Desktop,
Downloads). Just make sure it ends up somewhere under `C:\Users\<you>\...`.

### 4. `progress_server` dependencies

`node_modules/` is excluded from this commit (regenerable, and large). Install it
locally once:

```bash
cd hands-on-workshop-package/progress_server
npm install
```

## Complete folder structure (after all four steps above)

```
hands-on-workshop-package/
├── .agent/
│   └── skills/
│       ├── flash-q911-image/
│       ├── automate-hands-on-workshop/
│       └── flash-and-run-workshop/
├── docker_images/                      ← empty; image is pulled, not stored as a file (§1)
├── export_qai_fp32/
├── flash_image/
├── github/
│   └── iQ-Foundry/
│       ├── requirements/target.txt     ← used to build the venv (§2)
│       ├── wheels/onnxruntime_qnn-*.whl ← used to build the venv (§2)
│       └── out/                        ← created locally as you run qc / mAP / test
├── iqf_save/
│   └── test/
│       └── iq9-venv/
│           └── iqqnn_venv.tar.gz       ← you build this (§2)
├── iqs_config/
├── progress_server/
│   ├── node_modules/                   ← from `npm install` (§4)
│   ├── public/index.html
│   ├── server.js
│   ├── package.json
│   ├── start_demo.bat
│   └── README.md
├── scripts/
├── streampipe/
├── README.md
├── README_AGENTIC.md
└── QUD.1.00.94.5.Windows-AnyCPU.exe

(outside this folder, elsewhere under your Windows user profile)
workshop_exmp-q911_v2.3.3_image/        ← from AP team (§3)
```
