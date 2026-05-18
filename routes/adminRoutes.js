const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/authMiddleware');
const { createShipment, getAllShipments, updateShipment, deleteShipment } = require('../controllers/shipmentController');

router.use(verifyAdmin); // protect all routes below

router.post('/shipments', createShipment);
router.get('/shipments', getAllShipments);
router.put('/shipments/:id', updateShipment);
router.delete('/shipments/:id', deleteShipment);

module.exports = router;