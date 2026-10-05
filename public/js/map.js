mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: "map",
    style: 'mapbox://styles/mapbox/standard', // Use the standard style for the map
    center: listing.geometry.coordinates,
    zoom: 9
});

const marker = new mapboxgl.Marker({
    color: "red"
})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 23 })
            .setHTML(`
                <h4>${listing.title}</h4>
                <p>Exact Location provided after booking</p>
            `)
    )
    .addTo(map);