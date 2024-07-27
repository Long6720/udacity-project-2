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
  const { image_url } = req.query.image_url.toString();

  if (!image_url) {
    res.status(400).send({ message: "image_url is required or malformed" });
    return;
  }

  // create a regex to validate the image_url
  const expression =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
  const regex = new RegExp(expression);

  // validate if the image_url is well formed
  if (!image_url.match(regex)) {
    res.status(400).send({ message: "image_url is required or malformed" });
    return;
  }

  // validate the type of the image
  if (
    !image_url.toLowerCase().endsWith(".jpeg") &&
    !image_url.toLowerCase().endsWith(".jpg") &&
    !image_url.toLowerCase().endsWith(".png") &&
    !image_url.toLowerCase().endsWith(".bmp") &&
    !image_url.toLowerCase().endsWith(".tiff")
  ) {
    res.status(400).send({ message: "image not supported" });
    return;
  }

  const filteredImages = filterImageFromURL(image_url);

  filteredImages
    .then((image) => {
      res.sendFile(image, () => {
        const imagesToBeDeleted = new Array(image);
        deleteLocalFiles(imagesToBeDeleted);
      });
    })
    .catch((error) => {
      res.status(404).send({ message: "Image not found" });
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
