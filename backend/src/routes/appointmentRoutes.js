const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const ctrl = require("../controllers/appointmentController");

router.post(
  "/availability",
  authenticateToken,
  authorizeRoles("doctor"),
  asyncHandler(ctrl.addAvailability)
);
router.get(
  "/availability/my",
  authenticateToken,
  authorizeRoles("doctor"),
  asyncHandler(ctrl.getMyAvailability)
);

router.get(
  "/availability",
  authenticateToken,
  asyncHandler(ctrl.getAvailability)
);

router.post(
  "/book",
  authenticateToken,
  authorizeRoles("patient"),
  asyncHandler(ctrl.bookAppointment)
);
router.get(
    "/appointments/patient/my",
    authenticateToken,
    authorizeRoles("patient"),
    asyncHandler(ctrl.getMyPatientAppointments)
  );
  
router.get(
  "/appointments/my",
  authenticateToken,
  authorizeRoles("doctor"),
  asyncHandler(ctrl.getMyAppointments)
);
router.put(
    '/:id/approve',
    authenticateToken,
    authorizeRoles('doctor'),
    asyncHandler(ctrl.approveAppointment)
  );
  router.put(
    '/:id/cancel',
    authenticateToken,
    authorizeRoles('doctor'),
    asyncHandler(ctrl.cancelAppointment)
  );
  router.delete(
    "/availability/:id",
    authenticateToken,
    authorizeRoles("doctor"),
    asyncHandler(ctrl.deleteAvailability)
  );
  
  router.get(
    "/appointments/patient/my",
    authenticateToken,
    authorizeRoles("patient"),
    asyncHandler(ctrl.getMyPatientAppointments)
  );
  
  
module.exports = router;
