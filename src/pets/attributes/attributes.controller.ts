import { Body, Controller, Post } from "@nestjs/common";
import { AttributesService } from './attributes.service';
import { AttributeDTO } from "./dto/attribute.dto";

@Controller('attribute')
export class AttributesController {
    constructor(private readonly attributesService: AttributesService) { }

    @Post('addAttribute')
    async getAddAttribut(@Body() attributeDTO: AttributeDTO): Promise<string> {
        return this.attributesService.addAttribute(attributeDTO);
    }


}