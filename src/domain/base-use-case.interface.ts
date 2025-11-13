export interface BaseUseCase<Input, Output> {
  execute(param?: Input): Promise<Output>
}
