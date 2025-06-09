import mongoose from 'mongoose';
import { config } from '../config/env.js';
import Gig from '../models/Gig.js';

async function checkGigs() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to database');

    // Get all gigs
    const allGigs = await Gig.find({}).select('title status expiresAt postedAt');
    console.log(`\nTotal gigs in database: ${allGigs.length}`);
    console.log('\nAll gigs:');
    allGigs.forEach((gig, index) => {
      console.log(`${index + 1}. ${gig.title}`);
      console.log(`   Status: ${gig.status}`);
      console.log(`   ExpiresAt: ${gig.expiresAt || 'Not set'}`);
      console.log(`   Posted: ${gig.postedAt}`);
      console.log('');
    });

    // Get only posted gigs
    const postedGigs = await Gig.find({ status: 'posted' });
    console.log(`\nGigs with status 'posted': ${postedGigs.length}`);

    // Get posted gigs with valid expiry
    const validGigs = await Gig.find({ 
      status: 'posted',
      expiresAt: { $gte: new Date() }
    });
    console.log(`Gigs with status 'posted' and not expired: ${validGigs.length}`);

    // Get posted gigs without expiry date
    const noExpiryGigs = await Gig.find({ 
      status: 'posted',
      expiresAt: { $exists: false }
    });
    console.log(`Gigs with status 'posted' but no expiry date: ${noExpiryGigs.length}`);

    // Get expired gigs
    const expiredGigs = await Gig.find({ 
      status: 'posted',
      expiresAt: { $lt: new Date() }
    });
    console.log(`Gigs with status 'posted' but expired: ${expiredGigs.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkGigs(); 