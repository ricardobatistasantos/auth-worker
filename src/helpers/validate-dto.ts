import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export async function validateDto(dtoClass: any, input: any) {
  const dto = plainToInstance(dtoClass, input);

  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const details = errors.map((err) => ({
      field: err.property,
      messages: err.constraints ? Object.values(err.constraints) : [],
    }));

    throw new BadRequestException({
      message: 'Erro de validação',
      details: details,
    });
  }
}
