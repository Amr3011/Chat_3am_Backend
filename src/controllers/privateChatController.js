


const PrivateChat = require('../models/privateChat');

exports.searchPrivateChat = async (req, res) => {
    try {
        const { userId, searchTerm } = req.query;

        const privateChats = await PrivateChat.find({
            $and: [
                {
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
                },
                {
                    message: { $regex: searchTerm, $options: 'i' } 
                }
            ]
        });

        res.status(200).json({ privateChats });
    } catch (error) {
        res.status(500).json({ message: 'Error searching private chats', error });
    }
};