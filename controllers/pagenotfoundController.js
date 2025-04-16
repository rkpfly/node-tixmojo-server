const { sendSuccess, sendError } = require('../utils/responseUtils');
const { pagenotfound } = require('../data/pagenotfound');

const getNotFound = async (req, res) => {
  try {
    return sendSuccess(res, pagenotfound);
  } catch (error) {
    console.error('Error getting page not found:', error);
    return sendError(res, 500, 'Failed to get page not found', error);
  }
};

module.exports = {
  getNotFound
};
