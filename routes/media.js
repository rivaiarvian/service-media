const express = require("express");
const router = express.Router();

const { index, create, deleted } = require("../controller");

router.get("/", index);
router.post("/", create);
router.delete("/:id", deleted);

module.exports = router;
