import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SellerProfilesService } from './seller-profiles.service';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';

@Controller('seller-profile')
@UseGuards(JwtAuthGuard)
export class SellerProfilesController {
  constructor(private readonly sellerProfilesService: SellerProfilesService) {}

  @Get()
  async get(@Request() req: any) {
    return this.sellerProfilesService.findByUserId(req.user.id);
  }

  @Put()
  async update(@Request() req: any, @Body() dto: UpdateSellerProfileDto) {
    return this.sellerProfilesService.update(req.user.id, dto);
  }
}
