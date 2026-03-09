const { User, Application, Job, Company, Interview } = require('../../models');


const applications = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page  = parseInt(req.query.page)  || 1;

        if (limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'limit must be between 1 and 100' });
        }
        if (page < 1) {
            return res.status(400).json({ error: 'page must be 1 or greater' });
        }

        const offset = (page - 1) * limit;

        const userRecord = await User.findOne({ where: { email: req.user.email } });
        if (!userRecord) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { count, rows } = await Application.findAndCountAll({
            where: { user_id: userRecord.id },
            limit,
            offset,
            include: [
                { model: Job, include: [Company] },
                { model: Interview },
            ],
        });

        res.json({
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            applications: rows,
        });
    } catch (error) {
        console.error('allApplications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { applications };