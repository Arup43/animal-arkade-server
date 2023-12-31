const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rmr0fzr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const toyCollection = client.db("animalArkade").collection("toys");

        app.get('/toys', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email }
            }
            if (req.query?.sort && req.query?.sort === 'ascending') {
                const cursor = toyCollection.find(query).sort({ price: -1 }).limit(20);
                const toys = await cursor.toArray();
                res.send(toys);
            } else if(req.query?.sort && req.query?.sort === 'descending') {
                const cursor = toyCollection.find(query).sort({ price: 1 }).limit(20);
                const toys = await cursor.toArray();
                res.send(toys);
            } else {
                const cursor = toyCollection.find(query).limit(20);
                const toys = await cursor.toArray();
                res.send(toys);
            }
        });

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const toy = await toyCollection.findOne(query);
            res.send(toy);
        });

        app.post('/toys', async (req, res) => {
            const toy = req.body;
            const result = await toyCollection.insertOne(toy);
            res.json(result);
        });

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.json(result);
        });

        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    photoUrl: req.body.photoUrl,
                    sellerEmail: req.body.sellerEmail,
                    sellerName: req.body.sellerName,
                    subCategory: req.body.subCategory,
                    price: req.body.price,
                    rating: req.body.rating,
                    availableQuantity: req.body.availableQuantity,
                },
            };
            const result = await toyCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        app.get('/search-toys', async (req, res) => {
            const query = req.query.q;
            const cursor = toyCollection.find({ name: query }).limit(20);
            const toys = await cursor.toArray();
            res.send(toys);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Animal Arkade server is running on post: ${port}`);
})