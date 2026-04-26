const express = require('express');
const router = express.Router();
const { getUsers, getWorkers, createUser, updateUser, deleteUser, updateProfile } = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/workers', authenticate, authorize('nagarpalika', 'admin'), getWorkers);
router.get('/', authenticate, authorize('admin'), getUsers);
router.post('/', authenticate, authorize('admin', 'nagarpalika'), createUser);
router.patch('/me', authenticate, updateProfile);
router.patch('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
