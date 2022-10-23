import { IsString } from 'class-validator';

export class FetchImageDto {
   @IsString()
   url: string;
}
