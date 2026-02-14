const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");


// Admin page
router.get('/admin', async (req, res) => {
  try {
    const meals = await Meal.find().sort({ createdAt: -1 });
    res.render('admin', { meals });
  } catch (err) {
    console.error('[meals] GET /admin failed', err);
    res.status(500).send('Erreur interne');
  } 
}); 

// Keep /chef for compatibility and redirect to /admin
router.get('/chef', (req, res) => res.redirect('/meals/admin'));

// Create

const path = require('path');


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurant",
    allowed_formats: ["jpg", "png", "jpeg", "mp4"]
  }
});

const upload = multer({ storage });


// ✅ Route ajout plat (déjà OK)
router.post(
  "/add",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {

    try {

      const imagePath = req.files?.image
        ? req.files.image[0].path
        : "";

      const videoPath = req.files?.video
        ? req.files.video[0].path
        : "";

      await Meal.create({
        ...req.body,
        image: imagePath,
        video: videoPath
      });

      res.redirect("/meals/admin");

    } catch (error) {
      console.log(error);
      res.send("Erreur lors de l'ajout du plat");
    }
  }
);


// ✅ Route modification plat
router.post(
  "/edit/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {

    const updateData = { ...req.body };

    if (req.files.image) {
      updateData.image = "/uploads/" + req.files.image[0].filename;
    }

    if (req.files.video) {
      updateData.video = "/uploads/" + req.files.video[0].filename;
    }

    await Meal.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/meals/admin");
  }
);

router.post('/delete/:id', async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.redirect('/meals/admin');
  } catch (err) {
    console.error('[meals] Delete failed', err);
    res.status(500).send('Erreur lors de la suppression du plat');
  }
});


module.exports = router;
