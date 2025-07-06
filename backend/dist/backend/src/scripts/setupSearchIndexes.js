import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Gig, User } from '../models/index.js';
/**
 * Setup optimized MongoDB indexes for comprehensive search functionality
 * Run this script to ensure all necessary indexes are created for optimal search performance
 */
async function setupSearchIndexes() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(config.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('🔄 Setting up search indexes...');
        // === GIG SEARCH INDEXES ===
        // Helper function to create index if it doesn't exist
        const createIndexSafely = async (collection, indexSpec, options) => {
            try {
                await collection.createIndex(indexSpec, options);
                console.log(`✅ Created index: ${options.name}`);
            }
            catch (error) {
                if (error.code === 85) {
                    console.log(`ℹ️ Index ${options.name} already exists with different name`);
                }
                else {
                    console.log(`⚠️ Could not create index ${options.name}: ${error.message}`);
                }
            }
        };
        // 1. Comprehensive text search index with weights
        await createIndexSafely(Gig.collection, {
            title: 'text',
            description: 'text',
            'skills.name': 'text',
            category: 'text',
            subCategory: 'text',
            'location.address': 'text',
            'location.city': 'text',
            'location.state': 'text'
        }, {
            weights: {
                title: 10, // Title is most important
                'skills.name': 8, // Skills are very important
                category: 6, // Category is important
                description: 4, // Description has some weight
                subCategory: 3, // SubCategory has less weight
                'location.city': 2, // Location has least weight
                'location.state': 2,
                'location.address': 1
            },
            name: 'search_text_index',
            background: true
        });
        // 2. Geospatial index for location-based search
        await createIndexSafely(Gig.collection, { 'location.coordinates': '2dsphere' }, { name: 'search_geo_index', background: true });
        // 3. Essential compound indexes for performance
        await createIndexSafely(Gig.collection, { status: 1, postedAt: -1 }, { name: 'search_status_date_index', background: true });
        await createIndexSafely(Gig.collection, { category: 1, status: 1, postedAt: -1 }, { name: 'search_category_status_index', background: true });
        await createIndexSafely(Gig.collection, { 'payment.rate': 1, status: 1 }, { name: 'search_payment_index', background: true });
        await createIndexSafely(Gig.collection, { urgency: 1, postedAt: -1 }, { name: 'search_urgency_index', background: true });
        await createIndexSafely(Gig.collection, { posterId: 1, status: 1 }, { name: 'search_poster_index', background: true });
        console.log('✅ Processed gig indexes');
        // === USER SEARCH INDEXES ===
        // Text search for users
        await createIndexSafely(User.collection, {
            name: 'text',
            bio: 'text',
            location: 'text'
        }, {
            weights: {
                name: 10,
                location: 5,
                bio: 3
            },
            name: 'search_user_text_index',
            background: true
        });
        // Location index for users
        await createIndexSafely(User.collection, { location: 1 }, { name: 'search_user_location_index', background: true });
        console.log('✅ Processed user indexes');
        // List all indexes to verify
        console.log('\n📋 Current Gig indexes:');
        const gigIndexes = await Gig.collection.listIndexes().toArray();
        gigIndexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        console.log('\n📋 Current User indexes:');
        const userIndexes = await User.collection.listIndexes().toArray();
        userIndexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        console.log('\n✅ Search indexes setup completed successfully!');
        console.log('🚀 Search functionality is ready to use');
    }
    catch (error) {
        console.error('❌ Error setting up search indexes:', error);
        throw error;
    }
    finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}
// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupSearchIndexes()
        .then(() => {
        console.log('✅ Search indexes setup completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Search indexes setup failed:', error);
        process.exit(1);
    });
}
export { setupSearchIndexes };
//# sourceMappingURL=setupSearchIndexes.js.map