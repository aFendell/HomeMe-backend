const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}

const {InMemoryMessageStore} = require("./messageStore");
const messageStore = new InMemoryMessageStore();

const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

function connectSockets(http, session) {
    gIo = require('socket.io')(http);

    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }))


    gIo.on('connection', socket => {
        console.log('New socket - socket.handshake.sessionID', socket.handshake.sessionID)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        if (socket.handshake?.session?.user) socket.join(socket.handshake.session.user._id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })

           
            sessionStore.saveSession(socket.handshake.sessionID, {
                userId: socket.handshake.session.user._id,
                username: socket.handshake.session.user.username,
                fullname: socket.handshake.session.user.fullname,
                connected: true,
                msgs: [] 
            })
        
        // fetch existing users
        const users = []
        const messagesPerUser = [];
        console.log('socket handshake user: ', socket.handshake.session.user.fullname)
        messageStore.findMessagesForUser(socket.handshake.session.user.fullname).forEach((msg) => {
            console.log('loaded msg', msg)
            messagesPerUser.push(msg);
            // const { from, to } = msg;
            // const otherUser = socket.handshake.session.user.fullname === from ? to : from;
            // if (messagesPerUser.includes(otherUser)) {
            //     console.log('otherUser', otherUser, 'msg at the end1', msg)
            //     console.log('messagesPerUser', messagesPerUser)
            // } else {
            //     messagesPerUser.set(otherUser, [msg]);
            //     console.log('msg at the end2', msg)
            //     console.log('messagesPerUser', messagesPerUser)
            // }
        });
        sessionStore.findAllSessions().forEach((session) => {
            // console.log('session connect' , session)
            users.push({
                userId: session.userId,
                username: session.username,
                connected: session.connected,
                fullname: session.fullname,
                msgs: messagesPerUser,
            })
            // console.log('users on connect' , users)
        })
        socket.emit('users', users)

        socket.on('chat topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            console.log('topic change', topic);
            socket.join(topic)
            logger.debug('Session ID is', socket.handshake.sessionID)
            socket.myTopic = topic

            const users = []
            const messagesPerUser = [];
            // console.log('socket handshake user 2: ', socket.handshake.session.user.fullname)
            messageStore.findMessagesForUser(socket.handshake.session.user.fullname).forEach((msg) => {
            console.log('loaded msg 2', msg)
            messagesPerUser.push(msg);
        });

        sessionStore.findAllSessions().forEach((session) => {
            // console.log('session connect 2' , session)
            users.push({
                userId: session.userId,
                username: session.username,
                connected: session.connected,
                fullname: session.fullname,
                msgs: messagesPerUser,
            })
            // console.log('users on connect 2' , users)
        })
        socket.emit('users', users)
        

        })
        socket.on('chat newMsg', msg => {
            console.log('Msg', msg);
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            // console.log('socket.myTopic', socket.myTopic);
            gIo.to(socket.myTopic).emit('chat newMsg', msg)
            // console.log('socket.myTopic', socket.myTopic, 'Msg', msg);
            messageStore.saveMessage(msg);
        });
        socket.on('user-watch', userId => {
            socket.join(userId)
        })
    })
}

function emitToAll({
    type,
    data,
    room = null
}) {
    if (room) gIo.to(room).emit(type, data)
    else gIo.emit(type, data)
}

// TODO: Need to test emitToUser feature
function emitToUser({
    type,
    data,
    userId
}) {
    gIo.to(userId).emit(type, data)
}


// Send to all sockets BUT not the current socket 
function broadcast({
    type,
    data,
    room = null
}) {
    const store = asyncLocalStorage.getStore()
    const {
        sessionId
    } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map')
    if (room) excludedSocket.broadcast.to(room).emit(type, data)
    else excludedSocket.broadcast.emit(type, data)
}


module.exports = {
    connectSockets,
    emitToAll,
    broadcast,
}


// const messagesPerUser = new Map();
// console.log('socket handshake user: ', socket.handshake.session.user.fullname)
// messageStore.findMessagesForUser(socket.handshake.session.user.fullname).forEach((msg) => {
//     console.log('loaded msg', msg)
//     const { from, to } = msg;
//     const otherUser = socket.handshake.session.user.fullname === from ? to : from;
//     if (messagesPerUser.has(otherUser)) {
//         messagesPerUser.get(otherUser).push(msg);
//         console.log('otherUser', otherUser, 'msg at the end1', msg)
//         console.log('messagesPerUser', messagesPerUser)
//     } else {
//         messagesPerUser.set(otherUser, [msg]);
//         console.log('msg at the end2', msg)
//         console.log('messagesPerUser', messagesPerUser)
//     }
// });
// sessionStore.findAllSessions().forEach((session) => {
//     console.log('session connect' , session)
//     users.push({
//         userId: session.userId,
//         username: session.username,
//         connected: session.connected,
//         fullname: session.fullname,
//         msgs: messagesPerUser.get(session.fullname),
//     })
//     console.log('users on connect' , users)


 // socket.on("disconnect", async () => {
        //     const matchingSockets = await gIo.in(socket.handshake.session.user._id).allSockets();
        //     const isDisconnected = matchingSockets.size === 0;
        //     if (isDisconnected) {
        //       // notify other users
        //       socket.broadcast.emit("user disconnected", socket.socket.handshake.session.user._id);
        //       // update the connection status of the session
        //       sessionStore.saveSession(socket.sessionID, {
        //         userId: socket.handshake.session.user._id,
        //         username: socket.handshake.session.user.username,
        //         connected: false,
        //       });
        //     }
        //   });