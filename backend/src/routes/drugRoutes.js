const express = require("express");
const router = express.Router();
const { searchDrugs, getAllDrugs } = require("../controllers/drugController");

router.get("/", getAllDrugs);        
router.get("/search", searchDrugs);  
module.exports = router;
