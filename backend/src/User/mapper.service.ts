import { Injectable } from '@nestjs/common';

@Injectable()
export class MapperService {
  // This method converts a DTO to an Entity
  dtoToEntity<T extends object, U extends object>(dto: T, entityClass: new () => U): U {
    const entity = new entityClass();
    Object.assign(entity, dto); // This will work because T and U are objects
    return entity;
  }

  // This method converts an Entity to a DTO
  entityToDto<T extends object, U extends object>(entity: T, dtoClass: new () => U): U {
    const dto = new dtoClass();
    Object.assign(dto, entity); // This will work because T and U are objects
    return dto;
  }

  // This method maps a list of entities to a list of DTOs
  listEntitiesToListDtos<T extends object, U extends object>(entities: T[], dtoClass: new () => U): U[] {
    return entities.map((entity) => this.entityToDto(entity, dtoClass));
  }
}
