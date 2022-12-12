const { log } = require("console");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let vehiculeInfo = {};

const users = [];

// Fake data
const contact = {
  contactEmail: "contact@gmail.com",
  contactNumber: "0160293759",
};

const maintenanceAppointments = [
  {
    id: 1,
    date: new Date("December 13, 2022 15:00:00"),
  },
  {
    id: 2,
    date: new Date("December 15, 2022 10:00:00"),
  },
  {
    id: 3,
    date: new Date("December 16, 2022 13:00:00"),
  },
];

const startChatBot = (socket) => {
  socket.emit("ask_help_type", {
    from: "server",
    txt: `Type d'aide souhaité ?
1 : Vérfier l'enretien de mon véhicule
2 : Avoir des informations sur un véhicule
3 : Avoir des informations de contact
Ou cliquez sur le bouton 'Arreter' pour arreter de discuter`,
  });
};

const sendMessage = (socket, emitType, value) => {
  socket.emit(emitType, value);
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("Anonymous client connected");

  // socket.on("send_nickname", (nickname) => {
  //   console.log(nickname);
  //   socket.nickname = nickname;
  //   users.push({
  //     nickname,
  //   });
  //   socket.emit("welcome_message", {
  //     from: "server",
  //     txt: `You have been connected to the server with nickname : ${socket.nickname}`,
  //   });
  //   console.log("Emit welcome_message");
  //   socket.broadcast.emit("new_user_connection", {
  //     from: "server",
  //     txt: `${socket.nickname} has been connected to server`,
  //   });
  //   console.log("Emit new_user_connection");
  // });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.broadcast.emit("chat message", "A user has been disconnected");
  });

  startChatBot(socket);

  socket.on("reset_bot", () => {
    startChatBot(socket);
  });

  socket.on("send_help_type", (res) => {
    if (res === 1) {
      // socket.emit("ask_vehicule_year", {
      //   from: "server",
      //   txt: "Saisir l'année d'i mmatriculation",
      // });
      sendMessage(socket, "ask_vehicule_year", {
        from: "server",
        txt: "Saisir l'année d'immatriculation",
      });
    } else if (res === 2) {
      console.log("bla");
      sendMessage(socket, "ask_usage_type", {
        from: "server",
        txt: `Type d'usage ?
1 : Routier
2 : Tout terrain
3 : Sportif`,
      });
    } else {
      sendMessage(socket, "ask_contact_type", {
        from: "server",
        txt: `Type de contact ?
1 : Email
2 : Téléphone`,
      });
    }
  });

  socket.on("send_vehicule_year", (res) => {
    vehiculeInfo = {
      ...vehiculeInfo,
      vehiculeYear: res,
    };
    // socket.emit("ask_last_maintenance_date", {
    //   from: "server",
    //   txt: "Saisir la date du dernier entretien",
    //   vehiculeInfo,
    // });
    sendMessage(socket, "ask_last_maintenance_date", {
      from: "server",
      txt: "Saisir la date du dernier entretien",
      vehiculeInfo,
    });
  });

  socket.on("send_last_maintenance_date", (res) => {
    vehiculeInfo = {
      ...vehiculeInfo,
      lastMaintenanceDate: res,
    };
    let yearDiff = Math.abs(
      new Date(vehiculeInfo.lastMaintenanceDate).getFullYear() -
        new Date().getFullYear()
    );
    console.log(yearDiff);
    if (yearDiff > 1) {
      // TODO  choix date de rdv avec calendrier
    } else {
      sendMessage(socket, "ask_km_since_last_maintenance", {
        from: "server",
        txt: "Saisir le nombre de kilomètres parcourus depuis le dernier entretien",
        vehiculeInfo,
      });
      // socket.emit("ask_km_since_last_maintenance", {
      //   from: "server",
      //   txt: "Saisir le nombre de kilomètres parcourus depuis le dernier entretien",
      //   vehiculeInfo,
      // });
    }
  });

  socket.on("send_km_since_maintenance_date", (res) => {
    console.log(res);
    vehiculeInfo = {
      ...vehiculeInfo,
      kmSinceLastMaintenance: res,
    };
    if (vehiculeInfo.kmSinceLastMaintenance >= 10000) {
      console.log("TOOO : demande rdv");
      // TODO rdv
    } else {
      sendMessage(socket, "ask_do_revision", {
        from: "server",
        txt: `Souhaitez-vous effectuer une révision ?
1 : Oui
2 : Non`,
        vehiculeInfo,
      });
      //       socket.emit("ask_do_revision", {
      //         from: "server",
      //         txt: `Souhaitez-vous effectuer une révision ?
      // 1 : Oui
      // 2 : Non`,
      //         vehiculeInfo,
      //       });
    }
  });

  socket.on("send_do_revision", (res) => {
    console.log(res);
    if (res === 1) {
      console.log("TODO : demande rdv");
      // TODO demande rdv
    } else {
      socket.emit("reset_chat");
    }
  });

  // socket.on("chat_message", (msg) => {
  //   console.log(`${socket.nickname} : ${msg}`);
  //   io.emit("chat_message", {
  //     from: socket.nickname,
  //     txt: msg,
  //   });
  // });

  socket.on("send_usage_type", (res) => {
    console.log(res);
    if (res === 1) {
      // TODO demande rdv routier
      socket.emit("reset_chat");
    } else if (res === 2) {
      // TODO demande rdv tout-terrain
      socket.emit("reset_chat");
    } else {
      // TODO demande rdv sportif
      socket.emit("reset_chat");
    }
  });

  socket.on("send_contact_type", (res) => {
    console.log(maintenanceAppointments);
    if (res === 1) {
      sendMessage(socket, "send_contact_email", {
        from: "server",
        txt: `Email : ${contact.contactEmail}`,
      });
    } else {
      sendMessage(socket, "send_contact_number", {
        from: "server",
        txt: `Number : ${contact.contactNumber}`,
      });
    }
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
