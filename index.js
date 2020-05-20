'use strict';

const MongoClient = require('mongodb').MongoClient;
const ioClient = require('socket.io-client');

async function main() {
    const mongo = await MongoClient.connect(process.env.BTLOGS_MONGO_URI, {
        useUnifiedTopology: true
    });

    const sock = ioClient.connect('https://socket.berrytube.tv', {
        'connect timeout': 4500 + Math.random()*1000,
        'reconnect': true,
        'reconnection delay': 500 + Math.random()*1000,
        'reopen delay': 500 + Math.random()*1000,
        'max reconnection attempts': Number.MAX_SAFE_INTEGER
    });

    async function insert(collection, doc) {
        if (!doc) {
            return;
        }

        doc._time = new Date();
        try {        
            await mongo.db().collection(collection).insertOne(doc);
        } catch (err) {
            console.error('MongoDB', err);
        }
    }

    sock.on('chatMsg', data => {
        if (data && data.ghost) {
            return;
        }
        if (data && data.msg && data.msg.timestamp) {
            data.msg.timestamp = new Date(data.msg.timestamp);
        }
        insert('chatMsg', data);
    });

    sock.on('forceVideoChange', data => {
        if (data && data.video && data.video.videotitle) {
            data.video.videotitle = decodeURIComponent(data.video.videotitle);
        }
        insert('forceVideoChange', data);
    });

    sock.on('newChatList', data => {
        insert('newChatList', { data });
    });
    sock.on('overrideCss', data => {
        insert('overrideCss', { data });
    });
    sock.on('userJoin', data => {
        insert('userJoin', data);
    });
    sock.on('userPart', data => {
        insert('userPart', data);
    });
    sock.on('numConnected', data => {
        insert('numConnected', data);
    });
    sock.on('leaderIs', data => {
        insert('leaderIs', data);
    });
    sock.on('clearPoll', data => {
        insert('clearPoll', data);
    });
    sock.on('shitpost', data => {
        insert('shitpost', data);
    });
    sock.on('forceRefresh', data => {
        insert('forceRefresh', data);
    });
}

main();
