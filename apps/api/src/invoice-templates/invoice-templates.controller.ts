import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvoiceTemplatesService } from './invoice-templates.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateInvoiceTemplateDto } from './dto/create-invoice-template.dto';
import { UpdateInvoiceTemplateDto } from './dto/update-invoice-template.dto';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class InvoiceTemplatesController {
  constructor(
    private readonly templatesService: InvoiceTemplatesService,
    private readonly invoicesService: InvoicesService,
  ) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.templatesService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.templatesService.findById(id, req.user.id);
  }

  @Post()
  async create(@Body() dto: CreateInvoiceTemplateDto, @Request() req: any) {
    return this.templatesService.create(req.user.id, dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceTemplateDto,
    @Request() req: any,
  ) {
    return this.templatesService.update(id, req.user.id, dto);
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string, @Request() req: any) {
    return this.templatesService.toggle(id, req.user.id);
  }

  @Post(':id/issue-now')
  async issueNow(@Param('id') id: string, @Request() req: any) {
    // Verify ownership
    const template = await this.templatesService.findById(id, req.user.id);
    
    // Create invoice from template
    return this.invoicesService.createFromTemplate(template, req.user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.templatesService.delete(id, req.user.id);
  }
}
