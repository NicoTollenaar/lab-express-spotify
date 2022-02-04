require('dotenv').config();
const path = require('path');

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:

const SpotifyWebApi = require('spotify-web-api-node');
const serverMethods = require('spotify-web-api-node/src/server-methods');

hbs.registerPartials(path.join(process.cwd(), 'views/partials'));

const app = express();

app.set('view engine', 'hbs');
app.set('views', process.cwd() + '/views');
app.use(express.static(process.cwd() + '/public'));

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });
  
//   Retrieve an access token
//   spotifyApi
//     .clientCredentialsGrant()
//     .then(data => {
//         spotifyApi.setAccessToken(data.body['access_token']);
//     })
//     .catch(error => console.log('Something went wrong when retrieving an access token', error));

async function getAccesToken(){
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);
    } catch(err) {
        console.log('Something went wrong when retrieving an access token, logging error in catch block: ', err);
    }
}

getAccesToken();

app.get("/home", (req, res)=> {
    res.render("home");
});

app.get("/artist-search", async (req, res)=> {
    const { searchInput } = req.query;
    let data = {};
    let selectedData = [];
    if (searchInput) {
        try {
            data = await spotifyApi.searchArtists(searchInput);
            data.body.artists.items.forEach((item) => {
                // console.log("item.id: ", item.id, typeof item.id);
                if (item.images.length > 0) {
                    selectedData.push({ name: item.name, image: item.images[0].url, href: `/albums/${item.id}`, buttonText: "View Albums"});
                } else {
                    return;
                }
            });
            // console.log("selectedData: ", selectedData);
            // res.send(data);
            res.render("artist-search-results", {inputArray: selectedData});
        } catch (err) {
            console.log("Something went wrong in /artist-search route, logging err in catch,: ", err);
        }
    } else {
        res.send("No search query -go back and try again!");
}
});

app.get("/albums/:id", async (req, res)=>{
    const { id } = req.params;
    const selectedData = [];
    try {
        const data = await spotifyApi.getArtistAlbums(id);
        data.body.items.forEach((item) => {
            if (item.images.length > 0) {
                selectedData.push({ name: item.name, image: item.images[0].url, href: `/${item.name}/${item.id}`});
            } else {
                return;
            }
        });
        // res.send({inputArray: selectedData})
        // res.send(data)
        res.render("albums-overview", {inputArray: selectedData});
    } catch(err) {
        console.log("Something went wrong getting albums,logging err in catch block: ", err);
    }
});

// app.get("/:album/:track-id", async (req, res)=>{
//     const { id } = req.params;
//     const selectedData = [];
//     console.log("Logging req.params: ", req.params);
//     console.log("Logging id: ", id);
//     try {
//         const data = await spotifyApi.getArtistAlbums(id);
//         data.body.items.forEach((item) => {
//             // console.log("item.id: ", item.id, typeof item.id);
//             if (item.images.length > 0) {
//                 selectedData.push({ name: item.name, image: item.images[0].url, href: `/${item.name}/${item.id}`});
//             } else {
//                 return;
//             }
//         });
//         res.send({inputArray: selectedData})
//         // res.render("albums.hbs", {inputArray: selectedData});
//     } catch(err) {
//         console.log("Something went wrong getting albums,logging err in catch block: ", err);
//     }
// });

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
