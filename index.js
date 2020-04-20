var express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());
app.use(express.json());

morgan.token("custom", (req, res) => {
  return [
    "morgan",
    req.method,
    req.path,
    res.statusCode,
    JSON.stringify(req.body),
  ].join(" ");
});

app.use(morgan(":custom :response-time ms"));

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-343-1231231",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "123-123123",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "098-9070313",
    id: 4,
  },
];

function generateID() {
  const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;

  return maxId + 1;
}
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  res.send(
    `<div> <p>Phone book has ${
      persons.length
    } people</p> <p>${new Date().toString()}</p></div>`
  );
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((note) => note.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  let listOfNames = persons.map((person) => person.name);
  if (
    listOfNames
      .map((name) => name.toLowerCase())
      .includes(body.name.toLowerCase())
  ) {
    return res.status(400).json({
      error: "name alr exists",
    });
  }

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name or number missing",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateID(),
  };

  persons = persons.concat(person);
  res.json(person);
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
