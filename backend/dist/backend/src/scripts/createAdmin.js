import mongoose from 'mongoose';
import { User } from '../models/index.js';
import { config } from '../config/env.js';
const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        // Admin user details
        const adminData = {
            name: 'Admin User',
            email: 'admin@quicklister.com',
            phone: '+1234567890',
            password: 'admin123456', // This will be hashed by the User model
            role: 'admin',
            status: 'active'
        };
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('❌ Admin user already exists with email:', adminData.email);
            console.log('✅ Admin details:');
            console.log('   Email:', adminData.email);
            console.log('   Role:', existingAdmin.role);
            console.log('   Status:', existingAdmin.status);
            return;
        }
        // Create admin user
        const adminUser = new User(adminData);
        await adminUser.save();
        console.log('✅ Admin user created successfully!');
        console.log('📋 Admin credentials:');
        console.log('   Email:', adminData.email);
        console.log('   Password:', adminData.password);
        console.log('   Role:', adminData.role);
        console.log('');
        console.log('🔐 You can now login to the admin panel at: http://localhost:3000/admin');
        console.log('⚠️  Remember to change the password after first login in production!');
    }
    catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
    finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    process.exit(1);
});
// Run the script
createAdminUser();
//# sourceMappingURL=createAdmin.js.map