require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/mongo");
const { connectMySQL } = require("./config/mysql");

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const adminMiddleware = require("./middlewares/admin");
const authMiddleware = require("./middlewares/auth");
const shipmentRoutes = require("./routes/shipmentRoutes");
const lastViewRoutes = require("./routes/lastViewRoute");

const cartRoutes = require("./routes/cartRoutes");
const couponRoutes = require("./routes/couponRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS for production and development
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://tokit-frontend.vercel.app',
    'https://*.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => res.send("🛒 Backend running with Mongo & MySQL"));
app.use("/api/auth", authRoutes );
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin",authMiddleware,adminMiddleware, adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/lastview", lastViewRoutes);

const start = async () => {
  await connectDB();
  await connectMySQL();

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
};

start();

