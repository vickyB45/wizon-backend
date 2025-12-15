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
    const uptimeSeconds = process.uptime();

    // convert uptime to readable format
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / (3600 * 24));
      seconds %= 3600 * 24;
      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      const minutes = Math.floor(seconds / 60);

      return `${days}d ${hours}h ${minutes}m`;
    };

    const memory = process.memoryUsage();
    const totalRAM = os.totalmem();
    const freeRAM = os.freemem();

    res.json({
      success: true,

      // 🟢 BASIC STATUS
      status: "healthy",
      environment: process.env.NODE_ENV || "development",

      // ⏱️ UPTIME
      uptime: {
        seconds: Math.floor(uptimeSeconds),
        readable: formatUptime(uptimeSeconds),
      },

      // 🧠 MEMORY
      memory: {
        usedMB: Math.round(memory.rss / 1024 / 1024),
        heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
        totalRAM_MB: Math.round(totalRAM / 1024 / 1024),
        freeRAM_MB: Math.round(freeRAM / 1024 / 1024),
      },

      // ⚙️ SYSTEM INFO (safe)
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