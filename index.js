const express = require("express");

const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(express.static("build"));
app.use(cors());
app.use(express.json());

const errorHandler = (error, request, response, next) => {
  console.error(">>>", error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Invalid id format" });
  }

  next(error);
};

require("dotenv").config();

const Person = require("./models/person");

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

app.get("/", (req, res) => {
  res.json({ message: "Hello!" });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    console.log(persons);
    res.json(persons.map((person) => person.toJSON()));
  });
});

app.get("/info", (req, res) => {
  res.send(
    `<div> <p>Phone book has ${
      persons.length
    } people</p> <p>${new Date().toString()}</p></div>`
  );
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      next(err);
    });
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  Person.exists({ name: body.name })
    .then((result) => {
      if (result) {
        Person.findOneAndUpdate(
          { name: body.name },
          { $set: { number: body.number } },
          (err, doc) => {
            if (err) {
              return res.status(400).end();
            } else {
              return res.status(200).json({ msg: "user updated", user: doc });
            }
          }
        );
      } else {
        if (!body.name || !body.number) {
          return res.status(400).json({
            error: "name or number missing",
          });
        }

        const person = new Person({
          name: body.name,
          number: body.number,
        });

        person.save().then((savedPerson) => {
          res.json(savedPerson.toJSON());
        });
      }
    })
    .catch((err) => {
      console.log("error occured when checking if user exists:", err);
      return res.send(400);
    });
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

app.use(errorHandler);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
