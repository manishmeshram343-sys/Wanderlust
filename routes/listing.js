const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner , validateListing} = require("../middleware.js");
const multer  = require('multer')
const {storage} = require("../cloudconfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listing.js");

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListings)
    );

//New RAUTE
router.get("/new", 
    isLoggedIn, 
    listingController.renderNewForm
);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        validateListing,
        upload.single('listing[image]'),
        wrapAsync(listingController.UpdateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );
    
//Edit raute
router.get("/:id/edit", 
    isLoggedIn ,
    isOwner,
    wrapAsync(listingController.editListings)
);

module.exports = router;