import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;
let isConnected = false; // evita reconexões

async function conectaNaDatabase() {
    if (isConnected) return mongoose.connection;

    try {
        let mongoUrl;

        if (process.env.NODE_ENV === "test") {
            mongoServer = await MongoMemoryServer.create({
                binary: { version: "7.0.14" },
            });
            mongoUrl = mongoServer.getUri();
            console.log("Conectando ao MongoMemoryServer (teste)...");
        } else {
            mongoUrl = process.env.MONGO_URI;
            if (!mongoUrl) throw new Error("MONGO_URI não definida no .env");
        }

        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = true;
        console.log("Conectado ao Banco de Dados!");
        return mongoose.connection;
    } catch (error) {
        console.error("Erro ao conectar no MongoDB:", error.message);
        if (process.env.NODE_ENV !== "test") process.exit(1);
        throw error;
    }
}

async function disconnectTestDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        isConnected = false;
    }
    if (mongoServer) await mongoServer.stop();
}

export default conectaNaDatabase;
export { disconnectTestDB };
