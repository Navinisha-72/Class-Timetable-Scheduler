const { db } = require('../config/firebaseAdmin');

const adminLogin = async (req, res) => {
    try {
        const { userId, password } = req.body;
        if (!userId || !password) {
            return res.status(400).json({ success: false, message: 'UserId and password required' });
        }

        // Query admin collection for userId
        const adminSnapshot = await db.collection('admin').where('userId', '==', userId).limit(1).get();
        if (adminSnapshot.empty) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const adminDoc = adminSnapshot.docs[0].data();
        const hash = adminDoc.password;
        const match = await bcrypt.compare(password, hash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Auth success, send JWT token with userId
        const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
        return res.status(200).json({ success: true, message: 'Login successful', token });
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

module.exports = { adminLogin };