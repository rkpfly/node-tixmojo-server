const { sendSuccess, sendError } = require('../utils/responseUtils');
const {footer} = require('../data/footer');

const getFooter = async (req, res) => {
  try {
    return sendSuccess(res, footer);
  } catch (error) {
    console.error('Error getting about us:', error);
    return sendError(res, 500, 'Failed to get about us', error);
  }
};

module.exports = {
  getFooter
};
