const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// const port = 3000;

app.use(cors());
app.use(express.json());

const password = encodeURIComponent("Nduku2020!@!!57");
// const uri = `mongodb+srv://root:${password}@cluster-tambula.mekiyma.mongodb.net/aidb?retryWrites=true&w=majority`;
const uri = `mongodb+srv://root:${password}@cluster-tambula.mekiyma.mongodb.net/aidb?retryWrites=true&w=majority&appName=Cluster-tambula`

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  });

const geoPointSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
}, { _id: false });

const rawSchema = new mongoose.Schema({
  uid: String,
  email: String,
  emailVerified: Boolean,
  displayName: String,
  isAnonymous: Boolean,
  photoURL: String,
  providerData: [{
    providerId: String,
    uid: String,
    displayName: String,
    email: String,
    phoneNumber: String,
    photoURL: String
  }],
  stsTokenManager: {
    refreshToken: String,
    accessToken: String,
    expirationTime: Number
  },
  createdAt: Number,
  lastLoginAt: Number,
  apiKey: String,
  appName: String
}, { _id: false });

const placeSchema = new mongoose.Schema({
  _id: String,
  date: { type: Date, default: Date.now },
  address: String,
  comment: String,
  fullName: String,
  lat: Number,
  lng: Number,
  rate: Number,
  userId: String,
  geoPoint: geoPointSchema,
  raw: rawSchema,
});

const Place = mongoose.model('VisitedPlace', placeSchema);

const router = express.Router();

// Create
router.post('/addPlace', async (req, res) => {
  const dataObject = req.body;
  try {
    const newPlace = new Place(dataObject);
    await newPlace.save();
    res.status(200).json({ message: 'Document inserted' });
  } catch (error) {
    res.status(500).json({ message: 'Error inserting document', error });
  }
});

// Read All
router.get('/places', async (req, res) => {
  try {
    const places = await Place.find({});
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error });
  }
});

// Read One
router.get('/place/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const place = await Place.findById(id);
    if (place) {
      res.status(200).json(place);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error });
  }
});

// Update
router.put('/place/:id', async (req, res) => {
  const { id } = req.params;
  const updateObject = req.body;
  try {
    const result = await Place.findByIdAndUpdate(id, updateObject, { new: true });
    if (result) {
      res.status(200).json({ message: 'Document updated' });
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error });
  }
});

// Delete
router.delete('/place/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Place.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ message: 'Document deleted' });
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error });
  }
});

app.use('/.netlify/functions/api', router);

/* app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); */

module.exports.handler = serverless(app);
