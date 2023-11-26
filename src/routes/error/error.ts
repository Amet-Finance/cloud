class ErrorV1 {
    private name: string;
    private message: string;
    private stack: string | undefined;
    private code: number;

    constructor(error: Error, code: number) {
        this.name = error.name;
        this.message = error.message;
        this.stack = error.stack;
        this.code = code;
    }


    static throw(message: string, code: number = 400): Error {
        const error = new Error(message)
        throw new ErrorV1(error, code)
    }

}

export default ErrorV1
