// HTTPの番号と、画面に出してよい説明をひとまとめにします。
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
