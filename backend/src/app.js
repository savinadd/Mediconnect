const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes")
const protectedRoutes = require("./routes/protectedRoutes");
const userRoutes = require("./routes/userRoutes");
const prescriptionRoutes = require("./routes/perscriptionRoutes")
const symptomRoutes = require("./routes/symptomRoutes");
const drugRoutes = require("./routes/drugRoutes")
const activityRoutes = require("./routes/activityRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cookieParser = require("cookie-parser");
const profileRoutes = require("./routes/profileSetupRoutes");
const helmet = require("helmet");
const hpp    = require("hpp");

const app = express();
app.use(helmet());
app.use(hpp());
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({
  origin: FRONTEND,
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));
  
app.use(express.json());
app.use(cookieParser());

app.use("/api/admin", adminRoutes);

app.use("/api/user", profileRoutes);

app.use('/api/chat', chatRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/user", userRoutes);   
app.use("/api/drugs", drugRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/activity", activityRoutes);


module.exports = app;
