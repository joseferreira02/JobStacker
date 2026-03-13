const { Company, Job } = require('../../models');

const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch company, including the list of jobs they offer
        const company = await Company.findByPk(id, {
            include: [{ model: Job }] // adjust this based on what data frontend needs
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.json(company);
    } catch (error) {
        console.error('getCompanyById error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getCompanyById };
