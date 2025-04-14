const { sendSuccess, sendError } = require('../utils/responseUtils');
const {aboutUs} = require('../data/aboutus');

const getAboutUs = async (req, res) => {
  try {
    return sendSuccess(res, aboutUs);
  } catch (error) {
    console.error('Error getting about us:', error);
    return sendError(res, 500, 'Failed to get about us', error);
  }
};

module.exports = {
  getAboutUs
};
