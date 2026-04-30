import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { appointment_status } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ReceptionDto } from './dto/reception.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('reception')
  reception(@Body() dto: ReceptionDto) {
    return this.appointmentsService.reception(dto);
  }

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  findAll(
    @Query('status') status?: appointment_status,
    @Query('clientId') clientId?: string,
    @Query('techId') techId?: string,
  ) {
    return this.appointmentsService.findAll({
      status,
      clientId: clientId ? +clientId : undefined,
      techId: techId ? +techId : undefined,
    });
  }

  @Get('my')
  findMy(@Request() req: any) {
    const user = req.user;
    if (user.role === 'CLIENT') {
      return this.appointmentsService.findAll({ clientId: user.id });
    } else if (user.role === 'TECH') {
      return this.appointmentsService.findAll({ techId: user.id });
    }
    return this.appointmentsService.findAll({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.updateStatus(+id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}
