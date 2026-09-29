<h1 align="center"><span>🚀Hands-On Workshop🔥</span> Prep Site</h1>

<p align="center">
  <marquee direction="up" scrollamount="3" height="100px" style="background-color: #0d1117; border: 1px dashed #3b82f6; padding: 10px; border-radius: 6px; width: 100px; text-align: center;">
    <span style="font-size: 22px;">🚀</span><br>
    <span style="color: #ff4500; font-size: 16px;">🔥</span><br>
    <span style="color: #ff8c00;">*</span><br>
    <span style="color: #ffd700;">.</span><br>
    <span style="color: #555;">.</span>
  </marquee>
</p>

<p align="center">
  👉 <b>[<a href="https://innoipa.github.io/inno_qcom_hands_on_workshop_2.0/" style="color: #ff69b4; text-decoration: none;">Click Here to Access Web Platform</a>]</b> 👈
</p>

---

A self-contained, browser-native prep site for the **Qualcomm AI Hub × YOLO26 BYOM** workshop — pre-install → flashing → day-of script (FP32 → INT8 on the EXMP-Q911) → handouts. No cloning or downloads needed; bilingual (中文/English), dark/light theme.

> **📅 Phased release.** Only **Overview** and **Pre-Install** are open now. **Flashing**, **Workshop Day Script**, **Handouts**, and **AI Tutorial** open on the workshop day (**2026.10.14, Wed**) — Flashing/Handouts show a disabled "Soon" badge until then.

---

## 🚀 Key Modules & Web Pages

### 1. 🟢 [Overview](https://innoipa.github.io/inno_qcom_hands_on_workshop_2.0/) — Live now
The landing page and orientation center for the event.
* **Prerequisite Fast-Track:** direct entry into the Pre-Install guide.
* **Interactive Agenda:** full timeline of the workshop day, speaker-by-speaker.
* **Event Details:** date, time, and venue (2026.10.14, Wed).
<img width="1385" height="735" alt="overview_preview" src="uploads\previews\overview_preview.png" />

### 2. 🟢 [Pre-install Guide](https://innoipa.github.io/inno_qcom_hands_on_workshop_2.0/Pre-Install%20-%20Innodisk%20x%20Qualcomm%20Workshop.html) — Live now
"Get the Toolchain Ready" — a Windows-focused environment prep dashboard.
* **Walkthrough Video:** short preview of the whole pre-install flow up top.
* **Step-by-Step Install:** copy-paste blocks for **QSC**, **PCAT**, **QUD**, and **WSL2 + Ubuntu-22.04** — all on one Windows 11 host.
<img width="1337" height="846" alt="Pre_install" src="uploads\previews\Pre_install.png" />

### 3. 🔒 Windows Flashing Guide — Opens workshop day
An 8-step visual walkthrough for flashing the image onto the EXMP-Q911.
* **Board Prep:** EDL mode jumper, xPCATApp, connect the Q911.
* **Flash & Boot:** pick the image and UFS type, run the download, jumper back to Normal, boot in.
<img width="1328" height="842" alt="flashing_preview" src="uploads\previews\flashing_preview.png" />

### 4. 🔒 Workshop Day Script — Opens workshop day
The core hands-on walkthrough: **Qualcomm AI Hub × YOLO26 — FP32 → INT8, deployed on-device.** Steps 0 through 6.
* **Offline-First:** AI Hub-dependent steps (4, 5.2, 5.5) have an offline/online toggle — offline is the default so nothing needs venue WiFi.
* **Watch, Verify, Troubleshoot:** a short tutorial video per step, collapsible "what a good run looks like" logs, and a troubleshooting shortcut under each step.
<img width="1328" height="842" alt="script_preview" src="uploads\previews\script_preview.png" />

### 5. 🔒 Handouts — Opens workshop day
The on-site reference dashboard for physical and open-source materials.
* **Checklist:** what to bring (a Windows 11 laptop) vs. what's provided (EXMP-Q911, cables, monitor, UVC camera).
* **Resource Portals:** links to iQ-Studio, iQ-Foundry, the Workshop Day Script, and the workshop package download.
<img width="1328" height="842" alt="handouts_preview" src="uploads\previews\handouts_preview.png" />

### 6. 🔒 AI Tutorial (Agent Skill) — Opens workshop day, optional
Linked from Handouts. Runs the same flash-to-live-demo pipeline end-to-end via an AI coding agent (Claude Code or Codex) instead of the manual script.
* **Three Skills:** `flash-q911-image`, `automate-hands-on-workshop`, `flash-and-run-workshop` — what each does and when to use it.
* **One Prompt to Start:** a single copy-paste prompt kicks off the whole agent-driven run.
<img width="1328" height="842" alt="ai_tutorial_preview" src="uploads\previews\ai_tutorial_preview.png" />

---

## 🚦 How to Use This Site

No Git or local server needed — just open it in a browser.

1. Open the link your coordinators shared.
2. **Prep at home:** work through **Pre-Install** (QSC, PCAT, QUD, WSL2 + Ubuntu-22.04).
3. **On the day:** follow **Flashing**, then run **Script**'s Steps 0–6 in order (offline mode by default).
4. **Stuck?** Use the "Having trouble?" shortcut under any step.

---

## 📄 License

This project is licensed under the MIT License - see the [MIT-LICENSE](MIT-LICENSE) file for details.
