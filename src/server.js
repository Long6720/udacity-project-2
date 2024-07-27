import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "../util/util.js";

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

app.get("/filteredimage", async (req, res) => {
  const { image_url } = req.query;

  if (!image_url) {
    res.status(400).send({ message: "image_url is required or malformed" });
    return;
  }

  const filteredImageIsFound = filterImageFromURL(image_url);
  console.log("filteredImageIsFound", filteredImageIsFound);

  // res.status(200).sendFile(filteredImageIsFound, () => {
  //   console.log(`filteredImageIsFound`, filteredImageIsFound);
  //   deleteLocalFiles([filteredImageIsFound]);
  // });

  filteredImageIsFound
    .then((image) => {
      res.sendFile(image, () => {
        const imagesToBeDeleted = new Array(image);
        deleteLocalFiles(imagesToBeDeleted);
      });
    })
    .catch((error) => {
      res.status(404).send({ message: "Image not found", error });
      return;
    });
});

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
