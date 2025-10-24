// queries.js
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // or Atlas URI
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("plp_bookstore");
    const books = db.collection("books");

    // --- Task 2: Basic CRUD ---
    console.log("=== Basic Queries ===");
    console.log(await books.find({ genre: "Self-help" }).toArray());
    console.log(await books.find({ published_year: { $gt: 2010 } }).toArray());
    console.log(await books.find({ author: "George Orwell" }).toArray());
    await books.updateOne({ title: "1984" }, { $set: { price: 1500 } });
    await books.deleteOne({ title: "The Hobbit" });

    // --- Task 3: Advanced Queries ---
    console.log("=== Advanced Queries ===");
    console.log(
      await books
        .find({ in_stock: true, published_year: { $gt: 2010 } })
        .project({ title: 1, author: 1, price: 1, _id: 0 })
        .sort({ price: 1 }) // ascending
        .limit(5)
        .skip(0)
        .toArray()
    );

    // --- Task 4: Aggregation ---
    console.log("=== Aggregation Pipelines ===");
    console.log(
      await books
        .aggregate([
          { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
        ])
        .toArray()
    );

    console.log(
      await books
        .aggregate([
          { $group: { _id: "$author", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 }
        ])
        .toArray()
    );

    console.log(
      await books
        .aggregate([
          {
            $group: {
              _id: {
                decade: { $floor: { $divide: ["$published_year", 10] } }
              },
              totalBooks: { $sum: 1 }
            }
          }
        ])
        .toArray()
    );

    // --- Task 5: Indexing ---
    await books.createIndex({ title: 1 });
    await books.createIndex({ author: 1, published_year: 1 });
    const explain = await books.find({ title: "Sapiens" }).explain("executionStats");
    console.log("Explain result:", explain.executionStats);

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
