import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Paper from './models/Paper.js';

dotenv.config();

const USER_ID = '696b8323cf1337a0471ce899'; // Nikhil Thakur's user ID

const researchDomains = [
  'Computer Science',
  'Biology',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Social Sciences',
];

const readingStages = [
  'Abstract Read',
  'Introduction Done',
  'Methodology Done',
  'Results Analyzed',
  'Fully Read',
  'Notes Completed',
];

const impactScores = ['High Impact', 'Medium Impact', 'Low Impact', 'Unknown'];

const randomAuthors = [
  'John Smith',
  'Emily Chen',
  'Michael Johnson',
  'Sarah Williams',
  'David Brown',
  'Jennifer Garcia',
  'Robert Martinez',
  'Lisa Anderson',
  'James Wilson',
  'Maria Rodriguez',
  'Christopher Lee',
  'Amanda Taylor',
  'Daniel Thomas',
  'Jessica White',
  'Matthew Harris',
];

const paperTitles = [
  // Computer Science
  'Deep Learning Approaches for Natural Language Understanding',
  'Scalable Distributed Systems for Real-Time Data Processing',
  'Quantum Computing: A Survey of Current Algorithms and Applications',
  'Federated Learning: Privacy-Preserving Machine Learning at Scale',
  'Transformer Architectures: Evolution and Future Directions',
  'Explainable AI: Bridging the Gap Between Accuracy and Interpretability',

  // Biology
  'CRISPR-Cas9 Gene Editing: Recent Advances and Therapeutic Applications',
  'Microbiome Analysis Using Next-Generation Sequencing',
  'Protein Folding Prediction with AlphaFold: Implications for Drug Discovery',
  'Single-Cell RNA Sequencing: Methods and Biological Insights',

  // Physics
  'Gravitational Wave Detection: LIGO and Beyond',
  'Quantum Entanglement in Condensed Matter Systems',
  'Dark Matter Candidates: Theoretical Models and Experimental Constraints',

  // Chemistry
  'Green Chemistry: Sustainable Synthesis Pathways for Organic Compounds',
  'Metal-Organic Frameworks for Carbon Capture and Storage',
  'Catalytic Mechanisms in Enzymatic Reactions',

  // Mathematics
  'Topological Data Analysis: Applications in Machine Learning',
  'Stochastic Differential Equations in Financial Modeling',
  'Graph Theory Applications in Social Network Analysis',

  // Social Sciences
  'Impact of Social Media on Political Polarization',
  'Economic Effects of Universal Basic Income: A Meta-Analysis',
  'Remote Work and Productivity: A Post-Pandemic Assessment',
];

// Generate a random date within the last 6 months
const getRandomDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
};

// Generate mock papers
const generateMockPapers = () => {
  const papers = [];

  // Papers by Nikhil Thakur (3 papers)
  const nikhilPapers = [
    {
      user: USER_ID,
      title: 'Deep Learning Approaches for Natural Language Understanding',
      firstAuthor: 'Nikhil Thakur',
      researchDomain: 'Computer Science',
      readingStage: 'Fully Read',
      citationCount: 245,
      impactScore: 'High Impact',
      dateAdded: new Date('2025-12-15'),
    },
    {
      user: USER_ID,
      title: 'Federated Learning: Privacy-Preserving Machine Learning at Scale',
      firstAuthor: 'Nikhil Thakur',
      researchDomain: 'Computer Science',
      readingStage: 'Notes Completed',
      citationCount: 189,
      impactScore: 'High Impact',
      dateAdded: new Date('2025-11-20'),
    },
    {
      user: USER_ID,
      title: 'Explainable AI: Bridging the Gap Between Accuracy and Interpretability',
      firstAuthor: 'Nikhil Thakur',
      researchDomain: 'Computer Science',
      readingStage: 'Results Analyzed',
      citationCount: 156,
      impactScore: 'Medium Impact',
      dateAdded: new Date('2026-01-05'),
    },
  ];

  papers.push(...nikhilPapers);

  // Generate remaining papers with random authors
  const usedTitles = new Set(nikhilPapers.map(p => p.title));

  const remainingTitles = paperTitles.filter(t => !usedTitles.has(t));

  for (const title of remainingTitles) {
    // Determine domain based on title
    let domain;
    if (title.includes('Deep Learning') || title.includes('Computing') || title.includes('AI') ||
      title.includes('Learning') || title.includes('Distributed') || title.includes('Transformer')) {
      domain = 'Computer Science';
    } else if (title.includes('CRISPR') || title.includes('Microbiome') || title.includes('Protein') ||
      title.includes('RNA') || title.includes('Gene')) {
      domain = 'Biology';
    } else if (title.includes('Gravitational') || title.includes('Quantum') || title.includes('Dark Matter')) {
      domain = 'Physics';
    } else if (title.includes('Chemistry') || title.includes('Organic') || title.includes('Metal-Organic') ||
      title.includes('Catalytic')) {
      domain = 'Chemistry';
    } else if (title.includes('Topological') || title.includes('Stochastic') || title.includes('Graph Theory')) {
      domain = 'Mathematics';
    } else {
      domain = 'Social Sciences';
    }

    papers.push({
      user: USER_ID,
      title,
      firstAuthor: randomAuthors[Math.floor(Math.random() * randomAuthors.length)],
      researchDomain: domain,
      readingStage: readingStages[Math.floor(Math.random() * readingStages.length)],
      citationCount: Math.floor(Math.random() * 500) + 10,
      impactScore: impactScores[Math.floor(Math.random() * impactScores.length)],
      dateAdded: getRandomDate(),
    });
  }

  return papers;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing papers for this user
    const deleteResult = await Paper.deleteMany({ user: USER_ID });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing papers`);

    // Generate and insert mock papers
    const mockPapers = generateMockPapers();
    const insertedPapers = await Paper.insertMany(mockPapers);

    console.log(`\n📚 Successfully seeded ${insertedPapers.length} papers:\n`);

    // Summary by domain
    const domainCounts = {};
    const stageCounts = {};
    const impactCounts = {};

    insertedPapers.forEach(paper => {
      domainCounts[paper.researchDomain] = (domainCounts[paper.researchDomain] || 0) + 1;
      stageCounts[paper.readingStage] = (stageCounts[paper.readingStage] || 0) + 1;
      impactCounts[paper.impactScore] = (impactCounts[paper.impactScore] || 0) + 1;
    });

    console.log('📊 By Research Domain:');
    Object.entries(domainCounts).forEach(([domain, count]) => {
      console.log(`   • ${domain}: ${count}`);
    });

    console.log('\n📖 By Reading Stage:');
    Object.entries(stageCounts).forEach(([stage, count]) => {
      console.log(`   • ${stage}: ${count}`);
    });

    console.log('\n⭐ By Impact Score:');
    Object.entries(impactCounts).forEach(([impact, count]) => {
      console.log(`   • ${impact}: ${count}`);
    });

    console.log('\n✨ Database seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

seedDatabase();
