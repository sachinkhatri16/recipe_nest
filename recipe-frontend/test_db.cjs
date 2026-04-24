const mongoose = require('mongoose');
require('dotenv').config({ path: '../recipenest_backend/.env' });
const User = require('../recipenest_backend/src/models/User');
const Recipe = require('../recipenest_backend/src/models/Recipe');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');

    const users = await User.find({}).select('name email role status verificationStatus banReason banType createdAt profile.avatar').lean();
    console.log('Users found:', users.length);
    
    // Get recipe counts for chefs
    const chefIds = users.filter((u) => u.role === 'chef').map((u) => u._id);
    const recipeCounts = await Recipe.aggregate([
      { $match: { chef: { $in: chefIds } } },
      { $group: { _id: '$chef', count: { $sum: 1 } } },
    ]);
    console.log('Recipe counts:', recipeCounts);

    const pending = await User.find({
      role: 'chef',
      verificationStatus: 'pending',
    }).select('name email verificationData verificationStatus createdAt profile').lean();
    console.log('Pending found:', pending.length);

    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}
test();
