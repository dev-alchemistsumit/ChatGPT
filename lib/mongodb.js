import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('"Invalid/Missing environment variable:"MONGODB_URI"');
}
const uri = process.env.MONGODB_URI;
const options = {};

// let client;
// let clientPromise;

// if (process.env.NODE_ENV === "development") {
//In development mode , use a global variable so that the value
// is preserved across module reloads caused by HMR(Hot Module Replacement).

//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// export default clientPromise;

//-----------------------------------------------------------------------------------------------
// working code by coding with harry but creating an issue at my END.
// if (process.env.NODE_ENV === "development") {
//   //In development mode , use a global variable so that the value
//   // is preserved across module reloads caused by HMR(Hot Module Replacement).
//   let globalWithMongo;

//   if (!globalWithMongo._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     globalWithMongo._mongoClientPromise = client.connect();
//   }
//   clientPromise = globalWithMongo._mongoClientPromise;
// } else {
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// export default clientPromise;
//---------------------------------------------------------------------------------------
// working code by ME but creating new object all the time which is connecting with the MongoClient directly.
// if (!process.env.MONGODB_URI) {
//   throw new Error('"Invalid/Missing environment variable:"MONGODB_URI"');
// }
// const uri = process.env.MONGODB_URI;
// const options = {};

// let client;
// let clientPromise;

// if (process.env.NODE_ENV === "development") {
//   //In development mode , use a global variable so that the value
//   // is preserved across module reloads caused by HMR(Hot Module Replacement).

//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// export default clientPromise;

//---------------------------------------------------------------------------------------------
//tyring this new code from stackoverflow

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // If `globalWithMongo` is not already defined, initialize it as an object
  if (typeof global.globalWithMongo === "undefined") {
    global.globalWithMongo = {};
  }

  // Use the `globalWithMongo` object to store the `_mongoClientPromise`
  if (!global.globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global.globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = global.globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

//it worked but keeping all above code for future reference.
