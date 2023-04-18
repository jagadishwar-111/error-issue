const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

const dbPath = path.join(__dirname, "/todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at port no:3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API - 1

const hasStatusOnly = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityOnly = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusAndPriorityOnly = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  const requestQuery = request.query;
  const { search_q = "", priority, status } = requestQuery;

  let dbResponse = null;
  let getQuery = null;

  switch (true) {
    case hasStatusOnly(requestQuery):
      getQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND status = "${status}";`;
      break;
    case hasPriorityOnly(requestQuery):
      getQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND priority = "${priority}";`;
      break;
    case hasStatusAndPriorityOnly(requestQuery):
      getQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND status = "${status}" AND priority = "${priority}";`;
      break;
    default:
      getQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%"`;
  }

  dbResponse = await db.all(getQuery);
  response.send(dbResponse);
});

// API - 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const dbResponse = await db.get(getQuery);
  response.send(dbResponse);
});

//API - 3

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  console.log(todoDetails);
  const { id, todo, priority, status } = todoDetails;
  const postQuery = `INSERT INTO todo (id,todo,priority,status) VALUES (${id},${todo},${priority},${status});`;
  const dbResponse = await db.run(postQuery);
  response.send("Todo Successfully Updated");
});

//API - 4
