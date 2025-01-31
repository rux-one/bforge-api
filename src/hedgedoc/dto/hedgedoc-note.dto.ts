import { IsString } from "class-validator";

export class HedgedocNoteDto {
    @IsString()
    content: string
}