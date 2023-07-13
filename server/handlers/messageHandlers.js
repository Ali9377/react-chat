const { nanoid } = require('nanoid')
// настраиваем бд
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const { Socket } = require('socket.io')

const adapter = new FileSync('db/message.json')
const db = low(adapter)

// записываем в бд начальные данные 
db.defaultss({
    message: [
        {
            message: '1',
            userId: '1',
            senderName: 'Ali',
            messageText: 'Что ты делаешь?',
            createdAt: '2023.07.13'
        },
        {
            message: '2',
            userId: '2',
            senderName: 'Alice',
            messageText: 'Вернись к работе!',
            createdAt: '2023.07.12'
        }
    ]
}).write()

module.exports = (io, socket) => {
    // обрабатываем запрос на получение сообщений
    const getMessages = () => {
        const messages = db.get('messages').value()
        // передаём сообщение пользователям находящимся в комнатн
        io.in(socket.roomId).emit('messages', messages)
    }
    
    // обрабатываем добавление сообщения
    // функция принимает объект сообщения

    const addMessage = (message) => {
        db.get('messages')
        .push({
            // генерируем идинтификатор с помощью nanoid, 8 - длина id
            messageId: nanoid(8),
            createdAt: new Date(),
            ...message
        })
        .write()
    
    getMessages()
    }

    // обрабатываем удаление сообщения
    // функция принимает id сообщения
    const removeMessage = (messageId) => {
        db.get('messages').remove({ messageId }).write()
    
        getMessages()
    }

    // регистрируем обработчики
    socket.on('message:get', getMessages)
    socket.on('message:add', addMessage)
    socket.on('message:remove', removeMessage)
}