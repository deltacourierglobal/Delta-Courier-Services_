const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');

router.post('/', shipmentController.createShipment);
router.get('/', shipmentController.getAllShipments);
router.get('/:trackingNumber', shipmentController.getShipmentByTrackingNumber);
router.put('/:trackingNumber', shipmentController.updateShipment);
router.delete('/:trackingNumber', shipmentController.deleteShipment);

module.exports = router;