const { User, Application, Job, Company, Interview } = require('../../models');
const { canAccess } = require('../policies/applicationPolicy');

const getAllApplications = async (req, res) => {
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

const GetSingleApplication = async (req, res) => {
    try {
        const itemRecord = await Application.findOne({
            where: { id: parseInt(req.params.id) },
            include: [
                { model: Job, include: [Company] },
                { model: Interview },
            ],
        });

        if (!itemRecord) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (!canAccess(req.user,itemRecord)) {
            return res.status(403).json({ error: 'Access unauthorized' });
        }

        res.json(itemRecord);
    } catch (error) {
        console.error('application error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getAllApplications,  GetSingleApplication };