import express from "express";
import os from "os";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/* =====================================================
   🖥️ SERVER SYSTEM STATUS (NO DB)
   GET /api/admin/system/status
===================================================== */
router.get("/status", adminAuth, (req, res) => {
  try {
    /* ================= UPTIME ================= */
    const uptimeSeconds = process.uptime();

    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / (3600 * 24));
      seconds %= 3600 * 24;
      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      const minutes = Math.floor(seconds / 60);
      return `${days}d ${hours}h ${minutes}m`;
    };

    /* ================= MEMORY ================= */
    const memory = process.memoryUsage();
    const totalRAM_MB = Math.round(os.totalmem() / 1024 / 1024);

    // ✅ Node.js process memory (REAL metric)
    const processRAM_MB = Math.round(memory.rss / 1024 / 1024);

    /* ================= HEALTH % ================= */
    // Health based on Node process usage, not OS free RAM
    const healthPercent = Math.max(
      0,
      Math.min(
        100,
        Math.round(100 - (processRAM_MB / totalRAM_MB) * 100)
      )
    );

    /* ================= STATUS ================= */
    let status = "healthy";
    if (healthPercent < 60) status = "critical";
    else if (healthPercent < 80) status = "degraded";

    /* ================= RESPONSE ================= */
    res.json({
      success: true,

      // 🟢 STATUS
      status,
      healthPercent,

      // 🌍 ENV
      environment: process.env.NODE_ENV || "development",

      // ⏱️ UPTIME
      uptime: {
        seconds: Math.floor(uptimeSeconds),
        readable: formatUptime(uptimeSeconds),
      },

      // 🧠 MEMORY (Node Process)
      memory: {
        processRAM_MB,
        heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
        totalSystemRAM_MB: totalRAM_MB,
      },

      // ⚙️ SYSTEM INFO
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        cpuCores: os.cpus().length,
      },

      // 🕒 SERVER TIME
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch system status",
    });
  }
});

export default router;
