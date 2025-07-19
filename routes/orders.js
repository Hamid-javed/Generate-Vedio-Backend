const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/ordersController");

// Create a new order
router.post("/create", ordersController.create);

// Get order by ID
router.get("/:orderId", ordersController.getById);

// Update order
router.put("/:orderId", ordersController.update);

// Get orders by email
router.get("/email/:email", ordersController.getByEmail);

// Get all orders (admin only)
router.get("/", ordersController.getAll);

// Delete order
router.delete("/:orderId", ordersController.delete);

module.exports = router;
