const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const appointmentService = require("./services/AppointmentService"); 
const AppointmentService = require("./services/AppointmentService");


const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/agendamento", {
    userNewUrlParser: true,
    useUnifiedTopology: true
});


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/cadastro", (req, res) => {
    res.render("create");
});

app.post("/create", async (req, res) => {
    const status = await appointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time
    );

    if (status) {
        res.redirect("/");
    } else {
        res.send("Ocorreu uma falha!");
    }
});

app.get("/getcalendar", async (req, res) => {
    const appointments = await appointmentService.GetAll(false);
    res.json(appointments);
});

app.get("/event/:id", async (req, res) => {
    const appointment = await appointmentService.GetById(req.params.id);
    res.render("event", { appo: appointment });
});

app.post("/finish", async (req, res) => {
    const id = req.body.id;
    await appointmentService.Finish(id);

    res.redirect("/");
});

app.get("/list", async (req, res) => {
    const appos = await AppointmentService.GetAll(true);
    res.render("list", { appos });
});

app.get("/searchresult", async (req, res) => {
    const appos = await AppointmentService.Search(req.query.search);
    res.render("list", { appos });
});

const pollTime = 1000 * 60 * 5;

setInterval(async () => {
    await AppointmentService.SendNotification();
}, pollTime);

app.listen(8080, () => {
    console.log("Running app");
})