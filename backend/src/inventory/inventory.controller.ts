import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreatePartRequestDto } from './dto/create-part-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { user_role } from '@prisma/client';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // --- Catálogo ---

  @Post()
  @Roles(user_role.ADMIN)
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @Roles(user_role.ADMIN, user_role.TECH)
  findAll() {
    return this.inventoryService.findAll();
  }
  
  @Get('low-stock')
  @Roles(user_role.ADMIN, user_role.TECH)
  findLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get(':id')
  @Roles(user_role.ADMIN, user_role.TECH)
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  @Roles(user_role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  @Roles(user_role.ADMIN)
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }

  // --- Solicitudes y Transacciones ---

  @Post('requests')
  @Roles(user_role.TECH)
  createRequest(@Request() req: any, @Body() dto: CreatePartRequestDto) {
    const techId = req.user.id; // del JWT payload
    return this.inventoryService.createRequest(techId, dto);
  }

  @Get('requests/all')
  @Roles(user_role.ADMIN, user_role.TECH)
  getRequests() {
    return this.inventoryService.getRequests();
  }

  @Patch('requests/:id/approve')
  @Roles(user_role.ADMIN)
  approveRequest(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.id;
    return this.inventoryService.approveRequest(+id, adminId);
  }

  @Patch('requests/:id/reject')
  @Roles(user_role.ADMIN)
  rejectRequest(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.id;
    return this.inventoryService.rejectRequest(+id, adminId);
  }

  @Get('transactions/all')
  @Roles(user_role.ADMIN, user_role.TECH)
  getTransactions(@Query('appointmentId') appointmentId?: string) {
    return this.inventoryService.getTransactions(appointmentId ? +appointmentId : undefined);
  }
}
