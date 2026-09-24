import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Role } from '../../common/entities/role.entity.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { RoleService } from './role.service.js';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all roles visible to the current user (seeded + own)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of roles',
    type: PaginatedResponse(Role),
  })
  getRoles(
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.roleService.findAll(paginationQuery, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'The found role', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  getRole(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.roleService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role owned by the current user' })
  @ApiResponse({ status: 201, description: 'Role created', type: Role })
  createRole(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.roleService.createRole(createRoleDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a role you own' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role updated', type: Role })
  @ApiResponse({ status: 403, description: 'Role is read-only (seeded)' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.roleService.updateOne(id, updateRoleDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role you own' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 204, description: 'Role deleted' })
  @ApiResponse({ status: 403, description: 'Role is read-only (seeded)' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async deleteRole(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<void> {
    return this.roleService.deleteOne(id, userId);
  }
}
