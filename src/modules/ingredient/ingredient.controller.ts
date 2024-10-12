import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { Ingredient } from './entity/Ingredient.entity';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('IngredientV1')
@Controller({ path: 'ingredient', version: '1' })
export class IngredientControllerV1 {
  constructor(private readonly ingredientService: IngredientService) {}

}
