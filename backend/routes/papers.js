import express from 'express';
import Paper from '../models/Paper.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/papers - Add a new paper
router.post('/', async (req, res) => {
  try {
    const { title, firstAuthor, researchDomain, readingStage, citationCount, impactScore, dateAdded } = req.body;
    
    // Validation
    if (!title || !firstAuthor || !researchDomain || !readingStage || citationCount === undefined || !impactScore) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const paper = new Paper({
      user: req.user._id,
      title,
      firstAuthor,
      researchDomain,
      readingStage,
      citationCount: parseInt(citationCount),
      impactScore,
      dateAdded: dateAdded || new Date(),
    });
    
    await paper.save();
    
    res.status(201).json({
      message: 'Paper added successfully',
      paper,
    });
  } catch (error) {
    console.error('Add paper error:', error);
    res.status(500).json({ message: 'Error adding paper', error: error.message });
  }
});

// GET /api/papers - Get all papers for the user with optional filters and pagination
router.get('/', async (req, res) => {
  try {
    const query = { user: req.user._id };
    
    // Apply filters if provided
    const { readingStage, researchDomain, impactScore, dateFilter, page = 1, limit = 10 } = req.query;
    
    // Parse pagination params
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Multi-select filters (comma-separated values)
    if (readingStage) {
      const stages = readingStage.split(',');
      query.readingStage = { $in: stages };
    }
    
    if (researchDomain) {
      const domains = researchDomain.split(',');
      query.researchDomain = { $in: domains };
    }
    
    if (impactScore) {
      const scores = impactScore.split(',');
      query.impactScore = { $in: scores };
    }
    
    // Date filter
    if (dateFilter) {
      const now = new Date();
      let startDate;
      
      switch (dateFilter) {
        case 'this_week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'this_month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'last_3_months':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'all_time':
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.dateAdded = { $gte: startDate };
      }
    }
    
    // Get total count for pagination
    const totalPapers = await Paper.countDocuments(query);
    const totalPages = Math.ceil(totalPapers / limitNum);
    
    // Get paginated papers
    const papers = await Paper.find(query)
      .sort({ dateAdded: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.json({ 
      papers,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPapers,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ message: 'Error fetching papers' });
  }
});

// GET /api/papers/filters - Get filter options with counts
router.get('/filters', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get counts for each filter option
    const [stageCounts, domainCounts, impactCounts] = await Promise.all([
      Paper.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$readingStage', count: { $sum: 1 } } },
      ]),
      Paper.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$researchDomain', count: { $sum: 1 } } },
      ]),
      Paper.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$impactScore', count: { $sum: 1 } } },
      ]),
    ]);
    
    res.json({
      readingStages: stageCounts,
      researchDomains: domainCounts,
      impactScores: impactCounts,
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ message: 'Error fetching filter options' });
  }
});

// GET /api/papers/analytics - Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Funnel data - papers by reading stage
    const funnelData = await Paper.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$readingStage', count: { $sum: 1 } } },
    ]);
    
    // Scatter plot data - papers with citation count grouped by impact score
    const scatterData = await Paper.find({ user: userId })
      .select('title citationCount impactScore')
      .lean();
    
    // Stacked bar chart data - reading stage distribution by domain
    const stackedBarData = await Paper.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { domain: '$researchDomain', stage: '$readingStage' },
          count: { $sum: 1 },
        },
      },
    ]);
    
    // Papers added over time (for line chart) - grouped by month
    const papersOverTime = await Paper.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$dateAdded' },
            month: { $month: '$dateAdded' },
          },
          count: { $sum: 1 },
          totalCitations: { $sum: '$citationCount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    
    // Top authors - papers by first author
    const topAuthors = await Paper.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$firstAuthor',
          paperCount: { $sum: 1 },
          avgCitations: { $avg: '$citationCount' },
          totalCitations: { $sum: '$citationCount' },
        },
      },
      { $sort: { paperCount: -1 } },
      { $limit: 10 },
    ]);
    
    // Impact score distribution
    const impactDistribution = await Paper.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$impactScore',
          count: { $sum: 1 },
          avgCitations: { $avg: '$citationCount' },
        },
      },
    ]);
    
    // Domain comparison - radar chart data
    const domainStats = await Paper.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$researchDomain',
          totalPapers: { $sum: 1 },
          avgCitations: { $avg: '$citationCount' },
          fullyRead: {
            $sum: {
              $cond: [
                { $in: ['$readingStage', ['Fully Read', 'Notes Completed']] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    
    // Reading activity by day of week
    const activityByDay = await Paper.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dayOfWeek: '$dateAdded' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    // Summary statistics
    const totalPapers = await Paper.countDocuments({ user: userId });
    const fullyReadPapers = await Paper.countDocuments({ 
      user: userId, 
      readingStage: { $in: ['Fully Read', 'Notes Completed'] }
    });
    
    const avgCitationsByDomain = await Paper.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$researchDomain',
          avgCitations: { $avg: '$citationCount' },
          totalPapers: { $sum: 1 },
        },
      },
    ]);
    
    const completionRate = totalPapers > 0 
      ? ((fullyReadPapers / totalPapers) * 100).toFixed(1) 
      : 0;
    
    // Total and average citations
    const citationStats = await Paper.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalCitations: { $sum: '$citationCount' },
          avgCitations: { $avg: '$citationCount' },
          maxCitations: { $max: '$citationCount' },
        },
      },
    ]);
    
    res.json({
      funnel: funnelData,
      scatter: scatterData,
      stackedBar: stackedBarData,
      papersOverTime,
      topAuthors,
      impactDistribution,
      domainStats,
      activityByDay,
      summary: {
        totalPapers,
        fullyReadPapers,
        completionRate: parseFloat(completionRate),
        avgCitationsByDomain,
        citationStats: citationStats[0] || { totalCitations: 0, avgCitations: 0, maxCitations: 0 },
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// PATCH /api/papers/:id - Update a paper
router.patch('/:id', async (req, res) => {
  try {
    const paper = await Paper.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    
    const { title, firstAuthor, researchDomain, readingStage, citationCount, impactScore } = req.body;
    
    if (title) paper.title = title;
    if (firstAuthor) paper.firstAuthor = firstAuthor;
    if (researchDomain) paper.researchDomain = researchDomain;
    if (readingStage) paper.readingStage = readingStage;
    if (citationCount !== undefined) paper.citationCount = parseInt(citationCount);
    if (impactScore) paper.impactScore = impactScore;
    
    await paper.save();
    
    res.json({ message: 'Paper updated successfully', paper });
  } catch (error) {
    console.error('Update paper error:', error);
    res.status(500).json({ message: 'Error updating paper' });
  }
});

// DELETE /api/papers/:id - Delete a paper
router.delete('/:id', async (req, res) => {
  try {
    const paper = await Paper.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    
    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Delete paper error:', error);
    res.status(500).json({ message: 'Error deleting paper' });
  }
});

// POST /api/papers/seed - Seed mock papers for the current user
router.post('/seed', async (req, res) => {
  try {
    const userId = req.user._id;

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
      'John Smith', 'Emily Chen', 'Michael Johnson', 'Sarah Williams',
      'David Brown', 'Jennifer Garcia', 'Robert Martinez', 'Lisa Anderson',
      'James Wilson', 'Maria Rodriguez', 'Christopher Lee', 'Amanda Taylor',
      'Daniel Thomas', 'Jessica White', 'Matthew Harris',
    ];

    const paperTitles = [
      // Computer Science
      { title: 'Deep Learning Approaches for Natural Language Understanding', domain: 'Computer Science' },
      { title: 'Scalable Distributed Systems for Real-Time Data Processing', domain: 'Computer Science' },
      { title: 'Quantum Computing: A Survey of Current Algorithms and Applications', domain: 'Computer Science' },
      { title: 'Federated Learning: Privacy-Preserving Machine Learning at Scale', domain: 'Computer Science' },
      { title: 'Transformer Architectures: Evolution and Future Directions', domain: 'Computer Science' },
      { title: 'Explainable AI: Bridging the Gap Between Accuracy and Interpretability', domain: 'Computer Science' },
      // Biology
      { title: 'CRISPR-Cas9 Gene Editing: Recent Advances and Therapeutic Applications', domain: 'Biology' },
      { title: 'Microbiome Analysis Using Next-Generation Sequencing', domain: 'Biology' },
      { title: 'Protein Folding Prediction with AlphaFold: Implications for Drug Discovery', domain: 'Biology' },
      { title: 'Single-Cell RNA Sequencing: Methods and Biological Insights', domain: 'Biology' },
      // Physics
      { title: 'Gravitational Wave Detection: LIGO and Beyond', domain: 'Physics' },
      { title: 'Quantum Entanglement in Condensed Matter Systems', domain: 'Physics' },
      { title: 'Dark Matter Candidates: Theoretical Models and Experimental Constraints', domain: 'Physics' },
      // Chemistry
      { title: 'Green Chemistry: Sustainable Synthesis Pathways for Organic Compounds', domain: 'Chemistry' },
      { title: 'Metal-Organic Frameworks for Carbon Capture and Storage', domain: 'Chemistry' },
      { title: 'Catalytic Mechanisms in Enzymatic Reactions', domain: 'Chemistry' },
      // Mathematics
      { title: 'Topological Data Analysis: Applications in Machine Learning', domain: 'Mathematics' },
      { title: 'Stochastic Differential Equations in Financial Modeling', domain: 'Mathematics' },
      { title: 'Graph Theory Applications in Social Network Analysis', domain: 'Mathematics' },
      // Social Sciences
      { title: 'Impact of Social Media on Political Polarization', domain: 'Social Sciences' },
      { title: 'Economic Effects of Universal Basic Income: A Meta-Analysis', domain: 'Social Sciences' },
      { title: 'Remote Work and Productivity: A Post-Pandemic Assessment', domain: 'Social Sciences' },
    ];

    // Generate a random date within the last 6 months
    const getRandomDate = () => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
      return new Date(randomTime);
    };

    // Generate mock papers
    const mockPapers = paperTitles.map(({ title, domain }) => ({
      user: userId,
      title,
      firstAuthor: randomAuthors[Math.floor(Math.random() * randomAuthors.length)],
      researchDomain: domain,
      readingStage: readingStages[Math.floor(Math.random() * readingStages.length)],
      citationCount: Math.floor(Math.random() * 500) + 10,
      impactScore: impactScores[Math.floor(Math.random() * impactScores.length)],
      dateAdded: getRandomDate(),
    }));

    // Insert mock papers
    const insertedPapers = await Paper.insertMany(mockPapers);

    res.status(201).json({
      message: `Successfully added ${insertedPapers.length} mock papers`,
      count: insertedPapers.length,
    });
  } catch (error) {
    console.error('Seed papers error:', error);
    res.status(500).json({ message: 'Error seeding papers', error: error.message });
  }
});

export default router;
