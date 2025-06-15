
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';

export interface CVDocument {
  _id?: string;
  id: string;
  name: string;
  age: number;
  nationality: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  fileData: string; // base64 encoded file data
  uploadDate: Date;
}

const uri = "mongodb+srv://Qassem77:01118723@cluster0.zbm9qua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let client: MongoClient | null = null;
let db: Db | null = null;

export const connectToMongoDB = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    db = client.db("cv_database");
    console.log("Successfully connected to MongoDB!");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

export const getCVCollection = async (): Promise<Collection<CVDocument>> => {
  const database = await connectToMongoDB();
  return database.collection<CVDocument>("cvs");
};

export const closeMongoDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

// Utility functions for CV operations
export const saveCVToMongoDB = async (cvData: Omit<CVDocument, '_id'>): Promise<string> => {
  try {
    const collection = await getCVCollection();
    const result = await collection.insertOne(cvData);
    return result.insertedId.toString();
  } catch (error) {
    console.error("Error saving CV to MongoDB:", error);
    throw error;
  }
};

export const getCVsFromMongoDB = async (): Promise<CVDocument[]> => {
  try {
    const collection = await getCVCollection();
    const cvs = await collection.find({}).toArray();
    return cvs;
  } catch (error) {
    console.error("Error fetching CVs from MongoDB:", error);
    throw error;
  }
};

export const deleteCVFromMongoDB = async (id: string): Promise<boolean> => {
  try {
    const collection = await getCVCollection();
    const result = await collection.deleteOne({ id: id });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting CV from MongoDB:", error);
    throw error;
  }
};
