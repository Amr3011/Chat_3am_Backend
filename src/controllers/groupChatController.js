const GroupChat = require('../models/groupChat');

exports.searchGroupChat = async (req, res) => {
    try {
        const { groupId, searchTerm } = req.query;

        const groupChats = await GroupChat.find({
            groupId,
            message: { $regex: searchTerm, $options: 'i' }
        });

        res.status(200).json({ groupChats });
    } catch (error) {
        res.status(500).json({ message: 'Error searching group chats', error });
    }
};




