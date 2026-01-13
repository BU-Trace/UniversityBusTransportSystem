import express from 'express';
import * as StopageController from './stopage.controller';

const router = express.Router();

router.post('/add-stopage', StopageController.addStopage);
router.put('/update-stopage/:id', StopageController.updateStopage);
router.delete('/delete-stopage/:id', StopageController.deleteStopage);
router.get('/get-all-stopages', StopageController.getAllStopages);

export default router;
