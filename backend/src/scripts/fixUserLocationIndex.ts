import mongoose from 'mongoose';
import { config } from '../config/env.js';

const fixUserLocationIndex = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const userCollection = db.collection('users');

    // Check current indexes on users collection
    console.log('\n📋 Current indexes on users collection:');
    const indexes = await userCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
    });

    // Look for any geospatial indexes on location field
    const geoIndexes = indexes.filter(index => 
      index.key.location === '2dsphere' || 
      index.key['location.coordinates'] === '2dsphere' ||
      JSON.stringify(index.key).includes('location') && 
      JSON.stringify(index.key).includes('2dsphere')
    );

    if (geoIndexes.length > 0) {
      console.log('\n🚨 Found problematic geospatial indexes on User collection:');
      geoIndexes.forEach(index => {
        console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
      });

      // Drop the problematic indexes
      for (const index of geoIndexes) {
        if (index.name && index.name !== '_id_') { // Never drop the _id index
          console.log(`\n🗑️  Dropping index: ${index.name}`);
          await userCollection.dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        }
      }
    } else {
      console.log('\n✅ No problematic geospatial indexes found on User collection');
    }

    // Verify Gig collection indexes are still intact
    console.log('\n📋 Verifying Gig collection indexes:');
    const gigCollection = db.collection('gigs');
    const gigIndexes = await gigCollection.indexes();
    const gigGeoIndexes = gigIndexes.filter(index => 
      JSON.stringify(index.key).includes('2dsphere')
    );

    if (gigGeoIndexes.length > 0) {
      console.log('✅ Gig collection geospatial indexes are intact:');
      gigGeoIndexes.forEach(index => {
        console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
      });
    } else {
      console.log('⚠️  No geospatial indexes found on Gig collection');
    }

    // Check for any documents with problematic location data
    console.log('\n🔍 Checking for users with problematic location data...');
    const usersWithLocation = await userCollection.find({ location: { $exists: true, $ne: null } }).toArray();
    
    console.log(`Found ${usersWithLocation.length} users with location data:`);
    usersWithLocation.forEach(user => {
      const locationType = typeof user.location;
      const locationValue = locationType === 'string' ? user.location : JSON.stringify(user.location);
      console.log(`- ${user.name} (${user.email}): ${locationType} - "${locationValue}"`);
    });

    // Final index verification
    console.log('\n📋 Final User collection indexes:');
    const finalIndexes = await userCollection.indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
    });

    console.log('\n✅ Database index fix completed successfully!');
    console.log('🔄 You can now try updating your profile again.');

  } catch (error) {
    console.error('❌ Error fixing database indexes:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixUserLocationIndex()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default fixUserLocationIndex;
