// [
//     {field: 'username', message: 'some error'}
// ]

import { FieldError } from '../generated/graphql';

// {
//     username: 'some error'
// }

export const mapFieldErrors = (errors: FieldError[]) => {
  return errors.reduce((accumulatedErrorsObj, error) => {
    return {
      ...accumulatedErrorsObj,
      [error.field]: error.message,
    };
  }, {});
};
