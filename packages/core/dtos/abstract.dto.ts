import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';

export class AbstractDto {
  @ApiProperty()
  _id: Schema.Types.ObjectId;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
