import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { Ingredient } from './entity/Ingredient.entity';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('ingredient')
@Controller('ingredient')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

}
