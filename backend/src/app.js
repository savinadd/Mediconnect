const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes")
const protectedRoutes = require("./routes/protectedRoutes");
;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

module.exports = app;
