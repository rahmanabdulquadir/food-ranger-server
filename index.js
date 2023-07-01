const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Food Ranger Server Running");
});

// mongodb configuration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rl1a5mc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// diff route based api's
async function run() {
  try {
    const foodCollection = client.db("foodRanger").collection("foods");
    const reviewCollection = client.db("foodRanger").collection("reviews");

    // get all the services from database
    app.get("/foods", async (req, res) => {
      const query = {};
      const cursor = foodCollection.find(query);
      const foods = await cursor.toArray();
      res.send(foods);
    });

    // get a single food item details
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get 3 services to show details on home page
    app.get("/food", async (req, res) => {
      const query = {};
      const cursor = foodCollection.find(query);
      const food = await cursor.limit(3).toArray();
      res.send(food);
    });

    // get my reviews
    app.get("/reviews", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (req.query.email) {
        query = {
          email: email,
        };
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // get all the reviews fo the customers of a particular item
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { serviceId: id };
      const cursor = reviewCollection.find(query).sort({ date: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // post review
    app.post("/reviews/:id", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // delete review
    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
          _id: new ObjectId(id)
      }

      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Food Ranger server is activated on port ${port}`);
});
