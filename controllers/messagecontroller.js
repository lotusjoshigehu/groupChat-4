const message = require("../models/message");
const { Op } = require("sequelize");


const sendmessage = async (req, res) => {

  try {
    const { sender, receiver, text } = req.body;

    await message.create({
      sender,
      receiver,
      text
    });

    res.json({ message: "Message saved" });

  } catch (err) {
    res.status(500).json({ message: "Error saving message" });
  }
};

const getmessage = async (req, res) => {

  try {
    const { user1, user2 } = req.query;

    const messages = await message.findAll({
      where: {
        [Op.or]: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 }
        ]
      },
      order: [["createdAt", "ASC"]]
    });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

const getchatusers = async (req, res) => {

  try {
    const { phone } = req.query;

    const messages = await message.findAll({
      where: {
        [Op.or]: [
          { sender: phone },
          { receiver: phone }
        ]
      },
      order: [["createdAt", "DESC"]]
    });

    const users = [];
    const unique = new Set();

    messages.forEach(msg => {

      const otherUser =
        msg.sender === phone ? msg.receiver : msg.sender;

      if (!unique.has(otherUser)) {
        unique.add(otherUser);

        users.push({
          phone: otherUser,
          lastMessage: msg.text,
          time: msg.createdAt
        });
      }
    });

    res.json(users);

  } catch (err) {
    res.status(500).json({ message: "Error loading chats" });
  }
};



module.exports={sendmessage,getmessage,getchatusers}