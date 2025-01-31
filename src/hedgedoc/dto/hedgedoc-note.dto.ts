import { IsBoolean, IsString } from "class-validator";

export class HedgedocNoteDto {
    @IsString()
    content: string

    @IsBoolean()
    append: boolean
}