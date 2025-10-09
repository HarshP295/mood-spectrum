import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    } as mongoose.ConnectOptions;

    await mongoose.connect(mongoURI, options);
    
    console.log('📦 MongoDB Atlas connection established');
    
    // Handle connection events
    const db = mongoose.connection;
    
    db.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    db.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    db.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};
