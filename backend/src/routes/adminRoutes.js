    const express = require("express");
    const router = express.Router();
    const { getAdminSummary, getAllUsers, deleteUser, getDoctors, getPatients, getAdmins } = require("../controllers/adminController");
    const { authenticateToken } = require("../middlewares/authMiddleware");
    const { authorizeRoles } = require("../middlewares/roleMiddleware");

    router.get("/summary", authenticateToken, authorizeRoles("admin"), getAdminSummary);
    router.get("/users", authenticateToken, authorizeRoles("admin"), getAllUsers);
    router.get("/doctors", authenticateToken, authorizeRoles("admin"), getDoctors);   
    router.get("/patients", authenticateToken, authorizeRoles("admin"), getPatients);  
    router.get("/admins", authenticateToken, authorizeRoles("admin"), getAdmins);  

    router.delete("/delete/:userId", authenticateToken, authorizeRoles("admin"), deleteUser);





    module.exports = router;