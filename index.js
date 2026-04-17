const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PlantMates server is getting hotter");
});

//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v7u164c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-enjhdkr-shard-00-00.v7u164c.mongodb.net:27017,ac-enjhdkr-shard-00-01.v7u164c.mongodb.net:27017,ac-enjhdkr-shard-00-02.v7u164c.mongodb.net:27017/?ssl=true&replicaSet=atlas-13p06k-shard-0&authSource=admin&appName=Cluster0`;


const uri =
  process.env.NODE_ENV === "production"
    ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v7u164c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    : `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-enjhdkr-shard-00-00.v7u164c.mongodb.net:27017,ac-enjhdkr-shard-00-01.v7u164c.mongodb.net:27017,ac-enjhdkr-shard-00-02.v7u164c.mongodb.net:27017/?ssl=true&replicaSet=atlas-13p06k-shard-0&authSource=admin&appName=Cluster0`;

console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }

    const featureGardenCollection = client
      .db("plantmatesDB")
      .collection("featuresGarden");

    const tipsCollection = client.db("plantmatesDB").collection("tips");

    app.get("/features-garden", async (req, res) => {
      const result = await featureGardenCollection
        .find({ status: "Active" })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // read garden profiles data
    app.get("/gardeners-profile", async (req, res) => {
      const result = await featureGardenCollection.find().toArray();
      res.send(result);
    });

    // read tips data
    app.get("/tips", async (req, res) => {
      try {
        const result = await tipsCollection.find().toArray();
        res.send(result);
         
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch tips" });
      }
    });

    app.get("/mydata/:email", async (req, res) => {
      const email = req.params.email;
      const result = await tipsCollection.find({ email }).toArray();
      res.send(result);
    });

    app.get("/tips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tipsCollection.findOne(query);
      res.send(result);
    });

    // create tips data
    app.post("/tips", async (req, res) => {
      const newTips = req.body;
      const result = await tipsCollection.insertOne(newTips);
      res.send(result);
    });

    // update tips data
    app.put("/tips/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTips = req.body;
      const updateDoc = {
        $set: updateTips,
      };
      const result = await tipsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // patch
    app.patch("/likes/:id", async (req, res) => {
      const id = req.params.id;
      const likeData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: likeData,
      };
      const result = await tipsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete data
    app.delete("/tips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tipsCollection.deleteOne(query);
      res.send(result);
    });

    //Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}
run().catch(console.dir);
// module.exports = app;

app.listen(port, () => {
  console.log(`PlantMates server is running on port: ${port}`);
}); 

