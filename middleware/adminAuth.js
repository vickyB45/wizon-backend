import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  try {
    // ⭐ Debug log (remove in production)
    if (process.env.MODE === "development") {
    }

    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "wizon-admin",
      audience: "wizon-dashboard",
    });

    // Role check
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    // Attach admin to request
    req.admin = {
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    
    return res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError" 
        ? "Session expired, please login again"
        : "Invalid or expired session",
    });
  }
};