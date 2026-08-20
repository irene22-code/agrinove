import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "AgroMart Backend Foundation Ready" });
  });

  // API Modules
  app.use("/api/auth", (await import("./server/routes/authRoutes")).default);
  app.use("/api/products", (await import("./server/routes/productRoutes")).default);
  app.use("/api/seller", (await import("./server/routes/sellerRoutes")).default);
  app.use("/api/buyer", (await import("./server/routes/buyerRoutes")).default);
  app.use("/api/orders", (await import("./server/routes/orderRoutes")).default);
  app.use("/api/inquiries", (await import("./server/routes/inquiryRoutes")).default);
  app.use("/api/messages", (await import("./server/routes/messageRoutes")).default);
  app.use("/api/categories", (await import("./server/routes/categoryRoutes")).default);
  app.use("/api/admin/plant-health", (await import("./server/routes/adminPlantHealthRoutes")).default);
  app.use("/api/admin", (await import("./server/routes/adminRoutes")).default);
  app.use("/api/admin/crop-calendar", (await import("./server/routes/adminCropCalendarRoutes")).default);
  app.use("/api/plant-health", (await import("./server/routes/plantHealthRoutes")).default);
  app.use("/api/contact", (await import("./server/routes/contactRoutes")).default);
  app.use("/api/ai", (await import("./server/routes/agromartAIRoutes")).default);
  app.use("/api/crop-calendar", (await import("./server/routes/cropCalendarRoutes")).default);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
