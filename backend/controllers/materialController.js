import Material from '../models/materialModel.js';

export const uploadMaterial = async (req, res) => {
  try {
    const { title, description, subject, gradeLevel, contentType, isPremium, tags } = req.body;
    
    const newMaterial = new Material({
      title,
      description,
      subject,
      gradeLevel,
      contentType,
      isPremium,
      tags: tags.split(',').map(tag => tag.trim()),
      fileUrl: req.file.location, // Assuming S3 upload
      fileSize: req.file.size,
      uploadedBy: req.user.id
    });

    await newMaterial.save();

    res.status(201).json({
      success: true,
      message: "Study material uploaded successfully",
      material: newMaterial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload material",
      error: error.message,
    });
  }
};

export const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    res.status(200).json({
      success: true,
      materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials",
      error: error.message,
    });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      res.status(404).json({
        success: false,
        message: "Material not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      material,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch material",
      error: error.message,
    });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      res.status(404).json({
        success: false,
        message: "Material not found",
      });
      return;
    }

    await material.remove();

    res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete material",
      error: error.message,
    });
  }
};
