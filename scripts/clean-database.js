#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mikrouslugi';

async function cleanDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    console.log('\n📊 Current database state:');
    const collections = ['users', 'products', 'orders', 'payments', 'inventories'];
    
    for (const collection of collections) {
      const count = await db.collection(collection).countDocuments();
      console.log(`   ${collection}: ${count} documents`);
    }

    // Find admin user to preserve
    const adminUser = await db.collection('users').findOne({
      email: 'test@example.com',
      role: 'admin'
    });

    if (!adminUser) {
      console.log('❌ Admin user test@example.com not found!');
      return;
    }

    console.log(`\n🛡️  Preserving admin user: ${adminUser.email} (${adminUser.name})`);

    console.log('\n🧹 Cleaning collections...');

    // Delete all products
    const productsResult = await db.collection('products').deleteMany({});
    console.log(`   ✅ Products deleted: ${productsResult.deletedCount}`);

    // Delete all orders
    const ordersResult = await db.collection('orders').deleteMany({});
    console.log(`   ✅ Orders deleted: ${ordersResult.deletedCount}`);

    // Delete all payments
    const paymentsResult = await db.collection('payments').deleteMany({});
    console.log(`   ✅ Payments deleted: ${paymentsResult.deletedCount}`);

    // Delete all inventory
    const inventoryResult = await db.collection('inventories').deleteMany({});
    console.log(`   ✅ Inventory deleted: ${inventoryResult.deletedCount}`);

    // Delete all users except admin
    const usersResult = await db.collection('users').deleteMany({
      _id: { $ne: adminUser._id }
    });
    console.log(`   ✅ Users deleted: ${usersResult.deletedCount} (kept admin)`);

    console.log('\n📊 Final database state:');
    for (const collection of collections) {
      const count = await db.collection(collection).countDocuments();
      console.log(`   ${collection}: ${count} documents`);
    }

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log(`👤 Remaining admin user: ${adminUser.email}`);
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the cleanup
cleanDatabase();