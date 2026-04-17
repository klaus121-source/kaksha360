import express from 'express';
import { upload, uploadFileToS3 } from '../middlewares/uploadMaterialToS3.js';
import { uploadMaterial, getAllMaterials, getMaterialById, deleteMaterial } from '../controllers/materialController.js';
import { protect, adminOrInstructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/upload', protect, adminOrInstructor, upload.single('file'), async (req, res, next) => {
  try {
    const fileUrl = await uploadFileToS3(req.file.path, req.file.filename);
    req.body.fileUrl = fileUrl;
    next();
  } catch (err) {
    next(err);
  }
}, uploadMaterial);

router.get('/', protect, getAllMaterials);
router.get('/:id', protect, getMaterialById);
router.delete('/:id', protect, adminOrInstructor, deleteMaterial);

export default router;
