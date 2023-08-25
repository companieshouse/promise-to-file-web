class PromiseError extends Error {
    public data: any;
    public status: number;
    constructor (data: any, message: string | undefined, status: number) {
        super(message);
        this.data = data;
        this.status = status;
    }

}

export default PromiseError;
