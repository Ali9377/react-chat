const server = require('http').createServer()

const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
})

const log =console.log

// получаем обработчик событий
const registerMessageHandlers = require('./handlers/messageHandlers')
const registerUserHandlers = require('./handlers/userHandlers')

// данная функция будет выполнятся при подключении каждого соккета
const onConnection = (socket) => {
    log('Пользователь подключён')
    
    // получем название комнаты из строки запроса "рукопожатия" handlers?
    const { roomId } = socket.handsnake.query
    // сохраняем название комнаты в соответствующем свойстве сокета
    socket.roomId = roomId

    // присоединяемся к комнате 
    socket.join(roomId)

    // регистрируем обработчик 
    registerMessageHandlers(io, socket)
    registerUserHandlers(io, socket)

    // обрабатываем отключение сокета-пользователя
    socket.on('disconnect', () => {
        log('Пользователь вышел')
        socket.leave(roomId)
    })
}

io.on('connection', onConnection)

const PORT = process.env.PORT || 5000 
server.listen(PORT, () => {
    console.log(`Сервер запушен. Порт: ${PORT}`)
})