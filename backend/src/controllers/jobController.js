const { Job, Company } = require('../../models');

const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch the job, including related company info
        const job = await Job.findByPk(id, {
            include: [{ model: Company }]
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error('getJobById error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getJobById };
