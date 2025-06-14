
import { MongoClient } from 'mongodb';

const user = "Qassem77";
const rawPass = "01118723";
const password = encodeURIComponent(rawPass);
const uri = `mongodb+srv://${user}:${password}@cluster0.zbm9qua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;

// Database operations
export const getCVsFromDB = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("cv_management");
    const collection = db.collection("cvs");
    
    const cvs = await collection.find({}).toArray();
    return cvs.map(cv => ({
      id: cv._id.toString(),
      name: cv.name,
      age: cv.age,
      nationality: cv.nationality,
      fileData: cv.fileData,
      fileName: cv.fileName,
      fileType: cv.fileType as 'pdf' | 'image',
      uploadDate: new Date(cv.uploadDate)
    }));
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return [];
  }
};

export const saveCVToDB = async (cvData: {
  name: string;
  age: number;
  nationality: string;
  fileData: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  uploadDate: Date;
}) => {
  try {
    const client = await clientPromise;
    const db = client.db("cv_management");
    const collection = db.collection("cvs");
    
    const result = await collection.insertOne(cvData);
    return result.insertedId.toString();
  } catch (error) {
    console.error('Error saving CV:', error);
    throw error;
  }
};

export const deleteCVFromDB = async (id: string) => {
  try {
    const client = await clientPromise;
    const db = client.db("cv_management");
    const collection = db.collection("cvs");
    
    const { ObjectId } = await import('mongodb');
    await collection.deleteOne({ _id: new ObjectId(id) });
    return true;
  } catch (error) {
    console.error('Error deleting CV:', error);
    throw error;
  }
};

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}
