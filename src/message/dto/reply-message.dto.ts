import { IsNumber } from 'class-validator';
import { AddMessageDto } from './add-message.dto';

export class ReplyMessageDto extends AddMessageDto {
   @IsNumber()
   repliedMessageId?: number;
}
