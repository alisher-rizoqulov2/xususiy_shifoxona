import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Appointment } from "./models/appointment.model";
import { DoctorService } from "../doctor/doctor.service";
import { PatientsService } from "../patients/patients.service";

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment)
    private readonly Appointmentmodel: typeof Appointment,
    private readonly doctorService: DoctorService,
    private readonly patientsService: PatientsService
  ) {}
  async create(createAppointmentDto: CreateAppointmentDto) {
    const { doctor_id, patient_id } = createAppointmentDto;
    if (doctor_id) {
      const doctor = await this.doctorService.findOne(doctor_id);
      if (!doctor) {
        throw new BadRequestException(`Bunaqa id li doctor topilmadi`);
      }
    }
    if (patient_id) {
      const patient = await this.patientsService.findOne(patient_id);
      if (!patient) {
        throw new BadRequestException(`Bunaqa id li patient topilmadi`);
      }
    }
    return this.Appointmentmodel.create(createAppointmentDto);
  }

  findAll() {
    return this.Appointmentmodel.findAll({ include: { all: true } });
  }

  async findOne(id: number) {
    const appo = await this.Appointmentmodel.findByPk(id);
    if (!appo) {
      throw new NotFoundException("Appo topilmadi");
    }
    return appo;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const appo = await this.Appointmentmodel.findByPk(id);
    if (!appo) {
      throw new BadRequestException(`Appointments topilmadi: ID ${id}`);
    }
    await appo.update(updateAppointmentDto);
    return {
      message: `Appointments muvaffaqiyatli yangilandi: ID ${id}`,
      appo,
    };
  }

  async remove(id: number) {
    const appo = await this.Appointmentmodel.findByPk(id);
    if (!appo) {
      throw new BadRequestException(`Appointments topilmadi: ID ${id}`);
    }
    await appo.destroy();
    return { message: `Appointments muvaffaqiyatli o'chirildi: ID ${id}` };
  }
  async uchrashuvlar(id: number) {
    const doctor = await this.Appointmentmodel.findOne({
      where: { doctor_id: id },
    });

    if (!doctor) {
      throw new BadRequestException("Shifokor topilmadi");
    }

    const patients = await this.Appointmentmodel.findAll({
      where: { doctor_id: id },
      include: { all: true },
    });
    const activePatients: Appointment[] = [];

    for (const patientRecord of patients) {
      if (patientRecord.dataValues.status == "scheduled") {
        activePatients.push(patientRecord);
      }
    }
    return activePatients;
  }
  async bekorqilinganuchrashuvlar(id: number) {
    console.log("salom");
    const doctor = await this.Appointmentmodel.findOne({
      where: { doctor_id: id },
    });

    if (!doctor) {
      throw new BadRequestException("Shifokor topilmadi");
    }

    const patients = await this.Appointmentmodel.findAll({
      where: { doctor_id: id },
      include: { all: true },
    });
    const activePatients: Appointment[] = [];

    for (const patientRecord of patients) {
      if (patientRecord.dataValues.status == "canceled") {
        // console.log(patientRecord.dataValues.status);

        activePatients.push(patientRecord);
      }
    }
    return activePatients;
  }
}
