require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { connectDB } = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Report = require('../models/Report');

const CATEGORIES = [
  { name: 'Overflowing Dustbin', icon: '🗑️', description: 'Garbage bin is overflowing and needs immediate clearing', color: '#ef4444' },
  { name: 'Broken Dustbin', icon: '🪣', description: 'Dustbin is damaged or broken', color: '#f97316' },
  { name: 'Illegal Dumping', icon: '🚯', description: 'Garbage dumped illegally in open areas', color: '#dc2626' },
  { name: 'Sewage Overflow', icon: '💧', description: 'Sewage or drain overflow causing health hazard', color: '#7c3aed' },
  { name: 'Dead Animal', icon: '⚠️', description: 'Dead animal on road or public area', color: '#b45309' },
  { name: 'Open Burning', icon: '🔥', description: 'Open burning of garbage causing pollution', color: '#ea580c' },
  { name: 'Uncollected Garbage', icon: '🧹', description: 'Scheduled garbage collection missed', color: '#65a30d' },
  { name: 'Dirty Public Area', icon: '🏚️', description: 'Park or public space is littered and unclean', color: '#0891b2' },
];

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding CleanCity database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Report.deleteMany({}),
  ]);

  // Create categories
  const categories = await Category.insertMany(CATEGORIES);
  console.log(`✅ Created ${categories.length} categories`);

  // Create admin
  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@cleancity.com',
    passwordHash: 'Admin@123',
    role: 'admin',
    city: 'Mumbai',
    isVerified: true,
  });
  console.log('✅ Admin created — admin@cleancity.com / Admin@123');

  // Create Nagar Palika staff
  const npStaff = await User.create({
    name: 'Rajesh Kumar',
    email: 'np@cleancity.com',
    passwordHash: 'Staff@123',
    role: 'nagarpalika',
    city: 'Mumbai',
    isVerified: true,
  });
  console.log('✅ NP Staff created — np@cleancity.com / Staff@123');

  // Create 2 workers
  const worker1 = await User.create({
    name: 'Suresh Patil',
    email: 'worker1@cleancity.com',
    passwordHash: 'Worker@123',
    role: 'worker',
    city: 'Mumbai',
    nagarPalikaId: npStaff._id,
    isVerified: true,
  });
  const worker2 = await User.create({
    name: 'Anita Sharma',
    email: 'worker2@cleancity.com',
    passwordHash: 'Worker@123',
    role: 'worker',
    city: 'Mumbai',
    nagarPalikaId: npStaff._id,
    isVerified: true,
  });
  console.log('✅ 2 Workers created');

  // Create citizen
  const citizen = await User.create({
    name: 'Priya Desai',
    email: 'citizen@cleancity.com',
    passwordHash: 'Citizen@123',
    role: 'citizen',
    city: 'Mumbai',
    isVerified: true,
  });
  console.log('✅ Citizen created — citizen@cleancity.com / Citizen@123');

  // Create sample reports around Mumbai
  const sampleLocations = [
    { coordinates: [72.8777, 19.0760], address: 'Dadar, Mumbai, Maharashtra' },
    { coordinates: [72.8656, 19.0176], address: 'Bandra West, Mumbai, Maharashtra' },
    { coordinates: [72.8311, 18.9388], address: 'Colaba, Mumbai, Maharashtra' },
    { coordinates: [72.9081, 19.1136], address: 'Andheri East, Mumbai, Maharashtra' },
    { coordinates: [72.8258, 19.1724], address: 'Borivali, Mumbai, Maharashtra' },
    { coordinates: [72.8479, 19.2183], address: 'Kandivali, Mumbai, Maharashtra' },
    { coordinates: [72.8856, 19.0633], address: 'Kurla, Mumbai, Maharashtra' },
    { coordinates: [72.8553, 19.0144], address: 'Mahim, Mumbai, Maharashtra' },
  ];

  const statuses = ['pending', 'assigned', 'in_progress', 'completed'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  const reports = [];
  for (let i = 0; i < 20; i++) {
    const loc = sampleLocations[i % sampleLocations.length];
    const status = statuses[i % statuses.length];
    const reportData = {
      reportedBy: i % 3 === 0 ? null : citizen._id,
      isAnonymous: i % 3 === 0,
      photo: `https://picsum.photos/seed/${i + 100}/800/600`,
      location: { type: 'Point', coordinates: loc.coordinates, address: loc.address },
      category: categories[i % categories.length]._id,
      description: `Sample complaint #${i + 1} for testing purposes.`,
      status,
      priority: priorities[i % priorities.length],
      upvoteCount: Math.floor(Math.random() * 15),
      statusHistory: [{ status: 'pending', note: 'Complaint submitted' }],
    };
    if (['assigned', 'in_progress', 'completed'].includes(status)) {
      reportData.assignedTo = i % 2 === 0 ? worker1._id : worker2._id;
      reportData.assignedBy = npStaff._id;
      reportData.assignedAt = new Date();
      reportData.statusHistory.push({ status: 'assigned', changedBy: npStaff._id });
    }
    if (status === 'completed') {
      reportData.completedAt = new Date();
      reportData.afterPhoto = `https://picsum.photos/seed/${i + 200}/800/600`;
    }
    reports.push(reportData);
  }
  await Report.insertMany(reports);
  console.log(`✅ Created ${reports.length} sample reports`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:    admin@cleancity.com  / Admin@123');
  console.log('  NP Staff: np@cleancity.com     / Staff@123');
  console.log('  Worker:   worker1@cleancity.com / Worker@123');
  console.log('  Citizen:  citizen@cleancity.com / Citizen@123');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
