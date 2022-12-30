const appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const mailer = require("nodemailer");

const Appo = mongoose.model("Appointment", appointment);
const AppointmentFactory = require("../factories/AppointmentFactory");


class AppointmentService {

    async Create(name, email, description, cpf, date, time) {
        const newAppo = new Appo({
            name, email, description, cpf, date, time, finished: false, notified: false
        });

        try {
            await newAppo.save();
            return true;
        } catch(err) {
            console.log(err);
            return false;
        }
    }

    async GetAll(showFinished) {
        if (showFinished) {
            return await Appo.find();
        } else {
            try {
                const appos = await Appo.find({
                    finished: false
                });
                const appointments = [];
                appos.forEach(appointment => {
                    if (appointment.date != "" &&  appointment.date != undefined && appointment.date != " ") {
                        appointments.push(AppointmentFactory.Build(appointment));
                    }
                });
    
                return appointments;
            } catch (err) {
                console.log(err);
                return [];
            }
        }
    }

    async GetById(id) {
        try {
            return await Appo.findOne({_id: id});
        } catch(err) {
            console.log(err);
        }
    }

    async Finish(id) {
        try {
            await Appo.findByIdAndUpdate(id, {
                finished: true
            });
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async Search(query) {
        try {
            return await Appo.find().or([{email: query}, {cpf: query}]);
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async SendNotification() {
        const appos = await this.GetAll(false);

        const transporter = mailer.createTransport({
            host: "host",
            port: "port",
            auth: {
                user: "user",
                pass: "pass"
            }
        });

        appos.forEach(async app => {
            const date = app.start.getTime();
            const hour = 1000 * 60 * 60;
            const gap = date - Date.now();
            if (gap <= hour) {
                if (!app.notified) {
                    await Appo.findByIdAndUpdate(app.id, {notified: true});
                    
                    transporter.sendMail({
                        from: "Consultorio Teste <test@consulta.com.br>",
                        to: app.email,
                        subject: "Sua consulta vai acontecer em breve",
                        conteudo: "Sua consulta vai acontecer em 1 hora!!!!!!!!"
                    }).then(() => {

                    }).catch(err => {

                    });
                }
            }

        });
    }
}

module.exports = new AppointmentService();

