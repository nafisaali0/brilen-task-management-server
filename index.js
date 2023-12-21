const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config(); //hide DBpass
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nlu12w4.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const taskCollection = client.db("brilenTaskManage").collection("tasks");

    // create new task
    app.post("/tasks", async (req, res) => {
      const newTask = req.body;

      // send data to DB
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    });
    //read or get specific task blogs by id
    app.get("/tasks", async (req, res) => {
      let query = {};
      // condition for show task based on current user
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });
    // delete task by specific id
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      // send data to DB
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });
    // update blog info by client response
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTaskInfo = req.body;
      const updatedTask = {
        $set: {
          title: updatedTaskInfo.title,
          task: updatedTaskInfo.task,
          owner_name: updatedTaskInfo.owner_name,
          owner_image: updatedTaskInfo.owner_image,
          date: updatedTaskInfo.date,
          email: updatedTaskInfo.email,
        },
      };
      const result = await taskCollection.updateOne(
        filter,
        updatedTask,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//testing server running or not
app.get("/", (req, res) => {
  res.send("Task Management Platform server is running");
});
app.listen(port, () => {
  console.log(`Task Management Platform Server is running on port ${port}`);
});
