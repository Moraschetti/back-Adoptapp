import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('addUser/:petId')
  async getAddUser(@Body() userDTO: CreateUserDTO, @Param('petId', ParseIntPipe) petId: number): Promise<{ status: number, message: string }> {
    return await this.usersService.addUser(userDTO, petId);
  }

  @Get('all')
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.allUsers();
  }

  @Get(':userId')
  async getUserById(@Param('userId', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.getUserById(userId);
  }

  @Delete('delete/:userEmail')
  async getDeleteUser(@Param('userEmail') userEmail: string): Promise<string> {
    return await this.usersService.deleteUser(userEmail);
  }

  @Delete('removePet/:userEmail/:petId')
  async getDeletePet(@Param('userEmail') userEmail: string, @Param('petId', ParseIntPipe) petId: number): Promise<string> {
    return this.usersService.removePet(userEmail, petId);
  }
}
