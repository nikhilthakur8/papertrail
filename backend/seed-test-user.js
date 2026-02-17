import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Paper from './models/Paper.js';

dotenv.config();

const TEST_USER = {
	name: 'Test Account',
	email: 'test@papertrail.com',
	password: 'password123',
	isEmailVerified: true
};

const researchDomains = ['Computer Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'Social Sciences'];
const readingStages = ['Abstract Read', 'Introduction Done', 'Methodology Done', 'Results Analyzed', 'Fully Read', 'Notes Completed'];
const impactScores = ['High Impact', 'Medium Impact', 'Low Impact', 'Unknown'];

const seedTestUser = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('✅ Connected to MongoDB');

		// 1. Create or Update Test User
		let user = await User.findOne({ email: TEST_USER.email });
		if (user) {
			console.log('🔄 Test user already exists, updating...');
			user.name = TEST_USER.name;
			user.password = TEST_USER.password; // This will be hashed by pre-save hook
			user.isEmailVerified = TEST_USER.isEmailVerified;
			await user.save();
		} else {
			console.log('👤 Creating new test user...');
			user = new User(TEST_USER);
			await user.save();
		}

		console.log(`✅ Test User Ready: ${user.email}`);

		// 2. Clear existing papers for this user
		await Paper.deleteMany({ user: user._id });
		console.log('🗑️  Cleared old papers for test user');

		// 3. Generate Mock Papers
		const mockPapers = [
			{
				user: user._id,
				title: 'Attention Is All You Need',
				firstAuthor: 'Ashish Vaswani',
				researchDomain: 'Computer Science',
				readingStage: 'Fully Read',
				citationCount: 105000,
				impactScore: 'High Impact',
				dateAdded: new Date()
			},
			{
				user: user._id,
				title: 'Deep Residual Learning for Image Recognition',
				firstAuthor: 'Kaiming He',
				researchDomain: 'Computer Science',
				readingStage: 'Methodology Done',
				citationCount: 154000,
				impactScore: 'High Impact',
				dateAdded: new Date()
			},
			{
				user: user._id,
				title: 'Language Models are Few-Shot Learners',
				firstAuthor: 'Tom B. Brown',
				researchDomain: 'Computer Science',
				readingStage: 'Abstract Read',
				citationCount: 45000,
				impactScore: 'High Impact',
				dateAdded: new Date()
			},
			{
				user: user._id,
				title: 'A Method for Genetic Programming',
				firstAuthor: 'John R. Koza',
				researchDomain: 'Computer Science',
				readingStage: 'Results Analyzed',
				citationCount: 12000,
				impactScore: 'Medium Impact',
				dateAdded: new Date()
			}
		];

		await Paper.insertMany(mockPapers);
		console.log(`📚 Seeded ${mockPapers.length} papers for test user`);

		console.log('\n✨ Test account seeding completed!');
		console.log(`Email: ${TEST_USER.email}`);
		console.log(`Password: ${TEST_USER.password}`);

	} catch (error) {
		console.error('❌ Error seeding test user:', error);
	} finally {
		await mongoose.disconnect();
		console.log('\n👋 Disconnected from MongoDB');
	}
};

seedTestUser();
