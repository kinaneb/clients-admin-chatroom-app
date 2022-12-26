const jwt = require('jsonwebtoken');
const {decode} = require("jsonwebtoken");
require('dotenv').config();

const jwtVerifier = (socket, next) => {
    const token = socket.handshake.auth.token;
    // const request = socket.io.engine.transport.pollXhr.xhr;
    // console.log(`in cookieHeader !: ${request}`);
    // const cookieHeader = request.getResponseHeader("set-cookie");
    // const cookief = socket.handshake;
    // const cookies = coolieParser.parse(socket.handshake.headers.cookie);
        // .parse(socket.handshake.headers.cookie);
    // console.log(`in cookieHeader !: ${cookief}`);
    // if(cookief) {
    //     console.log(`in cookieHeader !: ${cookief}`);
    // }
    // if(cookies) {
    //     console.log(`in cookieHeader: ${cookies}`)
    //
    // }
    // const username = socket.handshake.auth.username;

    if(!token) {
        throw new Error("Unauthorized Client");
    }
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                throw new Error("Unauthorized Client");
            } // forbidden we received un valid token for exist user
            socket.handshake.auth.username = decoded.userInfo.username;
            socket.handshake.auth['roles'] = decoded.userInfo.roles;
        }
    );

    next();
}


module.exports = jwtVerifier;