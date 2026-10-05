const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path :"reviews",
        populate:{
            path : "author",
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error", " listing you requested for does not exist");
        return res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
}

module.exports.createListings = async (req, res, next) => {
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send()
    const features = response.body.features;

    if (!features || features.length === 0) {
        req.flash("error", "Invalid location. Please enter a valid location.");
        return res.redirect("/listings/new");
    }

    const geometry = features[0].geometry;

    if (!geometry || !geometry.coordinates) {
        req.flash("error", "Location coordinates not found.");
        return res.redirect("/listings/new");
    }

    const url = req.file.path;
    const filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = {
        type: geometry.type,
        coordinates: geometry.coordinates
    };
    let savedlisting = await newListing.save();
    console.log(savedlisting);
    req.flash("success", "New listing created!");
    res.redirect("/listings");
}


module.exports.editListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", " listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing , originalImageUrl});
}

module.exports.UpdateListing = async (req, res) => {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }

        req.flash("success", " Listing updated !");
        res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", " listing deleted!");
    console.log(deletedListing);
    res.redirect("/listings");
}