const bcrypt = require('bcryptjs');

async function generateHashedPassword() {
  const password = 'admin@123'; 
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`🔑 Original password: ${password}`);
    console.log(`✅ Hashed password: ${hash}`);
  } catch (err) {
    console.error('❌ Error generating hash:', err);
  }
}

generateHashedPassword();
