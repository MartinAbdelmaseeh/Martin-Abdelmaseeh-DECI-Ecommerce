require('dotenv').config();

const app = require('./app');
const prisma = require('./config/prisma');
const { connectMongo } = require('./config/mongo');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  try {
    const [{ current_database, current_user }] = await prisma.$queryRaw`
      SELECT current_database(), current_user;
    `;
    console.log(`✅ Connected as user "${current_user}" to database "${current_database}"!`);
  } catch (err) {
    console.error('❌ Database connection error on startup:', err.message);
  }

  try {
    await connectMongo();
  } catch (err) {
    console.error('❌ MongoDB connection error on startup:', err.message);
    console.error('   Reviews and Statistics endpoints will not work until this is fixed.');
  }
});