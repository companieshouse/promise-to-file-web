class PromiseError extends Error {
    data: any;
    status: number;
    constructor(data: any, message: string | undefined, status: number) {
        super(message);
        this.data = data;
        this.status = status;
    }

}

export default PromiseError;