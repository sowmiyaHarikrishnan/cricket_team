const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());
let db = null;
const initializeServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeServer();

const convertDBObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
  SELECT *
   FROM cricket_team;`;
  const playerList = await db.all(getPlayerQuery);
  response.send(playerList.map((eachPlayer) => convertDBObject(eachPlayer)));
});

//create table
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
    INSERT INTO 
    cricket_team(player_name, jersey_number, role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Get playerId
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerId = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerId);
  response.send(convertDBObject(player));
});

//update playerDetail
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetail = request.body;
  const { playerName, jerseyNumber, role } = playerDetail;
  const updatePlayerQuery = `
    UPDATE cricket_team
    SET player_name = ${playerName}, jersey_number = ${jerseyNumber}, 
    role= ${role}
    WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE 
    FROM cricket_team
    WHERE player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
