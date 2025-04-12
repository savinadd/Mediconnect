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


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/doctors", doctorRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/user", userRoutes);   
app.use("/api/drugs", drugRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/activity", activityRoutes);


module.exports = app;
