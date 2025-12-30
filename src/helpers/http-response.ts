export class HttpResponse {
  static success(data: any, message = 'OK', statusCode = 200) {
    return {
      statusCode,
      success: true,
      message,
      data,
      errors: null,
    };
  }

  static created(data: any, message = 'Created') {
    return {
      statusCode: 201,
      success: true,
      message,
      data,
      errors: null,
    };
  }

  static error(message = 'Bad Request', errors = null, statusCode = 400) {
    return {
      statusCode,
      success: false,
      message,
      data: null,
      errors,
    };
  }
}