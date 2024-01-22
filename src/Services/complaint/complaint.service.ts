import { Injectable } from '@nestjs/common';

@Injectable()
export class ComplaintService {
  create(createComplaintDto) {
    return 'This action adds a new complaint';
  }

  findAll() {
    return `This action returns all complaint`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaint`;
  }

  update(id: number, updateComplaintDto) {
    return `This action updates a #${id} complaint`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaint`;
  }
}
